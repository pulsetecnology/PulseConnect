-- Verificar permissões atuais da tabela user_profiles
SELECT grantee, table_name, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
  AND table_name = 'user_profiles' 
  AND grantee IN ('anon', 'authenticated') 
ORDER BY table_name, grantee;

-- Garantir permissões adequadas para a tabela user_profiles
-- Permitir SELECT para role anon (usuários não autenticados)
GRANT SELECT ON user_profiles TO anon;

-- Permitir todas as operações para role authenticated (usuários autenticados)
GRANT ALL PRIVILEGES ON user_profiles TO authenticated;

-- Verificar se RLS está habilitado
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'user_profiles';

-- Habilitar RLS se não estiver habilitado
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS para user_profiles
-- Política para SELECT: usuários podem ver todos os perfis
DROP POLICY IF EXISTS "Users can view all profiles" ON user_profiles;
CREATE POLICY "Users can view all profiles" ON user_profiles
  FOR SELECT USING (true);

-- Política para INSERT: usuários autenticados podem criar seu próprio perfil
DROP POLICY IF EXISTS "Users can create their own profile" ON user_profiles;
CREATE POLICY "Users can create their own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Política para UPDATE: usuários podem atualizar apenas seu próprio perfil
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Política para DELETE: usuários podem deletar apenas seu próprio perfil
DROP POLICY IF EXISTS "Users can delete their own profile" ON user_profiles;
CREATE POLICY "Users can delete their own profile" ON user_profiles
  FOR DELETE USING (auth.uid() = user_id);

-- Verificar permissões após aplicação
SELECT grantee, table_name, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
  AND table_name = 'user_profiles' 
  AND grantee IN ('anon', 'authenticated') 
ORDER BY table_name, grantee;