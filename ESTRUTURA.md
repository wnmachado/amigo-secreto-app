# 📁 Estrutura do Projeto

## Visão Geral

Este projeto foi desenvolvido seguindo as melhores práticas do Next.js 14 com App Router, TypeScript e Tailwind CSS.

## 📂 Estrutura de Diretórios

```
amigo-secreto-app/
├── app/                          # Páginas do Next.js (App Router)
│   ├── layout.tsx               # Layout raiz com AuthProvider
│   ├── page.tsx                  # Página inicial (Home)
│   ├── globals.css               # Estilos globais e Tailwind
│   ├── login/
│   │   └── page.tsx              # Página de login (solicitar código)
│   ├── verificar-codigo/
│   │   └── page.tsx              # Página de verificação OTP
│   ├── dashboard/
│   │   └── page.tsx              # Painel administrativo
│   ├── eventos/
│   │   └── [id]/
│   │       └── page.tsx         # Detalhes do evento (dinâmico)
│   └── nao-autorizado/
│       └── page.tsx              # Página de acesso negado
│
├── components/                    # Componentes reutilizáveis
│   ├── ui/                       # Componentes de UI
│   │   ├── Button.tsx            # Botão com variantes
│   │   ├── Input.tsx             # Campo de entrada
│   │   ├── Textarea.tsx          # Área de texto
│   │   ├── Card.tsx              # Container com sombra
│   │   ├── Modal.tsx             # Modal/Dialog
│   │   ├── OtpInput.tsx          # Input para código OTP
│   │   └── Switch.tsx            # Toggle switch
│   └── ProtectedRoute.tsx        # Componente de proteção de rotas
│
├── contexts/                       # Contextos React
│   └── AuthContext.tsx           # Contexto de autenticação
│
├── services/                     # Camada de serviços/API
│   ├── api.ts                    # Serviços de API (simulados)
│   └── mockStorage.ts            # Armazenamento simulado (localStorage)
│
├── types/                        # Tipos TypeScript
│   └── index.ts                 # Definições de tipos
│
├── package.json                  # Dependências do projeto
├── tsconfig.json                 # Configuração TypeScript
├── tailwind.config.ts            # Configuração Tailwind CSS
├── next.config.js                # Configuração Next.js
├── postcss.config.mjs            # Configuração PostCSS
├── .eslintrc.json                # Configuração ESLint
├── .gitignore                    # Arquivos ignorados pelo Git
├── README.md                      # Documentação principal
├── INSTRUCOES.md                  # Instruções de uso
└── ESTRUTURA.md                   # Este arquivo
```

## 🔑 Componentes Principais

### Páginas

1. **Home (`/`)** - Criação de eventos e entrada no sistema
2. **Login (`/login`)** - Solicitação de código por e-mail
3. **Verificar Código (`/verificar-codigo`)** - Validação do código OTP
4. **Dashboard (`/dashboard`)** - Lista de eventos do usuário
5. **Detalhes do Evento (`/eventos/[id]`)** - Gerenciamento completo do evento
6. **Não Autorizado (`/nao-autorizado`)** - Página de acesso negado

### Componentes UI

- **Button** - Botões com estados de loading e variantes
- **Input** - Campos de entrada com validação
- **Textarea** - Área de texto
- **Card** - Container com estilo
- **Modal** - Modal reutilizável
- **OtpInput** - Input especializado para códigos OTP
- **Switch** - Toggle switch

### Contextos

- **AuthContext** - Gerencia autenticação global do usuário

### Serviços

- **api.ts** - Camada de API simulada (pronta para integração real)
- **mockStorage.ts** - Armazenamento simulado usando localStorage

## 🔄 Fluxo de Dados

```
Usuário → Componente → Serviço → MockStorage → LocalStorage
                ↓
            AuthContext (estado global)
```

## 🎯 Pontos de Integração com Backend

Todos os serviços em `services/api.ts` estão marcados com `TODO` indicando onde fazer a integração:

- `authService.enviarCodigo()` - Integrar com serviço de e-mail
- `authService.verificarCodigo()` - Integrar com validação real de código
- `eventosService.*` - Substituir por chamadas HTTP reais
- `participantesService.*` - Substituir por chamadas HTTP reais
- `sorteioService.realizar()` - Integrar com backend e WhatsApp API

## 📝 Convenções

- **Componentes:** PascalCase (ex: `Button.tsx`)
- **Páginas:** camelCase em pastas (ex: `app/login/page.tsx`)
- **Serviços:** camelCase (ex: `api.ts`)
- **Tipos:** PascalCase (ex: `Evento`, `Participante`)
- **Hooks:** Prefixo `use` (ex: `useAuth`)

## 🎨 Estilização

- **Framework:** Tailwind CSS
- **Tema:** Cores azuis e cinzas (fácil de customizar)
- **Responsividade:** Mobile-first approach
- **Componentes:** Estilizados com classes Tailwind

## 🔐 Autenticação

- Baseada em código OTP de 6 dígitos
- Estado gerenciado via Context API
- Persistência no localStorage
- Proteção de rotas implementada

## 📦 Dependências Principais

- `next` - Framework React
- `react` / `react-dom` - Biblioteca React
- `typescript` - TypeScript
- `tailwindcss` - Framework CSS
- `autoprefixer` / `postcss` - Processamento CSS

## 🚀 Scripts Disponíveis

- `npm run dev` - Servidor de desenvolvimento
- `npm run build` - Build de produção
- `npm run start` - Servidor de produção
- `npm run lint` - Verificação de lint
