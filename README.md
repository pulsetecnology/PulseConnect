# PulseConnect 🚀

> Marketplace mobile-first que conecta freelancers e contratantes para vagas temporárias e prestação de serviços

## 📋 Sobre o Projeto

O PulseConnect é uma plataforma inovadora que resolve o problema da dificuldade de conexão entre prestadores de serviços e contratantes, oferecendo um ambiente seguro e controlado para negociações. Com foco em uma experiência otimizada para dispositivos móveis, a plataforma garante usabilidade e performance em smartphones.

### 🎯 Objetivo

Criar um marketplace confiável que facilite conexões profissionais, aumentando a eficiência do mercado de trabalho freelancer no Brasil.

## ✨ Funcionalidades Principais

### 👥 Perfis de Usuário

- **Freelancer/Prestador**: Candidatar-se a jobs, publicar serviços, receber avaliações
- **Contratante**: Publicar jobs, contratar freelancers, avaliar prestadores
- **Admin**: Gerenciar usuários, jobs, planos e métricas da plataforma

### 📱 Páginas da Aplicação

1. **Página Inicial** - Navegação principal, jobs em destaque, busca rápida
2. **Página de Jobs** - Listagem completa com filtros avançados
3. **Página de Freelancers** - Lista de prestadores com perfis e rankings
4. **Página de Propostas** - Envio e gerenciamento de propostas
5. **Página de Perfil** - Dados pessoais, histórico e plano premium
6. **Página de Avaliações** - Sistema de estrelas e comentários
7. **Dashboard Admin** - Gestão completa da plataforma

## 🛠️ Tecnologias Utilizadas

### Frontend
- **Next.js 14** - Framework React para produção
- **React 18** - Biblioteca para interfaces de usuário
- **TypeScript** - Superset JavaScript com tipagem estática
- **Tailwind CSS 3** - Framework CSS utilitário
- **Zustand** - Gerenciamento de estado
- **Lucide React** - Biblioteca de ícones

### Backend
- **Supabase** - Backend-as-a-Service
  - PostgreSQL Database
  - Authentication Service
  - Storage Service
  - Real-time Service
- **Row Level Security (RLS)** - Segurança a nível de linha

### Autenticação
- **Google OAuth** via Supabase Auth
- **Email/Senha** como método alternativo

### Deploy
- **Vercel** - Deploy do frontend
- **Supabase** - Hospedagem do backend

## 🎨 Design

### Padrão Visual Bancário
- **Cores Primárias**: Azul escuro (#1e3a8a), Azul médio (#3b82f6)
- **Cores Secundárias**: Cinza neutro (#6b7280), Verde sucesso (#10b981)
- **Fontes**: Inter (títulos), Open Sans (corpo do texto)
- **Layout**: Design baseado em cards, navegação superior fixa
- **Responsividade**: Mobile-first com breakpoints otimizados

### Modo Escuro/Claro
Suporte completo a temas com toggle para alternar entre modos.

## 🚀 Como Executar o Projeto

### Pré-requisitos
- Node.js 18+ instalado
- Conta no Supabase
- Conta no Google Cloud (para OAuth)

### Instalação

1. **Clone o repositório**
```bash
git clone https://github.com/seu-usuario/pulseconnect.git
cd pulseconnect
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**
```bash
cp .env.example .env.local
```

Edite o arquivo `.env.local` com suas credenciais:
```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima
SUPABASE_SERVICE_ROLE_KEY=sua_chave_de_servico
```

4. **Configure o banco de dados**
```bash
# Execute as migrações do Supabase
npm run db:migrate
```

5. **Execute o projeto**
```bash
npm run dev
```

Acesse `http://localhost:5173` no seu navegador.

## 📊 Estrutura do Banco de Dados

### Tabelas Principais

- **user_profiles** - Perfis complementares dos usuários
- **jobs** - Vagas e serviços publicados
- **proposals** - Propostas enviadas pelos freelancers
- **reviews** - Sistema de avaliações

### Relacionamentos
- Usuários podem criar múltiplos jobs
- Jobs podem receber múltiplas propostas
- Propostas geram avaliações após conclusão

## 🔐 Segurança

- **Row Level Security (RLS)** habilitado em todas as tabelas
- **Políticas de acesso** granulares por tipo de usuário
- **Autenticação OAuth** segura via Google
- **Validação de dados** no frontend e backend

## 📱 Responsividade

### Breakpoints
- **Mobile**: 320px-768px (design principal)
- **Tablet**: 768px-1024px (adaptação de layout)
- **Desktop**: 1024px+ (expansão de conteúdo)

### Otimizações Mobile
- Touch-friendly interfaces
- Gestos de swipe
- Navegação otimizada para toque
- Performance otimizada para dispositivos móveis

## 🧪 Scripts Disponíveis

```bash
npm run dev          # Executa em modo desenvolvimento
npm run build        # Gera build de produção
npm run start        # Executa build de produção
npm run lint         # Executa linter
npm run type-check   # Verifica tipos TypeScript
npm run db:migrate   # Executa migrações do banco
```

## 📁 Estrutura de Pastas

```
pulseconnect/
├── src/
│   ├── components/     # Componentes reutilizáveis
│   ├── pages/         # Páginas da aplicação
│   ├── contexts/      # Contextos React
│   ├── hooks/         # Hooks customizados
│   ├── lib/           # Utilitários e configurações
│   └── assets/        # Recursos estáticos
├── supabase/
│   └── migrations/    # Migrações do banco de dados
├── api/               # API routes (Express.js)
└── public/            # Arquivos públicos
```

## 🤝 Como Contribuir

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📞 Contato

- **Email**: contato@pulseconnect.com.br
- **Website**: https://pulseconnect.com.br
- **LinkedIn**: [PulseConnect](https://linkedin.com/company/pulseconnect)

## 🙏 Agradecimentos

- [Supabase](https://supabase.com) - Backend-as-a-Service
- [Vercel](https://vercel.com) - Plataforma de deploy
- [Tailwind CSS](https://tailwindcss.com) - Framework CSS
- [Lucide](https://lucide.dev) - Biblioteca de ícones

---

**Desenvolvido com ❤️ para conectar talentos e oportunidades no Brasil**