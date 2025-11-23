# 🎁 Amigo Secreto Online

Aplicativo web para gerenciamento de sorteios de amigo secreto, desenvolvido com Next.js, TypeScript e Tailwind CSS.

## 📋 Funcionalidades

- ✅ Criação de eventos de amigo secreto
- ✅ Autenticação via código de 6 dígitos enviado por e-mail (simulado)
- ✅ Painel administrativo para gerenciar eventos
- ✅ Cadastro e gerenciamento de participantes
- ✅ Confirmação de presença dos participantes
- ✅ Realização de sorteio de amigo secreto
- ✅ Visualização dos resultados do sorteio

## 🚀 Tecnologias

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **React Hooks** (useState, useEffect, useContext)
- **LocalStorage** (para simulação de persistência)

## 📦 Instalação

1. Clone o repositório:
```bash
git clone <url-do-repositorio>
cd amigo-secreto-app
```

2. Instale as dependências:
```bash
npm install
```

3. Execute o servidor de desenvolvimento:
```bash
npm run dev
```

4. Acesse [http://localhost:3000](http://localhost:3000) no navegador.

## 🏗️ Estrutura do Projeto

```
amigo-secreto-app/
├── app/                    # Páginas do Next.js (App Router)
│   ├── page.tsx           # Página inicial (Home)
│   ├── login/             # Página de login
│   ├── verificar-codigo/  # Página de verificação de código OTP
│   ├── dashboard/         # Painel administrativo
│   ├── eventos/[id]/      # Detalhes do evento
│   └── nao-autorizado/    # Página de acesso negado
├── components/             # Componentes reutilizáveis
│   ├── ui/                # Componentes de UI (Button, Input, Card, etc.)
│   └── ProtectedRoute.tsx # Componente de proteção de rotas
├── contexts/              # Contextos React
│   └── AuthContext.tsx   # Contexto de autenticação
├── services/              # Serviços e camada de API
│   ├── api.ts            # Serviços de API (simulados)
│   └── mockStorage.ts    # Armazenamento simulado (localStorage)
└── types/                 # Tipos TypeScript
    └── index.ts          # Definições de tipos
```

## 🔐 Autenticação

O sistema utiliza autenticação baseada em código de 6 dígitos enviado por e-mail:

1. Usuário informa seu e-mail
2. Sistema gera e "envia" um código de 6 dígitos (simulado)
3. Usuário informa o código recebido
4. Sistema valida e autentica o usuário

**Nota:** O envio de e-mail é simulado. Em produção, o código é logado no console do navegador para fins de teste.

## 📝 Fluxo de Uso

### Criar um Evento

1. Na página inicial, preencha o formulário com:
   - Título do evento
   - Data do evento
   - Valor mínimo e máximo do presente
   - Descrição (opcional)
   - E-mail do organizador

2. Após criar, você receberá um código por e-mail (simulado)
3. Informe o código para acessar o painel administrativo

### Gerenciar Evento

1. No painel, clique em "Gerenciar evento"
2. Adicione participantes com nome e WhatsApp
3. Marque a confirmação de presença de cada participante
4. Quando houver pelo menos 2 participantes confirmados, realize o sorteio
5. Visualize os resultados do sorteio

## 🔄 Integração com Backend

O código está preparado para integração com um backend real. Os pontos de integração estão marcados com comentários `TODO` nos seguintes arquivos:

- `services/api.ts` - Todas as funções de API
- `services/mockStorage.ts` - Substituir localStorage por chamadas HTTP
- `contexts/AuthContext.tsx` - Integrar com tokens JWT reais

### Exemplo de Integração

```typescript
// services/api.ts
export const eventosService = {
  criar: async (dados: Omit<Evento, 'id' | 'sorteioRealizado'>): Promise<Evento> => {
    // TODO: Substituir por chamada real
    // const response = await fetch('/api/eventos', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(dados),
    // });
    // return response.json();

    return eventosStorage.create(dados);
  },
};
```

## 🎨 Componentes

O projeto utiliza componentes reutilizáveis localizados em `components/ui/`:

- **Button** - Botões com variantes (primary, secondary, danger, outline)
- **Input** - Campos de entrada com validação
- **Textarea** - Área de texto
- **Card** - Container com sombra
- **Modal** - Modal/dialog
- **OtpInput** - Input para código OTP de 6 dígitos
- **Switch** - Toggle switch

## 📱 Responsividade

O aplicativo é totalmente responsivo e funciona bem em:
- Desktop
- Tablet
- Mobile

## 🧪 Testando

Para testar o fluxo completo:

1. Crie um evento na página inicial
2. Verifique o console do navegador para ver o código gerado
3. Use o código para fazer login
4. Adicione participantes
5. Confirme presenças
6. Realize o sorteio

## 📄 Licença

Este projeto foi desenvolvido como exemplo de aplicação Next.js.

## 🔮 Próximos Passos

- [ ] Integração com backend real
- [ ] Envio real de e-mails
- [ ] Integração com WhatsApp API para envio automático
- [ ] Testes automatizados
- [ ] Deploy em produção
