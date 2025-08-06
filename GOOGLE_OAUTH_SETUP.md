# Configuração do Google OAuth no Supabase

Este documento fornece instruções passo a passo para habilitar a autenticação Google OAuth no seu projeto Supabase.

## Pré-requisitos

- Projeto Supabase criado e configurado
- Conta Google Cloud Platform (GCP)
- Acesso ao dashboard do Supabase

## Passo 1: Configurar Google Cloud Console

### 1.1 Criar um Projeto no Google Cloud

1. Acesse o [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Anote o **Project ID** para uso posterior

### 1.2 Habilitar a Google+ API

1. No Google Cloud Console, vá para **APIs & Services** > **Library**
2. Procure por "Google+ API" ou "Google Identity"
3. Clique em **Enable** para habilitar a API

### 1.3 Configurar OAuth Consent Screen

1. Vá para **APIs & Services** > **OAuth consent screen**
2. Escolha **External** como tipo de usuário
3. Preencha as informações obrigatórias:
   - **App name**: PulseConnect
   - **User support email**: seu-email@exemplo.com
   - **Developer contact information**: seu-email@exemplo.com
4. Clique em **Save and Continue**
5. Em **Scopes**, adicione os escopos necessários:
   - `../auth/userinfo.email`
   - `../auth/userinfo.profile`
6. Continue até finalizar a configuração

### 1.4 Criar Credenciais OAuth 2.0

1. Vá para **APIs & Services** > **Credentials**
2. Clique em **Create Credentials** > **OAuth 2.0 Client IDs**
3. Selecione **Web application** como tipo
4. Configure os URIs:
   - **Name**: PulseConnect Web Client
   - **Authorized JavaScript origins**: 
     - `http://localhost:5173` (para desenvolvimento)
     - `https://seu-dominio.com` (para produção)
   - **Authorized redirect URIs**:
     - `https://seu-projeto.supabase.co/auth/v1/callback`
     - `http://localhost:5173/auth/callback` (para desenvolvimento)
5. Clique em **Create**
6. **Importante**: Anote o **Client ID** e **Client Secret**

## Passo 2: Configurar Supabase

### 2.1 Acessar o Dashboard do Supabase

1. Acesse [Supabase Dashboard](https://app.supabase.com/)
2. Selecione seu projeto
3. Vá para **Authentication** > **Providers**

### 2.2 Habilitar Google Provider

1. Na seção **Auth Providers**, encontre **Google**
2. Clique no toggle para **habilitar** o Google
3. Preencha os campos:
   - **Client ID**: Cole o Client ID obtido do Google Cloud Console
   - **Client Secret**: Cole o Client Secret obtido do Google Cloud Console
4. Clique em **Save**

### 2.3 Configurar URLs de Redirecionamento

1. Ainda em **Authentication** > **Settings**
2. Na seção **Site URL**, configure:
   - **Site URL**: `http://localhost:5173` (desenvolvimento) ou `https://seu-dominio.com` (produção)
3. Na seção **Redirect URLs**, adicione:
   - `http://localhost:5173/auth/callback`
   - `https://seu-dominio.com/auth/callback` (se aplicável)
4. Clique em **Save**

## Passo 3: Testar a Configuração

### 3.1 Verificar no Aplicativo

1. Inicie o servidor de desenvolvimento: `npm run dev`
2. Acesse `http://localhost:5173/auth/login`
3. Clique na aba **Google** no seletor de método de login
4. Clique em **Continuar com Google**
5. Você deve ser redirecionado para a tela de consentimento do Google
6. Após autorizar, deve ser redirecionado de volta para o aplicativo logado

### 3.2 Solução de Problemas Comuns

#### Erro: "Unsupported provider: provider is not enabled"
- Verifique se o Google Provider está habilitado no Supabase
- Confirme se o Client ID e Client Secret estão corretos
- Aguarde alguns minutos para as configurações serem aplicadas

#### Erro: "redirect_uri_mismatch"
- Verifique se as URLs de redirecionamento estão corretas no Google Cloud Console
- Certifique-se de que a URL do Supabase está correta
- Formato correto: `https://seu-projeto.supabase.co/auth/v1/callback`

#### Erro: "invalid_client"
- Verifique se o Client ID e Client Secret estão corretos
- Confirme se a Google+ API está habilitada
- Verifique se o OAuth Consent Screen está configurado corretamente

## Passo 4: Configuração para Produção

### 4.1 Atualizar URLs de Produção

1. No Google Cloud Console, adicione as URLs de produção:
   - **Authorized JavaScript origins**: `https://seu-dominio.com`
   - **Authorized redirect URIs**: `https://seu-dominio.com/auth/callback`

2. No Supabase Dashboard, atualize:
   - **Site URL**: `https://seu-dominio.com`
   - **Redirect URLs**: Adicione `https://seu-dominio.com/auth/callback`

### 4.2 Verificar Configurações de Segurança

1. No Google Cloud Console, revise o OAuth Consent Screen
2. Considere mover para **Internal** se for um aplicativo corporativo
3. Adicione usuários de teste se necessário

## Recursos Adicionais

- [Documentação oficial do Supabase Auth](https://supabase.com/docs/guides/auth)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Supabase Auth with Google](https://supabase.com/docs/guides/auth/social-login/auth-google)

## Suporte

Se você encontrar problemas durante a configuração:

1. Verifique os logs do navegador para erros específicos
2. Consulte a documentação oficial do Supabase
3. Verifique se todas as URLs estão corretas e correspondem entre Google Cloud e Supabase
4. Aguarde alguns minutos após fazer alterações, pois pode haver delay na propagação das configurações

---

**Nota**: Este documento foi criado para o projeto PulseConnect. Adapte as URLs e nomes conforme necessário para seu projeto específico.