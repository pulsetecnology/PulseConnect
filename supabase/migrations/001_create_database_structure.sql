-- Criar tabela de perfis de usuários
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    bio TEXT,
    skills JSONB DEFAULT '[]',
    location VARCHAR(255),
    phone VARCHAR(20),
    plan_type VARCHAR(20) DEFAULT 'free' CHECK (plan_type IN ('free', 'premium')),
    rating_avg DECIMAL(3,2) DEFAULT 0,
    jobs_completed INTEGER DEFAULT 0,
    user_type VARCHAR(20) DEFAULT 'freelancer' CHECK (user_type IN ('freelancer', 'client', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para user_profiles
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_user_profiles_user_type ON user_profiles(user_type);
CREATE INDEX idx_user_profiles_rating ON user_profiles(rating_avg DESC);

-- Criar tabela de jobs
CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    creator_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    budget_min DECIMAL(10,2),
    budget_max DECIMAL(10,2),
    category VARCHAR(100) NOT NULL,
    location VARCHAR(255),
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'completed', 'cancelled')),
    deadline TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para jobs
CREATE INDEX idx_jobs_creator_id ON jobs(creator_id);
CREATE INDEX idx_jobs_category ON jobs(category);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_created_at ON jobs(created_at DESC);

-- Criar tabela de propostas
CREATE TABLE proposals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    freelancer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    proposed_price DECIMAL(10,2) NOT NULL,
    message TEXT,
    delivery_days INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para proposals
CREATE INDEX idx_proposals_job_id ON proposals(job_id);
CREATE INDEX idx_proposals_freelancer_id ON proposals(freelancer_id);
CREATE INDEX idx_proposals_status ON proposals(status);

-- Criar tabela de avaliações
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    reviewer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    reviewed_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para reviews
CREATE INDEX idx_reviews_job_id ON reviews(job_id);
CREATE INDEX idx_reviews_reviewed_id ON reviews(reviewed_id);
CREATE INDEX idx_reviews_rating ON reviews(rating DESC);

-- Habilitar RLS em todas as tabelas
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Políticas para user_profiles
CREATE POLICY "Perfis públicos são visíveis para todos" ON user_profiles
    FOR SELECT USING (true);

CREATE POLICY "Usuários podem atualizar próprio perfil" ON user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir próprio perfil" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Políticas para jobs
CREATE POLICY "Jobs são visíveis para todos" ON jobs
    FOR SELECT USING (true);

CREATE POLICY "Usuários podem criar jobs" ON jobs
    FOR INSERT WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Criadores podem atualizar próprios jobs" ON jobs
    FOR UPDATE USING (auth.uid() = creator_id);

-- Políticas para proposals
CREATE POLICY "Propostas visíveis para criador do job e freelancer" ON proposals
    FOR SELECT USING (
        auth.uid() = freelancer_id OR 
        auth.uid() IN (SELECT creator_id FROM jobs WHERE id = job_id)
    );

CREATE POLICY "Freelancers podem criar propostas" ON proposals
    FOR INSERT WITH CHECK (auth.uid() = freelancer_id);

CREATE POLICY "Freelancers podem atualizar próprias propostas" ON proposals
    FOR UPDATE USING (auth.uid() = freelancer_id);

-- Políticas para reviews
CREATE POLICY "Avaliações são visíveis para todos" ON reviews
    FOR SELECT USING (true);

CREATE POLICY "Usuários podem criar avaliações" ON reviews
    FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

-- Dados iniciais serão inseridos após criação de usuários via aplicação

-- Conceder permissões para roles anon e authenticated
GRANT SELECT ON user_profiles TO anon;
GRANT ALL PRIVILEGES ON user_profiles TO authenticated;

GRANT SELECT ON jobs TO anon;
GRANT ALL PRIVILEGES ON jobs TO authenticated;

GRANT SELECT ON proposals TO anon;
GRANT ALL PRIVILEGES ON proposals TO authenticated;

GRANT SELECT ON reviews TO anon;
GRANT ALL PRIVILEGES ON reviews TO authenticated;