# Condomínio Aurora — Sistema de Gestão de Ocorrências

> Aplicação web moderna para registro, triagem e resolução transparente de ocorrências e manutenções prediais em condomínios residenciais.

---

## 🚀 Sobre o Projeto

O **Condomínio Aurora** simplifica a comunicação entre moradores e a administração do condomínio. Moradores registram ocorrências com fotos e acompanham o andamento pelo mural ou por links diretos, enquanto o síndico gerencia chamados, atualiza status e acompanha métricas em um painel administrativo dedicado.

### Principais Características

- **Acesso Descomplicado para Moradores:** Login direto com número de unidade e código de acesso, sem necessidade de senha complexa.
- **Mural Público e Ocorrências Privadas:** Transparência para questões comunitárias com opção de privacidade quando necessário.
- **Upload de Fotos Integrado:** Envio de até 3 fotos por ocorrência com armazenamento no Supabase Storage.
- **Thread de Atualizações:** Linha do tempo com comentários e respostas oficiais da administração.
- **Painel Administrativo:** Controle de chamados, alteração de status em lote e gerenciamento de unidades/moradores.

---

## 🛠️ Stack Tecnológica

- **Frontend & Backend:** [Next.js 16](https://nextjs.org) (App Router), [React 19](https://react.dev), [TypeScript](https://www.typescriptlang.org)
- **Estilização:** [Tailwind CSS v4](https://tailwindcss.com) e [Lucide Icons](https://lucide.dev)
- **Gerenciamento de Estado & Formulários:** [TanStack React Query v5](https://tanstack.com/query), [React Hook Form](https://react-hook-form.com), [Zod](https://zod.dev)
- **Banco de Dados, Auth & Storage:** [Supabase](https://supabase.com) (PostgreSQL 15+, Supabase Auth SSR, Supabase Storage)
- **Sessão do Morador:** JWT assinado com [`jose`](https://github.com/panva/jose) em cookies HTTP-only

---

## 📋 Pré-requisitos

- **Node.js:** versão 20.x ou superior
- **Gerenciador de Pacotes:** `npm`, `pnpm` ou `yarn`
- **Projeto no Supabase:** conta ativa e projeto criado no [Supabase](https://supabase.com)

---

## ⚙️ Configuração do Ambiente

1. **Clone o repositório:**

   ```bash
   git clone <url-do-repositorio>
   cd condominio-app
   ```

2. **Instale as dependências:**

   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente:**
   Copie o arquivo `.env.example` para `.env`:

   ```bash
   cp .env.example .env
   ```

   Preencha as variáveis com as credenciais do seu projeto Supabase:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key-aqui
   SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key-aqui
   MORADOR_SESSION_SECRET=chave-secreta-min-32-chars-para-jwt-morador
   ```

4. **Execute as Migrations no Supabase:**
   Acesse o SQL Editor do seu projeto Supabase e execute os scripts da pasta `supabase/` na seguinte ordem:
   1. `supabase/01_schema.sql` (criação de tabelas e enums)
   2. `supabase/02_indexes.sql` (índices de busca e ordenação)
   3. `supabase/03_storage.sql` (criação e políticas do bucket `ocorrencias-fotos`)
   4. `supabase/04_rls_policies.sql` (políticas de segurança RLS)
   5. `supabase/05_seed.sql` _(opcional)_ (dados iniciais de teste)

---

## 💻 Executando o Projeto

Para iniciar o servidor de desenvolvimento:

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no navegador para acessar a aplicação.

### Scripts Disponíveis

- `npm run dev` — Inicia o servidor de desenvolvimento Next.js
- `npm run build` — Compila a aplicação para produção
- `npm run start` — Inicia o servidor de produção após o build

---

## 🔑 Acessos de Teste (Seed Data)

Ao aplicar o arquivo `supabase/05_seed.sql`, os seguintes acessos estarão disponíveis:

- **Portal do Morador (`/login`):**
  - Unidade: `101` | Código: `1010`
  - Unidade: `102` | Código: `1020`
  - Unidade: `201` | Código: `2010`
- **Portal Administrativo (`/admin/login`):**
  - Usuário criado no Supabase Auth com permissão de administrador

---
