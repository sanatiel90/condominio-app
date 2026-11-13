# Plano de Implementação — Sistema de Ocorrências para Condomínio

> **Documento de Engenharia & Arquitetura de Software**  
> **Baseado em:** [PRD — Sistema de Ocorrências](file:///c:/Users/Sanatiel/meus_projetos/condominio-app/docs/prd/sistema-ocorrencias-condominio.md) e [Design System — Civic Horizon](file:///c:/Users/Sanatiel/meus_projetos/condominio-app/docs/DESIGN.md)  
> **Stack:** Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS v4 + Shadcn/UI + TanStack Query v5 + Supabase (PostgreSQL, Auth, Storage)  
> **Status:** Implementação Concluída com Sucesso

---

## 1. Visão Geral da Arquitetura & Diretrizes Técnicas

### 1.1 Modelo Híbrido de Autenticação & Sessões
O projeto atende a dois perfis com requisitos de acesso radicalmente diferentes:
1. **Funcionários da Administração (Síndico, Zelador, Portaria):**
   - Autenticação corporativa com e-mail e senha via **Supabase Auth** (`auth.users`).
   - Tabela de espelho/perfil `funcionarios` vinculada a `auth.users.id`.
   - Sessão gerenciada por cookies padrão do `@supabase/ssr`.
   - Acesso exclusivo a rotas administrativas (`/admin/*`) e controle operacional total.
2. **Moradores do Condomínio:**
   - Acesso **sem senha** para eliminar atrito e abandono do canal.
   - O morador informa seu e-mail na tela de entrada (`/login` ou `/morador/login`).
   - O backend valida a existência e o status ativo do morador na tabela `moradores`.
   - Se validado, emite um cookie seguro HTTP-only, assinado criptograficamente (JWT/Web Crypto via `jose` ou `iron-session`), contendo `{ id, nome, email, torre, apartamento, role: 'morador' }`.
   - Acesso ao mural público (`/ocorrencias`), abertura de chamados (`/nova-ocorrencia`), detalhe e envio de comentários (`/ocorrencias/[id]`).
   - Bloqueio imediato caso o morador seja inativado ou tente acessar áreas restritas de `/admin`.

### 1.2 Design System — Tokens e Identidade Visual (Civic Horizon)
Toda a interface implementará os padrões estritos do `docs/DESIGN.md`:
- **Paleta de Cores:**
  - `Primary`: `#00355F` / `#0F4C81` (azul institucional profundo)
  - `Secondary / Neutros`: `#545F72` / `#4A5568`
  - `Surface Canvas`: `#F7FAFC` (fundo suave)
  - `Card Surface`: `#FFFFFF` com sombra suave Level 1 (`0 2px 4px rgba(0,0,0,0.05)`) e borda `#EDF2F7`
  - `Status Semânticos (Pill Badges)`:
    - *Resolvida*: Verde suave (`bg-emerald-50 text-emerald-700 border-emerald-200`)
    - *Aberta / Pendente*: Âmbar suave (`bg-amber-50 text-amber-700 border-amber-200`)
    - *Em Análise / Em Andamento*: Azul institucional (`bg-blue-50 text-sky-800 border-blue-200`)
    - *Cancelada*: Cinza/Vermelho suave (`bg-rose-50 text-rose-700 border-rose-200`)
- **Tipografia:**
  - Títulos/Headings: **Manrope** com *letter-spacing* refinado (`font-heading font-semibold tracking-tight`).
  - Corpo/Labels/Tabelas: **Inter** com numerais tabulares e entrelinhamento legível (`font-sans`).
- **Padrões de Layout:**
  - Funcionário: Sidebar fixa de 240px + Topbar com busca e perfil + Área de trabalho com KPIs + Tabela rica.
  - Morador: Feed unificado mobile-first com cards táteis (mínimo 44px de altura para ações), margens fluidas de 16px.

---

## 2. Modelagem e Scripts de Banco de Dados (`/supabase`)

Seguindo as diretrizes do guia de boas práticas do Supabase (`supabase-postgres-best-practices`), todos os arquivos `.sql` do projeto ficam organizados sequencialmente dentro da pasta `/supabase` na raiz do repositório, garantindo rastreabilidade, versionamento e facilidade de execução manual ou via CI/CD.

### 2.1 Ordem de Execução dos Scripts SQL (`/supabase`)
1. **`01_schema.sql`**: Extensões, enums e estrutura base das tabelas (`funcionarios`, `moradores`, `ocorrencias`, `comentarios`, `historico_status_ocorrencias`) com triggers de `updated_at`.
2. **`02_indexes.sql`**: Índices essenciais para consultas frequentes, índices únicos em lower-case para e-mails e índices em todas as chaves estrangeiras.
3. **`03_storage.sql`**: Criação do bucket `ocorrencias-fotos` no Supabase Storage e suas políticas de acesso a arquivos.
4. **`04_rls_policies.sql`**: Políticas de Row Level Security (RLS) para proteção das tabelas e segregação de permissões entre funcionários, moradores e público.
5. **`05_seed.sql`**: Dados iniciais para testes (moradores cadastrados com unidades, ocorrências de exemplo e comentários para homologação).

---

## 3. Estrutura de Diretórios Proposta

```
condominio-app/
├── supabase/                          # Scripts SQL ordenados de banco de dados
│   ├── 01_schema.sql                  # Enums, tabelas e triggers base
│   ├── 02_indexes.sql                 # Índices de performance e chaves estrangeiras
│   ├── 03_storage.sql                 # Bucket 'ocorrencias-fotos' e permissões
│   ├── 04_rls_policies.sql           # Políticas de Row Level Security (RLS)
│   ├── 05_seed.sql                    # Massa de dados para testes e homologação
│   └── README.md                      # Instruções de execução das migrations
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/                 # Login do morador (e-mail sem senha)
│   │   │   │   └── page.tsx
│   │   │   └── admin/
│   │   │       └── login/             # Login do funcionário (Supabase Auth)
│   │   │           └── page.tsx
│   │   ├── (condominio)/              # Rotas do Morador & Visão Pública Autenticada
│   │   │   ├── layout.tsx             # Header com perfil do morador e navegação
│   │   │   ├── ocorrencias/
│   │   │   │   ├── page.tsx           # Mural de Ocorrências (Feed responsivo)
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx       # Detalhe + Thread de Comentários + Lightbox
│   │   │   └── nova-ocorrencia/
│   │   │       └── page.tsx           # Formulário com upload de foto
│   │   ├── admin/                     # Rotas Administrativas (Sidebar fixa 240px)
│   │   │   ├── layout.tsx             # Layout administrativo com Sidebar + Topbar
│   │   │   ├── page.tsx               # Dashboard com KPIs e tabela de ocorrências
│   │   │   ├── ocorrencias/
│   │   │   │   └── page.tsx           # Gestão completa de ocorrências e moderação
│   │   │   └── moradores/
│   │   │       └── page.tsx           # CRUD e listagem de moradores
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   ├── morador-login/route.ts # Validação de e-mail e emissão de cookie
│   │   │   │   ├── logout/route.ts        # Encerramento de sessão
│   │   │   │   └── me/route.ts            # Retorna perfil da sessão ativa
│   │   │   ├── moradores/route.ts         # GET (filtros) e POST (novo morador)
│   │   │   ├── moradores/[id]/route.ts    # PATCH (editar/inativar morador)
│   │   │   ├── ocorrencias/route.ts       # GET (mural) e POST (criar ocorrência)
│   │   │   ├── ocorrencias/[id]/route.ts  # GET (detalhe), PATCH (status), DELETE (cancelar)
│   │   │   ├── ocorrencias/[id]/comentarios/route.ts # GET e POST comentários
│   │   │   └── upload/route.ts            # Presigned URL ou upload direto para Storage
│   │   ├── globals.css                # Tokens Civic Horizon & Tailwind v4
│   │   └── layout.tsx                 # Providers (TanStack Query, Toaster, Fontes)
│   ├── components/
│   │   ├── ui/                        # Componentes Shadcn (button, card, dialog, table, etc.)
│   │   ├── shared/
│   │   │   ├── status-badge.tsx       # Pill Badge padronizada com cores do Civic Horizon
│   │   │   ├── category-badge.tsx     # Tag de categoria com ícones específicos
│   │   │   ├── image-lightbox.tsx     # Visualizador ampliado de fotos
│   │   │   └── empty-state.tsx        # Estado vazio com CTA
│   │   ├── admin/
│   │   │   ├── admin-sidebar.tsx      # Sidebar de 240px (CondoManager)
│   │   │   ├── admin-topbar.tsx       # Topbar com busca, notificações e usuário
│   │   │   ├── kpi-card.tsx           # Cards numéricos de métricas
│   │   │   ├── moradores-table.tsx    # Tabela rica com busca e paginação
│   │   │   ├── morador-dialog.tsx     # Modal de criação/edição de morador
│   │   │   └── status-update-dialog.tsx # Modal para transição de status e moderação
│   │   └── ocorrencias/
│   │       ├── ocorrencia-card.tsx    # Card do mural para moradores
│   │       ├── ocorrencia-filters.tsx # Barra de filtros combinados (categoria e status)
│   │       ├── ocorrencia-form.tsx    # Formulário de abertura com drag & drop/preview de imagem
│   │       └── comentarios-thread.tsx # Thread cronológica com identificação de autor
│   ├── hooks/
│   │   ├── use-session.ts             # Hook unificado de sessão (morador ou funcionário)
│   │   ├── use-ocorrencias.ts         # Queries e Mutations do TanStack Query
│   │   └── use-moradores.ts           # Queries e Mutations para gestão de moradores
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts              # Supabase browser client
│   │   │   ├── server.ts              # Supabase server client (@supabase/ssr)
│   │   │   └── admin.ts               # Supabase service-role client (para ações administrativas)
│   │   ├── auth/
│   │   │   ├── morador-session.ts     # Encriptação/assinatura de cookie de morador
│   │   │   └── session-guard.ts       # Helpers para Server Components e API routes
│   │   └── validations/
│   │       ├── morador.schema.ts      # Zod schema de morador
│   │       ├── ocorrencia.schema.ts   # Zod schema de ocorrência
│   │       └── comentario.schema.ts   # Zod schema de comentário
│   ├── middleware.ts                  # Controle de acesso e proteção de rotas
│   └── types/
│       └── database.types.ts          # Tipagem TypeScript sincronizada com PostgreSQL
```
│       ├── ocorrencia-filters.tsx     # Barra de filtros combinados (categoria e status)
│       ├── ocorrencia-form.tsx        # Formulário de abertura com drag & drop/preview de imagem
│       └── comentarios-thread.tsx     # Thread cronológica com identificação de autor
├── hooks/
│   ├── use-session.ts                 # Hook unificado de sessão (morador ou funcionário)
│   ├── use-ocorrencias.ts             # Queries e Mutations do TanStack Query
│   └── use-moradores.ts               # Queries e Mutations para gestão de moradores
├── lib/
│   ├── supabase/
│   │   ├── client.ts                  # Supabase browser client
│   │   ├── server.ts                  # Supabase server client (@supabase/ssr)
│   │   └── admin.ts                   # Supabase service-role client (para ações administrativas)
│   ├── auth/
│   │   ├── morador-session.ts         # Encriptação/assinatura de cookie de morador
│   │   └── session-guard.ts           # Helpers para Server Components e API routes
│   └── validations/
│       ├── morador.schema.ts          # Zod schema de morador
│       ├── ocorrencia.schema.ts       # Zod schema de ocorrência
│       └── comentario.schema.ts       # Zod schema de comentário
├── middleware.ts                      # Controle de acesso e proteção de rotas
└── types/
    └── database.types.ts              # Tipagem TypeScript sincronizada com PostgreSQL
```

---

## 4. Detalhamento das Fases & Specs de Implementação

A ordem abaixo cumpre com exatidão a seção 14 do PRD, garantindo que nenhum componente seja construído sem seus alicerces de dados e autenticação prévios.

### Fase 1: Autenticação, Perfis e Gestão de Moradores

#### Tarefa 1.1 — Configuração Inicial e Dependências da Stack
- **Ações:**
  - Instalar dependências essenciais:
    - `@supabase/supabase-js`, `@supabase/ssr`
    - `@tanstack/react-query`, `@tanstack/react-query-devtools`
    - `zod`, `react-hook-form`, `@hookform/resolvers/zod`
    - `lucide-react`, `date-fns`
    - `jose` (para assinatura leve de cookies de morador sem dependências C++ nativas)
    - `sonner` (toasts elegantes conforme UI system)
  - Inicializar componentes Shadcn/UI configurados com o design system *Civic Horizon*:
    - `button`, `input`, `badge`, `card`, `dialog`, `select`, `table`, `textarea`, `dropdown-menu`, `skeleton`, `avatar`, `tabs`, `separator`.
  - Configurar fontes **Manrope** e **Inter** no `src/app/layout.tsx` e integrar variáveis CSS de cores em `src/app/globals.css`.
  - Configurar `QueryClientProvider` no `src/app/providers.tsx`.

#### Tarefa 1.2 — Banco de Dados e Scripts SQL (`/supabase`)
- **Ações:**
  - Criar a pasta `/supabase` na raiz do projeto com os scripts ordenados:
    - `01_schema.sql`: Definição de enums (`user_role`, `status_morador`, `categoria_ocorrencia`, `status_ocorrencia`), tabelas (`funcionarios`, `moradores`, `ocorrencias`, `comentarios`, `historico_status_ocorrencias`), chaves estrangeiras com `ON DELETE`, checks de integridade e triggers automáticos de `updated_at`.
    - `02_indexes.sql`: Criação de todos os índices recomendados (e-mail em minúsculas para login rápido, filtros compostos de status e data para o mural, e chaves estrangeiras).
    - `03_storage.sql`: Criação do bucket `ocorrencias-fotos` no Supabase Storage e definição de políticas para upload de imagens (máx 5MB) e visualização pública.
    - `04_rls_policies.sql`: Habilitação de Row Level Security (RLS) e criação das políticas de segurança para cada perfil (funcionário vs. morador vs. público).
    - `05_seed.sql`: Carga inicial de teste contendo moradores de demonstração, funcionários e ocorrências em diferentes estágios para facilitar a validação.
    - `README.md`: Guia rápido com a ordem de execução no SQL Editor do Supabase ou via CLI.

#### Tarefa 1.3 — Spec 01: Autenticação e Gestão de Sessões
- **Ações:**
  - Implementar utilitário `lib/auth/morador-session.ts`:
    - Funções `createMoradorSession(morador)`, `verifyMoradorSession()`, `clearMoradorSession()`.
    - Cookie HTTP-only, `SameSite=Lax`, `Secure` em produção.
  - Implementar tela de login de morador `src/app/(auth)/login/page.tsx`:
    - Campo de e-mail com validação Zod.
    - Chamada para `/api/auth/morador-login`.
    - Mensagem amigável de erro caso o e-mail não esteja ativo/cadastrado ("E-mail não encontrado. Verifique a digitação ou procure a administração").
  - Implementar tela de login de funcionário `src/app/(auth)/admin/login/page.tsx`:
    - Campos de e-mail e senha corporativos via `supabase.auth.signInWithPassword`.
    - Redirecionamento para `/admin` em caso de sucesso.
  - Implementar `src/middleware.ts`:
    - Interceptar rotas `/admin/*`: exigir sessão Supabase Auth com funcionário registrado; redirecionar não-autenticados para `/admin/login`.
    - Interceptar rotas `/ocorrencias/*` e `/nova-ocorrencia`: exigir sessão de Morador OU sessão de Funcionário.
    - Proteger contra redirecionamento circular e gerenciar logout limpo.

#### Tarefa 1.4 — Spec 02: Gestão e Cadastro de Moradores
- **Ações:**
  - Criar API Routes:
    - `GET /api/moradores`: listagem com paginação e filtro por nome/apto/status.
    - `POST /api/moradores`: criação com validação de unicidade de e-mail (`lower(email)`).
    - `PATCH /api/moradores/[id]`: edição de dados e alternância de status (`ativo` / `inativo`).
  - Criar tela administrativa `src/app/admin/moradores/page.tsx`:
    - Cabeçalho institucional com botão "+ Novo Morador".
    - Barra de busca rápida por nome, apartamento ou e-mail.
    - Tabela rica (`components/admin/moradores-table.tsx`) exibindo Nome, E-mail, Torre, Apartamento, Telefone, Badge de Status e Ações.
    - Modal de Formulário (`components/admin/morador-dialog.tsx`) com validações:
      - Nome (mínimo 3 caracteres)
      - E-mail único e formatado
      - Torre/Bloco e Apartamento obrigatórios
      - Telefone com formatação/máscara
    - Ações de ativar/inativar morador com feedback imediato via Sonner toast.
  - Integrar queries e mutations com TanStack Query para atualização instantânea sem recarga de página.

---

### Fase 2: Núcleo de Ocorrências (Registro e Mural)

#### Tarefa 2.1 — Spec 03: Abertura de Ocorrências com Upload de Foto
- **Ações:**
  - Criar rota de API `POST /api/ocorrencias`:
    - Receber payload validado (Título, Descrição, Categoria, Local, FotoURL).
    - Extrair dados do autor a partir da sessão ativa (Morador autenticado via cookie ou Funcionário via Supabase Auth).
    - Inserir no banco com status `Aberta` e associar `morador_id` ou `funcionario_id`.
  - Criar rota de upload `POST /api/upload`:
    - Validar tamanho máximo (5MB) e tipos permitidos (JPEG, PNG, WEBP).
    - Enviar arquivo para o bucket Supabase `ocorrencias-fotos` gerando nome único (`uuid-timestamp.ext`).
    - Retornar URL pública da imagem.
  - Desenvolver página e formulário `src/app/(condominio)/nova-ocorrencia/page.tsx`:
    - Campos estruturados:
      - Título (5 a 100 caracteres)
      - Categoria (Select com as 6 categorias obrigatórias)
      - Local (texto livre com placeholder contextual, min 3 caracteres)
      - Descrição detalhada (mínimo 10 caracteres)
      - Componente de Upload de Imagem com pré-visualização, progresso e botão para remover arquivo.
    - Bloqueio preventivo no frontend caso o arquivo exceda 5MB.
    - Redirecionamento ao mural com toast de confirmação após a submissão.

#### Tarefa 2.2 — Spec 04: Mural de Ocorrências e Sistema de Filtros
- **Ações:**
  - Criar rota de API `GET /api/ocorrencias`:
    - Suporte a query params: `status`, `categoria`, `busca` (título/local/id), `pagina`, `limite`.
    - Retornar itens ordenados por `created_at DESC`, contagem de comentários e totalizadores.
  - Criar rota de API para KPIs `GET /api/admin/metricas`:
    - Total de ocorrências, pendentes/em análise e resolvidas no mês.
  - Desenvolver Visão do Morador `src/app/(condominio)/ocorrencias/page.tsx`:
    - Layout mobile-first fluido com espaçamentos de 16px e 24px.
    - Barra de filtros rápidos em formato pill/dropdown (todas as categorias e status).
    - Grid/Lista de cards (`components/ocorrencias/ocorrencia-card.tsx`) exibindo:
      - Ícone e tag da categoria
      - Pill Badge de status com as cores do Civic Horizon
      - Título da ocorrência e Local
      - Dados do autor (Nome e Torre/Apto)
      - Miniatura da foto se houver
      - Quantidade de comentários
    - Skeletons animados durante o carregamento e empty state explicativo com botão para criar ocorrência.
  - Desenvolver Visão do Funcionário `src/app/admin/ocorrencias/page.tsx` & `src/app/admin/page.tsx`:
    - Sidebar de 240px fixa com identificação "CondoManager / Residencial Aurora" e botão primário `+ Nova Ocorrência`.
    - Cards de KPIs no topo (`TOTAL DE OCORRÊNCIAS`, `PENDENTES / EM ANÁLISE`, `RESOLVIDAS NO MÊS`).
    - Barra de busca global com input de pesquisa textual.
    - Tabela rica de ocorrências com paginação (`#OC-XXXX`, Categoria com ícone, Local, Data, Status Pill, Botão de Ação para Detalhe).

---

### Fase 3: Interação, Detalhes e Ciclo de Vida

#### Tarefa 3.1 — Spec 05: Visualização de Detalhes e Thread de Comentários
- **Ações:**
  - Criar rota `GET /api/ocorrencias/[id]`:
    - Retornar dados completos da ocorrência, informações do autor, histórico e foto.
  - Criar rota `GET /api/ocorrencias/[id]/comentarios` e `POST /api/ocorrencias/[id]/comentarios`:
    - Gravar comentários de até 1.000 caracteres.
    - Validar autor ativo e gravar identificação de perfil (ex.: "Morador - Torre A Apto 101" vs "Funcionário / Administração").
  - Desenvolver tela de detalhes `src/app/(condominio)/ocorrencias/[id]/page.tsx`:
    - Cabeçalho com identificação `#OC-XXXX`, badge de status em destaque, título, local, autor e data formatada (`dd/MM/yyyy HH:mm`).
    - Descrição completa do problema.
    - Bloco de Foto em destaque:
      - Imagem com proporções preservadas e cantos arredondados (`rounded-lg`).
      - Componente `image-lightbox.tsx`: clique abre visualização em tamanho real em modal escurecido.
    - Seção de Comentários:
      - Timeline cronológica com diferenciação visual nítida entre respostas de moradores e respostas oficiais da administração (com selo de verificação oficial).
      - Formulário de novo comentário com textarea expansível e contador de caracteres (máx. 1.000).
      - Revalidação via TanStack Query (refetch automático e estado de loading no botão "Enviar").

#### Tarefa 3.2 — Spec 06: Moderação e Gestão de Status pelo Painel do Funcionário
- **Ações:**
  - Criar rota de API `PATCH /api/ocorrencias/[id]/status`:
    - Verificação rigorosa de autorização: apenas usuários com sessão de funcionário Supabase válida podem executar.
    - Transição entre os 5 status permitidos (`Aberta`, `Em Análise`, `Em Andamento`, `Resolvida`, `Cancelada`).
    - Registro automático na tabela `historico_status_ocorrencias`.
  - Criar rota de API `DELETE /api/ocorrencias/[id]`:
    - Restrita a funcionários, para cancelamento/exclusão de ocorrências indevidas.
  - Implementar controles na interface:
    - No detalhe da ocorrência: quando acessada por um funcionário, exibir seletor suspenso de status com confirmação e botão "Alterar Status".
    - Modal de confirmação para cancelamento ou exclusão de ocorrência ("Tem certeza que deseja cancelar esta ocorrência? Esta ação ficará registrada no histórico.").
    - Garantir que moradores comuns não recebam nem visualizem os controles de edição de status (aplicar verificação dupla: no componente React e no endpoint de backend/RLS).

---

## 5. Matriz de Rastreabilidade (PRD ➔ Tarefas Técnicas)

| Requisito do PRD | Spec | Componentes / Arquivos de Código | Critério de Aceite Principal |
| :--- | :--- | :--- | :--- |
| **Login Morador sem senha** | Spec 01 | `(auth)/login/page.tsx`, `api/auth/morador-login`, `lib/auth/morador-session.ts` | Morador entra informando apenas e-mail ativo; e-mail inexistente é recusado com mensagem amigável. |
| **Login Funcionário com senha** | Spec 01 | `(auth)/admin/login/page.tsx`, Supabase Auth, `middleware.ts` | Funcionário autentica via senha e tem acesso às rotas `/admin/*`. Morador é barrado do `/admin`. |
| **Gestão de Moradores** | Spec 02 | `admin/moradores/page.tsx`, `morador-dialog.tsx`, `api/moradores` | Funcionário cadastra, edita e inativa moradores com validação de unicidade de e-mail. |
| **Abertura com Upload** | Spec 03 | `nova-ocorrencia/page.tsx`, `ocorrencia-form.tsx`, `api/upload`, Supabase Storage | Formulário com título, local, categoria, descrição e foto opcional até 5MB salva no storage. |
| **Mural de Ocorrências** | Spec 04 | `ocorrencias/page.tsx`, `ocorrencia-card.tsx`, `admin/page.tsx`, `kpi-card.tsx` | Visualização em cards (morador) ou tabela com KPIs (admin), com filtros simultâneos reativos. |
| **Detalhes e Foto Ampliada** | Spec 05 | `ocorrencias/[id]/page.tsx`, `image-lightbox.tsx` | Exibição de informações completas e modal para visualização ampliada da fotografia. |
| **Thread de Comentários** | Spec 05 | `comentarios-thread.tsx`, `api/ocorrencias/[id]/comentarios` | Timeline de comentários em texto puro identificando moradores e respostas oficiais da equipe. |
| **Ciclo de Vida & Status** | Spec 06 | `status-update-dialog.tsx`, `api/ocorrencias/[id]/status` | Apenas funcionários alteram status ou cancelam chamados; histórico registrado e refletido no mural. |

---

## 6. Checklist de Validação & Testes Ponta a Ponta

Para cada funcionalidade entregue, os seguintes testes manuais e automatizados devem ser executados:

1. **Validação de Acesso (Spec 01):**
   - [ ] Tentar login de morador com e-mail não cadastrado ➔ Deve exibir mensagem de erro orientando a administração.
   - [ ] Cadastrar morador e efetuar login com o e-mail cadastrado ➔ Deve redirecionar para `/ocorrencias` e manter sessão ativa após refresh.
   - [ ] Tentar acessar `/admin/moradores` com sessão de morador ➔ Deve redirecionar para `/ocorrencias`.
   - [ ] Efetuar login com credencial de funcionário em `/admin/login` ➔ Deve redirecionar para `/admin`.
2. **Cadastro de Moradores (Spec 02):**
   - [ ] Criar novo morador com e-mail duplicado ➔ Sistema deve bloquear e avisar conflito.
   - [ ] Inativar um morador ➔ Morador inativo deve ser impedido de fazer login imediatamente.
3. **Criação de Ocorrência (Spec 03):**
   - [ ] Submeter formulário sem preencher o Local ➔ Formulário bloqueia e sinaliza o campo.
   - [ ] Tentar anexar arquivo PDF ou imagem > 5MB ➔ Validação impede upload com aviso claro.
   - [ ] Criar ocorrência com imagem válida JPEG/PNG ➔ Registro criado como `Aberta` e imagem visível.
4. **Mural e Filtros (Spec 04):**
   - [ ] Filtrar por categoria "Manutenção" e status "Aberta" ➔ Exibe apenas ocorrências correspondentes.
   - [ ] Limpar filtros ➔ Restaura a listagem completa ordenada pelas mais recentes.
5. **Comentários e Detalhe (Spec 05):**
   - [ ] Clicar no card de ocorrência ➔ Abre a página de detalhes com dados corretos e foto em alta definição.
   - [ ] Clicar na foto ➔ Abre modal lightbox ampliado.
   - [ ] Adicionar comentário como morador ➔ Comentário surge na timeline com tag da unidade.
   - [ ] Adicionar comentário como funcionário ➔ Exibe destaque de resposta oficial da administração.
6. **Controle de Status e Moderação (Spec 06):**
   - [ ] Como funcionário, alterar status de `Aberta` para `Em Andamento` ➔ Atualiza badge no detalhe e no mural.
   - [ ] Como morador, verificar a página de detalhes ➔ Não há botões nem controles de alteração de status.
   - [ ] Como funcionário, cancelar ocorrência via modal de confirmação ➔ Ocorrência passa a figurar como `Cancelada`.

---

## 7. Próximos Passos Imediatos para Início do Desenvolvimento

1. **Configurar variáveis de ambiente** no arquivo `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `MORADOR_SESSION_SECRET`
2. **Executar a migration SQL** no Supabase Dashboard ou via Supabase CLI.
3. **Instalar os pacotes necessários** via npm/pnpm.
4. **Iniciar pela Tarefa 1.1 e 1.2 (Base, Banco e Sessões)**.

