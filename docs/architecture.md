# Architecture & Technical Decisions

> **Última atualização:** 2026-11-16  
> **Status:** Ativo

Este documento detalha as decisões técnicas, camadas arquiteturais e modelo de dados do **Condomínio Aurora**.

---

## 1. Stack Tecnológica

| Camada            | Tecnologia                         | Justificativa                                                       |
| ----------------- | ---------------------------------- | ------------------------------------------------------------------- |
| **Framework**     | Next.js 16 (App Router) + React 19 | Server Components, rotas de API integradas e middleware edge-ready. |
| **Linguagem**     | TypeScript 5                       | Tipagem estrita de ponta a ponta integrada aos schemas do banco.    |
| **Estilização**   | Tailwind CSS v4                    | Compilação de alta performance sem overhead de configuração.        |
| **Estado Remoto** | TanStack React Query v5            | Cache inteligente, mutações e revalidação de dados na UI.           |
| **Formulários**   | React Hook Form + Zod              | Validação declarativa, acessível e segura client/server.            |
| **Feedback UI**   | Sonner                             | Notificações toast leves e customizáveis.                           |
| **Banco / Auth**  | Supabase (PostgreSQL 15+)          | RLS, Storage de imagens, Auth SSR e client admin (service_role).    |
| **Criptografia**  | `jose`                             | Assinatura e verificação de JWTs no Edge Runtime para moradores.    |

---

## 2. Estrutura de Diretórios (`src/`)

```
src/
├── app/
│   ├── (auth)/                  # Rotas públicas de login (/login e /admin/login)
│   ├── (condominio)/            # Painel do morador (/ocorrencias, /nova-ocorrencia)
│   ├── admin/                   # Painel administrativo (/admin, moradores, ocorrencias)
│   ├── api/                     # Route Handlers REST (/api/ocorrencias, /api/auth, etc.)
│   ├── layout.tsx & providers   # Root layout e QueryClientProvider
│   └── globals.css              # Variáveis e temas do Tailwind v4
├── components/
│   ├── admin/                   # Modais, sidebar, topbar e tabelas administrativas
│   ├── ocorrencias/             # Cards de ocorrência, filtros, form e comentários
│   ├── shared/                  # Badges de status/categoria, lightbox, headers
│   └── ui/                      # Primitivos de interface (button, card, dialog, input)
├── hooks/                       # Custom hooks para React Query (useOcorrencias, useSession)
├── lib/
│   ├── auth/                    # Helpers para sessão JWT do morador e guards de rota
│   ├── supabase/                # Clients Supabase (browser client, server SSR e admin client)
│   └── validations/             # Schemas Zod de ocorrência, morador e comentário
├── types/                       # Interfaces TypeScript espelhando o schema PostgreSQL
└── middleware.ts                # Interceptador de autenticação e proteção de rotas
```

---

## 3. Estratégia de Autenticação Dual

O sistema implementa dois mecanismos distintos de autenticação:

```
[Morador]       ---> POST /api/auth/morador-login ---> JWT assinado (jose) ---> Cookie condo_morador_session
[Administrador] ---> Supabase Auth SSR (email/pass)  ---> Tokens Supabase  ---> Cookies sb-*-auth-token
```

1. **Morador (`condo_morador_session`):**
   - Não usa contas do `auth.users`. O morador informa sua unidade e seu `codigo_acesso`.
   - A rota de autenticação valida os dados na tabela pública `moradores` usando o client de serviço do Supabase (`SUPABASE_SERVICE_ROLE_KEY`).
   - Em caso de sucesso, gera um JWT assinado com chave secreta (`MORADOR_SESSION_SECRET`) com validade configurada e salva em cookie HTTP-only.
2. **Administrador (`sb-*-auth-token`):**
   - Utiliza a infraestrutura padrão do Supabase Auth.
   - Gerenciado via `@supabase/ssr` em `src/lib/supabase/server.ts` e `client.ts`.
3. **Middleware (`src/middleware.ts`):**
   - Protege rotas `/admin/*` exigindo cookie do Supabase Auth e redirecionando moradores não autorizados para `/ocorrencias`.
   - Protege rotas `/(condominio)/*` garantindo que o usuário possua sessão ativa de morador ou administrador.

---

## 4. Banco de Dados & Armazenamento (Supabase)

O banco de dados é estruturado em scripts modulares versionados em `supabase/`:

- `01_schema.sql`: Definição de ENUMs (`status_ocorrencia`, `categoria_ocorrencia`, `tipo_usuario`) e tabelas principais:
  - `moradores`: Unidade, bloco, nome, código de acesso e flag `ativo`.
  - `ocorrencias`: Título, descrição, categoria, status, fotos (array de URLs), visibilidade (`is_publica`) e referência a morador.
  - `comentarios`: Histórico de interações associadas à ocorrência, indicando se é resposta oficial.
- `02_indexes.sql`: Índices para otimização de filtros (`idx_ocorrencias_status`, `idx_ocorrencias_categoria`, `idx_ocorrencias_created_at`).
- `03_storage.sql`: Configuração do bucket público `ocorrencias-fotos` com limites de 5MB por arquivo e extensões permitidas (JPEG, PNG, WebP).
- `04_rls_policies.sql`: Políticas de Row Level Security para isolamento e proteção dos registros.
- `05_seed.sql`: Carga de dados iniciais para testes (moradores-modelo, ocorrências simuladas e comentários).

---

## 5. Endpoints de API (`src/app/api/`)

- `POST /api/auth/morador-login`: Valida unidade/código e emite cookie de sessão.
- `GET /api/auth/me`: Retorna os dados do morador ou administrador autenticado.
- `POST /api/auth/logout`: Invalida o cookie de sessão e desloga o usuário.
- `GET /api/ocorrencias`: Lista ocorrências com suporte a paginação e filtros.
- `POST /api/ocorrencias`: Cria nova ocorrência com sanitização e validação Zod.
- `GET | PATCH /api/ocorrencias/[id]`: Consulta detalhes ou atualiza status/campos.
- `GET | POST /api/ocorrencias/[id]/comentarios`: Leitura e criação de comentários.
- `POST /api/upload`: Upload seguro de fotos diretamente para o bucket do Supabase.
- `GET | POST | PATCH /api/moradores`: Gestão de moradores (restrito a administradores).
- `GET /api/admin/metricas`: Agregação de KPIs para o painel de controle.

---

## 6. Decisões de Engenharia & Boas Práticas

- **Validação Dupla:** Todos os dados de entrada são validados na UI e nas rotas de API com schemas Zod compartilhados em `src/lib/validations/`.
- **Service Role Controlado:** O client com privilégios de `service_role` é isolado exclusivamente no backend (`src/lib/supabase/admin.ts`), nunca exposto no client-side.
- **Armazenamento de Imagens:** Fotos são enviadas diretamente ao Supabase Storage sob identificador único gerado via UUID, salvando apenas as URLs públicas no PostgreSQL.
