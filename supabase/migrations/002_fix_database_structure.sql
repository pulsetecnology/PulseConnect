-- Migração para corrigir problemas na estrutura do banco de dados

-- 1. Adicionar campo full_name na tabela user_profiles
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS full_name VARCHAR(255);

-- 2. Adicionar campos que estão sendo usados no código mas não existem na tabela
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS title VARCHAR(255);
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS hourly_rate DECIMAL(10,2);
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS completed_projects INTEGER DEFAULT 0;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS total_reviews INTEGER DEFAULT 0;

-- 3. Corrigir campos na tabela jobs para corresponder ao código
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES auth.users(id);
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS skills_required JSONB DEFAULT '[]'::jsonb;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS budget DECIMAL(10,2);

-- Atualizar client_id com base no creator_id existente
UPDATE jobs SET client_id = creator_id WHERE client_id IS NULL;

-- 4. Corrigir campos na tabela proposals
ALTER TABLE proposals ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES auth.users(id);
ALTER TABLE proposals ADD COLUMN IF NOT EXISTS amount DECIMAL(10,2);
ALTER TABLE proposals ADD COLUMN IF NOT EXISTS delivery_time INTEGER;

-- Copiar dados dos campos antigos para os novos
UPDATE proposals SET amount = proposed_price WHERE amount IS NULL;
UPDATE proposals SET delivery_time = delivery_days WHERE delivery_time IS NULL;

-- 5. Adicionar campo freelancer_id na tabela reviews (se não existir)
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS freelancer_id UUID REFERENCES auth.users(id);

-- Atualizar freelancer_id com base no reviewed_id
UPDATE reviews SET freelancer_id = reviewed_id WHERE freelancer_id IS NULL;

-- 6. Criar índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_type ON user_profiles(user_type);
CREATE INDEX IF NOT EXISTS idx_jobs_client_id ON jobs(client_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_category ON jobs(category);
CREATE INDEX IF NOT EXISTS idx_proposals_job_id ON proposals(job_id);
CREATE INDEX IF NOT EXISTS idx_proposals_freelancer_id ON proposals(freelancer_id);
CREATE INDEX IF NOT EXISTS idx_proposals_client_id ON proposals(client_id);
CREATE INDEX IF NOT EXISTS idx_proposals_status ON proposals(status);
CREATE INDEX IF NOT EXISTS idx_reviews_freelancer_id ON reviews(freelancer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_job_id ON reviews(job_id);

-- 7. Atualizar políticas RLS para incluir os novos campos

-- Política para user_profiles
DROP POLICY IF EXISTS "Users can view all profiles" ON user_profiles;
CREATE POLICY "Users can view all profiles" ON user_profiles
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Política para jobs
DROP POLICY IF EXISTS "Anyone can view open jobs" ON jobs;
CREATE POLICY "Anyone can view open jobs" ON jobs
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create jobs" ON jobs;
CREATE POLICY "Users can create jobs" ON jobs
  FOR INSERT WITH CHECK (auth.uid() = client_id);

DROP POLICY IF EXISTS "Users can update own jobs" ON jobs;
CREATE POLICY "Users can update own jobs" ON jobs
  FOR UPDATE USING (auth.uid() = client_id);

-- Política para proposals
DROP POLICY IF EXISTS "Users can view related proposals" ON proposals;
CREATE POLICY "Users can view related proposals" ON proposals
  FOR SELECT USING (
    auth.uid() = freelancer_id OR 
    auth.uid() = client_id OR
    auth.uid() IN (
      SELECT client_id FROM jobs WHERE id = proposals.job_id
    )
  );

DROP POLICY IF EXISTS "Freelancers can create proposals" ON proposals;
CREATE POLICY "Freelancers can create proposals" ON proposals
  FOR INSERT WITH CHECK (auth.uid() = freelancer_id);

DROP POLICY IF EXISTS "Users can update related proposals" ON proposals;
CREATE POLICY "Users can update related proposals" ON proposals
  FOR UPDATE USING (
    auth.uid() = freelancer_id OR 
    auth.uid() = client_id OR
    auth.uid() IN (
      SELECT client_id FROM jobs WHERE id = proposals.job_id
    )
  );

-- Política para reviews
DROP POLICY IF EXISTS "Anyone can view reviews" ON reviews;
CREATE POLICY "Anyone can view reviews" ON reviews
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create reviews" ON reviews;
CREATE POLICY "Users can create reviews" ON reviews
  FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

-- 8. Garantir permissões para anon e authenticated
GRANT SELECT ON user_profiles TO anon;
GRANT ALL PRIVILEGES ON user_profiles TO authenticated;

GRANT SELECT ON jobs TO anon;
GRANT ALL PRIVILEGES ON jobs TO authenticated;

GRANT SELECT ON proposals TO anon;
GRANT ALL PRIVILEGES ON proposals TO authenticated;

GRANT SELECT ON reviews TO anon;
GRANT ALL PRIVILEGES ON reviews TO authenticated;

-- 9. Criar função para atualizar client_id nas proposals automaticamente
CREATE OR REPLACE FUNCTION update_proposal_client_id()
RETURNS TRIGGER AS $$
BEGIN
  -- Buscar o client_id do job relacionado
  SELECT client_id INTO NEW.client_id
  FROM jobs
  WHERE id = NEW.job_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para atualizar client_id automaticamente
DROP TRIGGER IF EXISTS trigger_update_proposal_client_id ON proposals;
CREATE TRIGGER trigger_update_proposal_client_id
  BEFORE INSERT OR UPDATE ON proposals
  FOR EACH ROW
  EXECUTE FUNCTION update_proposal_client_id();

-- 10. Dados de exemplo removidos para evitar conflitos

COMMIT;