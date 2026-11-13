# PRD — Sistema de Ocorrências para Condomínio

> Tipo: PRD inicial · Data: 2026-11-13
> **Status:** Implementada
>
> <!-- Valores possíveis: "Aguardando implementação" | "Implementada". Atualize para "Implementada" quando todas as specs estiverem concluídas. -->

## 1. Visão geral

O **Sistema de Ocorrências para Condomínio** é uma aplicação web voltada para simplificar a comunicação entre moradores e a administração/equipe de funcionários do condomínio.

A plataforma permite que moradores autorizados registrem ocorrências cotidianas (como problemas de barulho, manutenção, segurança e limpeza), anexem fotos para comprovação, acompanhem as demandas em um mural comunitário transparente e interajam por meio de comentários de texto. Para os funcionários, o sistema disponibiliza um painel de controle administrativo para gerenciar moradores cadastrados, analisar ocorrências, atualizar seus status de atendimento e moderar o fluxo de solicitações.

## 2. Problema que resolve

Hoje, a comunicação de ocorrências em condomínios é frequentemente descentralizada, informal e ineficiente (feita via cadernos de portaria, grupos de WhatsApp ou e-mails dispersos). Isso acarreta:
- Falta de histórico e rastreabilidade sobre quando um problema foi reportado e quem foi o responsável por resolvê-lo.
- Incerteza do morador sobre o andamento e a resolução de sua reclamação.
- Sobrecarga e desorganização da equipe de funcionários e síndico, que perdem tempo consolidando pedidos duplicados ou sem detalhes suficientes.
- Fricção de adoção quando sistemas exigem senhas complexas para os moradores, resultando em esquecimento de credenciais e abandono do canal formal.

O sistema centraliza todas essas solicitações em uma interface clara, direta e acessível via web, eliminando a burocracia de senhas para o morador e oferecendo controle total para a administração.

## 3. Público-alvo

1. **Moradores do Condomínio:**
   - Proprietários ou inquilinos residentes devidamente cadastrados pela administração.
   - Precisam de um canal ágil e descomplicado para reportar problemas e acompanhar o que acontece no condomínio pelo celular ou computador.
2. **Funcionários e Administração do Condomínio:**
   - Zeladores, síndicos, gerentes prediais e portaria (perfil único operacional).
   - Precisam de visão unificada para triar ocorrências, alterar status de resolução, responder moradores e manter o cadastro da comunidade em dia.

## 4. Objetivo do recorte atual

Entregar a versão inicial funcional (V1) da aplicação web com:
- Cadastro prévio de moradores gerenciado pelos funcionários no painel.
- Acesso sem senha para moradores autenticados por e-mail válido existente.
- Acesso administrativo para funcionários via credenciais (e-mail e senha).
- Registro completo de ocorrências com categoria, local em texto livre e upload de foto opcional.
- Mural público de ocorrências com busca e filtros por status e categoria.
- Página de detalhes da ocorrência com histórico de comentários em texto para moradores e funcionários.
- Gestão do ciclo de vida das ocorrências pelos funcionários (mudança de status e cancelamento/exclusão).

## 5. Funcionalidades

### Essenciais:
- **Autenticação diferenciada:** Login tradicional (e-mail e senha) para funcionários; acesso direto sem senha via validação de e-mail cadastrado para moradores.
- **Gestão de Moradores:** Painel para funcionários cadastrarem, listarem e editarem dados de moradores (nome completo, e-mail, torre/bloco, apartamento e telefone).
- **Abertura de Ocorrência:** Formulário para moradores e funcionários registrarem ocorrência com título, descrição, categoria, local e anexo de foto opcional.
- **Mural Público de Ocorrências:** Listagem unificada de ocorrências com visualização de cards, indicadores de status e filtros rápidos por categoria e status.
- **Visualização de Detalhes e Fotos:** Página dedicada exibindo todas as informações da ocorrência, data, autor e foto em tamanho expandido.
- **Comentários na Ocorrência:** Seção de comentários em texto puro abaixo do detalhe da ocorrência, permitindo conversa contínua entre moradores e equipe.
- **Ciclo de Vida de Atendimento:** Controle de status da ocorrência (`Aberta`, `Em Análise`, `Em Andamento`, `Resolvida`, `Cancelada`) e ações de moderação exclusivas para funcionários.

### Desejáveis:
- Notificação visual na tela quando uma nova resposta for publicada em ocorrência acompanhada.
- Paginação ou rolagem infinita otimizada com TanStack Query no mural de ocorrências.

## 6. Fora do escopo

- Níveis hierárquicos múltiplos de funcionários (RBAC complexo como síndico vs zelador vs financeiro) — será adotado perfil único de funcionário.
- Envio de e-mails transacionais (Magic Links, SMTP externo ou notificações por e-mail).
- Notificações push ou integração com WhatsApp/SMS.
- Reserva de áreas comuns (churrasqueira, salão de festas).
- Envio de boletos ou cobrança de taxa condominial.
- Envio de anexos de foto dentro dos comentários (apenas texto será aceito nos comentários).
- Edição ou exclusão de ocorrências por parte dos moradores.

## 7. Regras de negócio

1. **Acesso do Morador:** O morador acessa o sistema informando unicamente seu e-mail. O acesso só é concedido se o e-mail estiver previamente cadastrado e ativo na base de moradores mantida pelos funcionários.
2. **Unicidade de E-mail de Morador:** Não podem existir dois moradores com o mesmo endereço de e-mail no condomínio.
3. **Acesso do Funcionário:** O funcionário deve se autenticar via e-mail e senha no Supabase Auth.
4. **Visibilidade Comunitária (Mural):** Todas as ocorrências cadastradas possuem visibilidade pública entre os usuários autenticados (moradores e funcionários têm acesso à listagem e aos comentários).
5. **Categorias Fechadas:** Toda ocorrência deve pertencer obrigatoriamente a uma das categorias: `Barulho`, `Manutenção`, `Segurança`, `Limpeza`, `Convivência` ou `Outros`.
6. **Local da Ocorrência:** Campo de texto livre obrigatório (mínimo de 3 caracteres) para indicar com precisão onde o problema ocorreu (ex.: "Elevador Social Torre A", "Garagem G2 vaga 45", "Hall do 3º andar").
7. **Foto Opcional:** O anexo de foto é opcional na criação da ocorrência. Caso enviada, o arquivo deve ser validado para formatos de imagem e tamanho máximo seguro.
8. **Imutabilidade pelo Morador:** Uma vez submetida, a ocorrência não pode ser editada nem excluída pelo morador. Correções ou informações adicionais devem ser incluídas via comentários.
9. **Transição de Status:** Apenas funcionários autenticados podem alterar o status de uma ocorrência (`Aberta` ➔ `Em Análise` ➔ `Em Andamento` ➔ `Resolvida` / `Cancelada`).
10. **Cancelamento e Exclusão:** Apenas funcionários possuem permissão para cancelar ou excluir ocorrências indevidas.
11. **Autoria dos Comentários:** Todo comentário deve registrar e exibir claramente o nome do autor, a data/hora e o tipo de papel (Morador com Torre/Apto ou Funcionário).

## 8. Fluxos principais

### Fluxo 1 — Acesso do Morador
1. O morador entra na página inicial e clica no acesso para moradores.
2. Informa seu e-mail e clica em "Entrar".
3. O sistema valida se o e-mail está na lista de moradores cadastrados.
4. Se encontrado, a sessão do morador é estabelecida e ele é redirecionado para o Mural de Ocorrências.
5. Se não encontrado, exibe mensagem clara orientando a procurar a administração.

### Fluxo 2 — Acesso do Funcionário
1. O funcionário acessa a rota administrativa (`/admin` ou `/login`).
2. Digita seu e-mail e senha institucional.
3. O sistema valida as credenciais via Supabase Auth.
4. Em caso de sucesso, o funcionário entra no Dashboard Administrativo.

### Fluxo 3 — Cadastro de Morador (pela Administração)
1. O funcionário logado acessa a aba "Moradores" no Dashboard.
2. Clica em "Novo Morador".
3. Preenche nome completo, e-mail, torre/bloco, apartamento e telefone.
4. O sistema valida os campos e a unicidade do e-mail.
5. O morador é salvo e já fica habilitado a acessar o sistema.

### Fluxo 4 — Abertura de Ocorrência pelo Morador
1. O morador autenticado clica em "Nova Ocorrência".
2. Preenche o formulário: Título, Categoria (seleção), Local (texto livre), Descrição detalhada e anexa uma foto opcional.
3. Submete o formulário. O sistema faz upload da imagem no Supabase Storage (se houver) e grava o registro com status inicial `Aberta`.
4. O morador é redirecionado para a página da ocorrência criada ou para o mural com feedback de sucesso.

### Fluxo 5 — Consulta e Interação no Mural
1. O usuário (morador ou funcionário) navega pelo mural.
2. Utiliza os filtros de status ou categoria para refinar a busca.
3. Clica em um card de ocorrência para abrir a tela de detalhes.
4. Visualiza a descrição, autor, local, status e foto.
5. Na área inferior, digita uma mensagem na caixa de texto e clica em "Comentar".
6. O comentário é salvo e atualizado instantaneamente na tela.

### Fluxo 6 — Gestão e Resolução da Ocorrência pelo Funcionário
1. O funcionário visualiza a ocorrência no painel ou no detalhe.
2. Seleciona o novo status (ex.: muda de `Aberta` para `Em Andamento`).
3. Opcionalmente adiciona um comentário explicando a ação tomada (ex.: "Técnico de elevador acionado").
4. Ao concluir o serviço, altera o status para `Resolvida`.
5. Todos os moradores passam a ver o status atualizado no mural.

## 9. Critérios de aceite

- O sistema deve impedir o acesso de moradores com e-mails não cadastrados previamente.
- O sistema deve manter a sessão do morador ativa de forma persistente e amigável.
- O sistema deve exigir autenticação com senha para acesso ao dashboard de funcionários.
- O funcionário deve conseguir cadastrar novos moradores informando nome, e-mail, torre, apartamento e telefone.
- O sistema não deve permitir o cadastro de dois moradores com o mesmo e-mail.
- O morador deve conseguir criar uma ocorrência com ou sem foto anexa.
- O sistema deve armazenar a imagem enviada em storage seguro e exibir a imagem associada no detalhe da ocorrência.
- Todos os usuários autenticados devem conseguir visualizar todas as ocorrências cadastradas no mural.
- O usuário deve conseguir filtrar ocorrências simultaneamente por categoria e por status.
- Qualquer usuário autenticado (morador ou funcionário) deve conseguir postar comentários em texto em qualquer ocorrência aberta.
- O sistema deve bloquear qualquer tentativa de morador de alterar o status, editar o conteúdo ou excluir uma ocorrência.
- Apenas funcionários devem ter acesso aos controles de alteração de status e exclusão de ocorrências.

## 10. Stack

- **Frontend & Framework:** Next.js 16 (App Router) + React 19 + TypeScript
- **Estilização & UI:** Tailwind CSS v4 + Shadcn/UI (Radix Primitives)
- **Design System & Identidade Visual:** Especificação definida em [**`docs/DESIGN.md`**](file:///c:/Users/Sanatiel/meus_projetos/condominio-app/docs/DESIGN.md) (Tema *Civic Horizon*)
- **Gerenciamento de Estado & Cache Assíncrono:** TanStack Query (React Query)
- **Backend, Banco de Dados & Storage:** Supabase (PostgreSQL para dados relacionais, Supabase Storage para fotos de ocorrências e Supabase Auth para funcionários)

## 10.1 Diretrizes de UI e Design System (Referência: docs/DESIGN.md)

Toda a interface da aplicação deve seguir rigorosamente a especificação visual e os tokens documentados em [**`docs/DESIGN.md`**](file:///c:/Users/Sanatiel/meus_projetos/condominio-app/docs/DESIGN.md):

* **Identidade Visual e Conceito:** *Civic Horizon* (Corporate Modern). Transmite estabilidade, confiabilidade, eficiência administrativa e acessibilidade comunitária.
* **Paleta de Cores:**
  * **Primary (`#0F4C81` / `#00355F`):** Azul institucional profundo para ações principais, botão "+ Nova Ocorrência", links ativos e identidade do condomínio.
  * **Secondary / Neutros (`#4A5568` / `#545F72`):** Ardósia/cinza neutro para textos secundários, ícones e rótulos.
  * **Superfície & Fundo:** `#F7FAFC` (fundo geral da aplicação) e `#FFFFFF` (superfície pura dos cards e tabela, com sombra suave `0px 2px 4px rgba(0,0,0,0.05)`).
  * **Badges Semânticos de Status (Formato Pill):**
    * `Resolvida`: Verde suave com texto contrastante (ex.: `#10B981` / `green-100`).
    * `Pendente` / `Aberta`: Laranja/Âmbar suave (ex.: `#F59E0B` / `amber-100`).
    * `Em Análise` / `Em Andamento`: Azul suave institucional (ex.: `#0F4C81` / `blue-100`).
    * `Cancelada`: Cinza/Vermelho suave.
* **Tipografia:**
  * **Títulos e Headings:** **Manrope** (geometria moderna e proporções arquitetônicas, com *letter-spacing* ajustado).
  * **Corpo, Labels e Tabelas:** **Inter** (alta legibilidade funcional, entrelinhamento generoso e numerais tabulares).
* **Layouts Diferenciados por Ator:**
  1. **Painel do Funcionário (Desktop / Dashboard):**
     * **Sidebar de Navegação Fixa (240px):** Logo do sistema ("CondoManager"), identificação do condomínio ("Residencial Aurora / Administração"), botão primário de destaque `+ Nova Ocorrência`, menu com itens (Dashboard, Ocorrências ativo, Cadastro de Moradores, Configurações) e rodapé com Suporte e Sair.
     * **Topbar Superior:** Barra de busca rápida global, notificações, central de ajuda e perfil/avatar do funcionário.
     * **Área Central de Ocorrências:**
       * Título "Gestão de Ocorrências" e subtítulo descritivo.
       * **Cards de Métricas (KPIs no topo):** `TOTAL DE OCORRÊNCIAS`, `PENDENTES / EM ANÁLISE`, `RESOLVIDAS (MÊS)`.
       * **Barra de Filtros:** Input de busca com ícone de lupa ("ID, Local ou Descrição..."), Select de Status, Select de Categoria e botão "Filtrar".
       * **Tabela de Dados Rica:** Colunas para `ID` (ex.: `#OC-1042`), `CATEGORIA / TÍTULO` (com ícone visual da categoria), `LOCAL`, `DATA`, `STATUS` (Badge Pill) e `AÇÕES` (ícone de visualização detalhada). Rodapé com paginação e totalizadores.
  2. **Visão do Morador (Mobile-First & Responsivo):**
     * Layout fluido com margens de 16px, navegação simples, cards interativos com toque amigável (altura mínima de botões 44px) e visualização de mural em feed unificado.

## 11. Justificativa da stack

- **Next.js 16 + React 19:** Permite mesclar Server Components para renderização rápida e SEO com Client Components interativos para formulários, filtros e chats.
- **Tailwind CSS + Shadcn/UI:** Fornece componentes acessíveis, consistentes e modernos (diálogos, selects, badges de status, cards) sem inchar o bundle nem limitar customizações.
- **TanStack Query:** Essencial para alimentar o mural de ocorrências, busca, filtros e listas de comentários com cache em memória, revalidação automática de dados (*optimistic updates* / *refetch*) e estados claros de *loading* e *error*.
- **Supabase:** Plataforma completa já conectada ao ambiente. Oferece PostgreSQL robusto com suporte a Row Level Security (RLS), Supabase Auth nativo para funcionários e bucket de Storage para upload e exibição de imagens sem necessidade de serviços externos adicionais.

## 12. Fases de construção

### Fase 1 — Autenticação, Perfis e Gestão de Moradores
Objetivo: Estabelecer as bases de acesso para moradores e funcionários, além da interface administrativa para gerenciar o condomínio.
Specs:
- Spec 01 — Autenticação e Gestão de Sessões (Funcionários e Moradores)
- Spec 02 — Gestão e Cadastro de Moradores

### Fase 2 — Núcleo de Ocorrências (Registro e Mural)
Objetivo: Permitir que as ocorrências sejam criadas com foto e consultadas de forma transparente no mural comunitário.
Specs:
- Spec 03 — Abertura de Ocorrências com Upload de Foto
- Spec 04 — Mural de Ocorrências e Sistema de Filtros

### Fase 3 — Interação, Detalhes e Ciclo de Vida
Objetivo: Conectar moradores e equipe através de comentários e possibilitar a gestão do status de atendimento das ocorrências.
Specs:
- Spec 05 — Visualização de Detalhes e Thread de Comentários
- Spec 06 — Moderação e Gestão de Status pelo Painel do Funcionário

---

## 13. Specs funcionais detalhadas

### Spec 01 — Autenticação e Gestão de Sessões (Funcionários e Moradores)

- **Fase:** Fase 1 — Autenticação, Perfis e Gestão de Moradores
- **Objetivo (o quê):** Prover duas portas de entrada no sistema: login tradicional com e-mail e senha para funcionários e acesso rápido por e-mail validado (sem senha) para moradores.
- **Intenção (por quê):** Moradores abandonam canais que exigem senhas complexas que são facilmente esquecidas; ao mesmo tempo, os funcionários precisam de proteção por senha para acessar o painel administrativo.
- **Contexto:** Ponto de partida de toda a aplicação web. Define a identidade do usuário atual e o controle de rotas permitidas.
- **Atores:** Morador do condomínio e Funcionário da administração.
- **Descrição do comportamento:**
  - O sistema oferece uma tela de login de Morador onde ele digita o e-mail. O backend verifica se o e-mail consta na lista de moradores ativos. Se constar, gera uma sessão de morador (armazenando seus dados de identificação) e redireciona para o mural (`/ocorrencias`).
  - O sistema oferece uma rota administrativa de login (`/admin/login`) onde o funcionário informa e-mail e senha. A validação é feita via Supabase Auth. Havendo sucesso, redireciona para o painel (`/admin`).
  - Caso o morador tente entrar com e-mail inexistente, é exibida mensagem de erro clara.
  - Ao clicar em "Sair", a sessão é encerrada e o usuário retorna à tela inicial.
- **Entradas e saídas:**
  - Entradas Morador: e-mail.
  - Entradas Funcionário: e-mail e senha.
  - Saídas: sessão estabelecida (cookie/token seguro), redirecionamento de tela ou mensagem de erro visual.
- **Dados/entidades envolvidos (conceitual):**
  - Sessão de Usuário: identificador, tipo de ator (Morador ou Funcionário), dados básicos do perfil (Nome, E-mail, Apartamento/Torre se morador).
- **Estados e transições:**
  - Usuário Anônimo ➔ Usuário Morador Autenticado
  - Usuário Anônimo ➔ Usuário Funcionário Autenticado
  - Qualquer Autenticado ➔ Logout ➔ Usuário Anônimo
- **Regras de negócio:**
  - Morador só entra se o e-mail digitado estiver na lista de moradores ativos cadastrados.
  - Funcionário só acessa rotas `/admin/*` se estiver autenticado com credencial administrativa válida.
  - Morador autenticado que tentar acessar `/admin` deve ser bloqueado e redirecionado para o mural.
- **Validações:**
  - E-mail deve ter formato válido (`usuario@dominio.com`).
  - Senha do funcionário não pode ser vazia.
- **Fluxo do usuário (passo a passo):**
  1. Usuário acessa o link de morador.
  2. Digita seu e-mail cadastrado e clica em "Entrar".
  3. Sistema confere o e-mail; se válido, abre o Mural de Ocorrências.
  4. Para funcionários, o link `/admin/login` solicita e-mail e senha, abrindo o painel após confirmação.
- **Casos de borda e erros:**
  - E-mail não encontrado na base de moradores: exibir "E-mail não encontrado. Verifique a digitação ou procure a administração do condomínio."
  - Credenciais incorretas de funcionário: exibir "E-mail ou senha inválidos."
  - Sessão expirada: redirecionar para a respectiva tela de login preservando a rota de destino desejada.
- **Impacto no existente:** Nenhum (início do projeto).
- **Critérios de aceite (Dado/Quando/Então):**
  - Dado um e-mail de morador cadastrado previamente, Quando ele submeter o formulário de login por e-mail, Então deve ser autenticado com sucesso e levado ao mural de ocorrências.
  - Dado um e-mail não existente no cadastro de moradores, Quando ele tentar o acesso, Então o sistema deve rejeitar e mostrar mensagem orientando a contatar a administração.
  - Dado um funcionário com credenciais válidas, Quando ele fizer login na rota administrativa, Então deve acessar o Dashboard de Funcionários.
  - Dado um morador logado, Quando ele tentar acessar uma rota administrativa, Então deve receber aviso de acesso restrito e ser enviado ao mural.
- **Definição de pronto:** Rotas de login funcionais, proteção de rotas ativas e sessões de morador e funcionário persistentes entre recargas de página.
- **Dependências:** Nenhuma.
- **Fora do escopo desta spec:** Recuperação de senha via e-mail e envio de códigos SMS/WhatsApp.

---

### Spec 02 — Gestão e Cadastro de Moradores

- **Fase:** Fase 1 — Autenticação, Perfis e Gestão de Moradores
- **Objetivo (o quê):** Permitir que funcionários cadastrem, visualizem, editem e desativem moradores autorizados a utilizar o sistema.
- **Intenção (por quê):** Como os moradores não criam contas por conta própria nem usam senhas, o condomínio precisa de uma base centralizada para autorizar quem realmente reside no local.
- **Contexto:** Depende da autenticação de funcionários da Spec 01 e alimenta a base de validação para o acesso dos moradores.
- **Atores:** Funcionário da administração.
- **Descrição do comportamento:**
  - No Dashboard Administrativo, o funcionário acessa a seção "Moradores".
  - O sistema exibe uma tabela/lista com todos os moradores cadastrados contendo: Nome, E-mail, Torre/Bloco, Apartamento, Telefone e Status (Ativo/Inativo).
  - Um botão "Novo Morador" abre um modal ou formulário com os campos: Nome Completo, E-mail, Torre/Bloco, Apartamento e Telefone.
  - O funcionário pode editar os dados de um morador existente ou inativar seu acesso (caso mude do condomínio).
  - Campo de busca rápida por nome, apartamento ou e-mail na listagem.
- **Entradas e saídas:**
  - Entradas: Nome Completo, E-mail, Torre/Bloco, Apartamento, Telefone.
  - Saídas: Lista paginada/filtrada de moradores e mensagens de sucesso/erro após inclusão/edição.
- **Dados/entidades envolvidos (conceitual):**
  - Morador: ID, Nome Completo, E-mail (único), Torre/Bloco, Apartamento, Telefone, Status (Ativo/Inativo), Data de Cadastro.
- **Estados e transições:**
  - Morador: Ativo ➔ Inativo (quando inativo, perde permissão de login no sistema).
- **Regras de negócio:**
  - O e-mail do morador deve ser estritamente único em todo o sistema.
  - Todos os campos principais (Nome, E-mail, Torre, Apartamento) são de preenchimento obrigatório.
  - Morador marcado como Inativo é impedido de autenticar no sistema.
- **Validações:**
  - Nome completo com pelo menos 3 caracteres.
  - Formato de e-mail válido.
  - Torre/Bloco e Apartamento não vazios.
  - Telefone com máscara ou formato padrão válido.
- **Fluxo do usuário (passo a passo):**
  1. Funcionário acessa `/admin/moradores`.
  2. Clica em "Novo Morador".
  3. Preenche os dados solicitados e clica em "Salvar".
  4. O sistema valida se o e-mail já existe; se estiver livre, grava o morador.
  5. A lista atualiza instantaneamente via TanStack Query e exibe toast de confirmação.
- **Casos de borda e erros:**
  - Tentativa de cadastrar e-mail já existente: exibir erro "Já existe um morador cadastrado com este e-mail."
  - Campos em branco: destacar os campos obrigatórios na interface antes de submeter.
- **Impacto no existente:** Alimenta a verificação de login da Spec 01.
- **Critérios de aceite (Dado/Quando/Então):**
  - Dado que o funcionário preenche os dados válidos de um morador, Quando clica em Salvar, Então o morador é gravado e passa a figurar na lista como Ativo.
  - Dado que um morador foi inativado pelo funcionário, Quando ele tentar fazer login pelo e-mail, Então o sistema deve recusar o acesso informando cadastro inativo.
  - Dado um e-mail já cadastrado, Quando o funcionário tentar criar outro morador com o mesmo e-mail, Então o sistema deve bloquear a operação com mensagem amigável.
- **Definição de pronto:** CRUD de moradores completo e validado no painel de funcionários.
- **Dependências:** Spec 01 (Autenticação do Funcionário).
- **Fora do escopo desta spec:** Importação em lote por arquivo Excel/CSV nesta primeira versão.

---

### Spec 03 — Abertura de Ocorrências com Upload de Foto

- **Fase:** Fase 2 — Núcleo de Ocorrências (Registro e Mural)
- **Objetivo (o quê):** Permitir que moradores (ou funcionários) criem uma nova ocorrência com título, descrição, categoria, local e anexo de foto opcional.
- **Intenção (por quê):** Fornecer aos condôminos um mecanismo simples e estruturado para reportar problemas físicos ou de convivência com evidência fotográfica.
- **Contexto:** Utiliza a sessão do usuário ativo (morador ou funcionário) e conecta ao Supabase Storage para armazenamento seguro de imagens.
- **Atores:** Morador autenticado e Funcionário autenticado.
- **Descrição do comportamento:**
  - O usuário clica no botão "Nova Ocorrência".
  - Um formulário é exibido solicitando:
    - Título da Ocorrência (resumo objetivo)
    - Categoria (dropdown com: `Barulho`, `Manutenção`, `Segurança`, `Limpeza`, `Convivência`, `Outros`)
    - Local (campo de texto livre, ex.: "Garagem subsolo bloco 2")
    - Descrição detalhada do problema
    - Anexo de foto (opcional, com pré-visualização da imagem antes do envio)
  - Ao submeter, a foto é enviada para o bucket de imagens do Supabase Storage.
  - O registro da ocorrência é salvo com status padrão `Aberta` vinculado ao autor atual e data/hora.
  - Ao concluir, o usuário é redirecionado para o mural com mensagem de sucesso.
- **Entradas e saídas:**
  - Entradas: Título, Categoria, Local, Descrição, Arquivo de Imagem (opcional).
  - Saídas: Nova ocorrência cadastrada com URL pública da imagem (se houver) e status `Aberta`.
- **Dados/entidades envolvidos (conceitual):**
  - Ocorrência: ID, Título, Descrição, Categoria, Local, FotoURL (opcional), Status (`Aberta`), ID do Autor, Tipo de Autor (Morador/Funcionário), Data de Criação.
- **Estados e transições:**
  - Ao ser criada, o estado inicial da ocorrência é invariavelmente `Aberta`.
- **Regras de negócio:**
  - Apenas usuários autenticados podem abrir ocorrências.
  - Título, Categoria, Local e Descrição são de preenchimento obrigatório.
  - A foto é estritamente opcional.
  - Não é permitida a edição posterior do conteúdo da ocorrência após o envio.
- **Validações:**
  - Título: mínimo de 5 caracteres e máximo de 100 caracteres.
  - Descrição: mínimo de 10 caracteres.
  - Local: mínimo de 3 caracteres.
  - Foto: formatos aceitos (JPEG, PNG, WEBP), tamanho máximo de 5MB por arquivo.
- **Fluxo do usuário (passo a passo):**
  1. Usuário clica em "Nova Ocorrência".
  2. Preenche os campos obrigatórios.
  3. Seleciona uma imagem do celular ou computador (o sistema mostra thumbnail de preview com botão para remover se desejar).
  4. Clica em "Registrar Ocorrência".
  5. Sistema realiza upload da imagem, grava a ocorrência e redireciona ao mural.
- **Casos de borda e erros:**
  - Arquivo de foto maior que 5MB: avisar imediatamente na seleção sem travar o formulário ("A foto deve ter no máximo 5MB").
  - Falha de conexão durante o upload: manter os dados digitados no formulário e exibir alerta de erro com botão para tentar novamente.
- **Impacto no existente:** Alimenta o mural da Spec 04.
- **Critérios de aceite (Dado/Quando/Então):**
  - Dado um morador autenticado, Quando preencher os campos válidos sem foto e submeter, Então a ocorrência deve ser salva com status Aberta e exibida no mural.
  - Dado um morador que seleciona uma imagem válida, Quando submeter a ocorrência, Então a imagem deve ser carregada no Storage e o link salvo na ocorrência.
  - Dado que o usuário tenta enviar o formulário sem preencher o Local, Então o sistema deve bloquear o envio e destacar a obrigatoriedade do campo.
- **Definição de pronto:** Formulário de ocorrência funcional com preview, validação de tamanho de foto e gravação correta no banco e storage.
- **Dependências:** Spec 01 (Autenticação) e configuração do bucket no Supabase Storage.
- **Fora do escopo desta spec:** Upload de múltiplos arquivos ou vídeos.

---

### Spec 04 — Mural de Ocorrências e Sistema de Filtros

- **Fase:** Fase 2 — Núcleo de Ocorrências (Registro e Mural)
- **Objetivo (o quê):** Apresentar a lista de ocorrências do condomínio em formato adaptado por perfil (Tabela com KPIs para funcionários e Feed de cards para moradores), com filtros combinados por categoria e status, além de busca e ordenação cronológica.
- **Intenção (por quê):** Oferecer total transparência a moradores sobre as demandas da comunidade e dotar a equipe administrativa de um centro de controle operacional eficiente, seguindo as diretrizes visuais do [**`docs/DESIGN.md`**](file:///c:/Users/Sanatiel/meus_projetos/condominio-app/docs/DESIGN.md).
- **Contexto:** Tela principal de consulta utilizada logo após o login dos moradores e tela principal da rota `/admin/ocorrencias` para funcionários.
- **Atores:** Moradores e Funcionários.
- **Descrição do comportamento:**
  - **Visão do Funcionário (Dashboard Administrativo - conforme `docs/DESIGN.md`):**
    - Layout com Sidebar à esquerda (240px) exibindo "CondoManager", identificação do condomínio e botão primário `+ Nova Ocorrência`.
    - Cabeçalho com título "Gestão de Ocorrências" e subtítulo explicativo.
    - **Cards de Métricas (Stat Cards no topo):**
      - `TOTAL DE OCORRÊNCIAS` (valor numérico e ícone de chamado).
      - `PENDENTES / EM ANÁLISE` (valor numérico e ícone de prancheta com relógio).
      - `RESOLVIDAS (MÊS)` (valor numérico e ícone de confirmação/check).
    - **Barra de Filtros:** Input de busca textual com ícone ("ID, Local ou Descrição..."), Select de Status ("Todos os Status"), Select de Categoria ("Todas as Categorias") e botão "Filtrar".
    - **Tabela de Ocorrências:**
      - Colunas: `ID` (código identificador, ex.: `#OC-1042`), `CATEGORIA / TÍTULO` (com ícone visual da categoria e nome), `LOCAL`, `DATA`, `STATUS` (Badge Pill estilizada) e `AÇÕES` (ícone de visualização/olho).
      - Rodapé da tabela com paginação ("Mostrando X a Y de Z resultados") e botões de navegação `< >`.
  - **Visão do Morador (Mural / Feed Comunitário):**
    - Layout fluido e amigável para celular/desktop.
    - Exibição em lista de cards com fundo branco (`#FFFFFF`), borda suave e sombra Level 1.
    - Cada card exibe: Título, Categoria com tag visual colorida, Local, Badge Pill de Status, Nome e Torre/Apto do autor, Data e miniatura da foto (se houver).
    - Filtros rápidos no topo por Categoria e Status.
  - **Comportamento Geral:**
    - Integração com TanStack Query para gerenciar cache, estados de carregamento (Skeletons) e revalidação de dados.
    - Ao clicar em um registro (seja na tabela ou no card), navega para a tela de detalhes daquela ocorrência.
- **Entradas e saídas:**
  - Entradas: seleção de filtros de categoria, seleção de filtros de status e termo de busca.
  - Saídas: listagem dinâmica e reativa de cards de ocorrências.
- **Dados/entidades envolvidos (conceitual):**
  - Coleção de Ocorrências com dados resumidos do autor e contagem de comentários associados.
- **Estados e transições:**
  - Lista: Carregando (Skeleton) ➔ Exibindo Dados ➔ Lista Vazia (estado vazio amigável com botão para nova ocorrência) ➔ Erro com botão de tentar novamente.
- **Regras de negócio:**
  - Todas as ocorrências são públicas para moradores e funcionários autenticados do condomínio.
  - Ocorrências canceladas permanecem visíveis para fins de histórico, devidamente identificadas com a tag "Cancelada".
- **Validações:**
  - Não se aplica (leitura e filtragem em tela).
- **Fluxo do usuário (passo a passo):**
  1. Usuário acessa `/ocorrencias`.
  2. O mural carrega as ocorrências mais recentes.
  3. Usuário clica no filtro "Manutenção" e "Em Andamento".
  4. A lista é atualizada instantaneamente mostrando apenas os registros correspondentes.
  5. Usuário clica em um card para abrir o detalhe.
- **Casos de borda e erros:**
  - Nenhuma ocorrência encontrada para os filtros selecionados: exibir mensagem "Nenhuma ocorrência encontrada com os filtros selecionados" com botão para limpar filtros.
  - Falha na conexão de rede: exibir tela de erro suave com botão "Tentar novamente".
- **Impacto no existente:** Conecta a criação da Spec 03 com os detalhes da Spec 05.
- **Critérios de aceite (Dado/Quando/Então):**
  - Dado que existem ocorrências cadastradas, Quando o usuário acessar o mural, Então deve visualizar os cards ordenados por data decrescente com status e categoria visíveis.
  - Dado que o usuário seleciona uma categoria específica, Quando o filtro é aplicado, Então apenas ocorrências daquela categoria devem permanecer na listagem.
  - Dado que não há ocorrências cadastradas, Quando o usuário acessar o mural, Então deve ver uma mensagem convidando a abrir a primeira ocorrência.
- **Definição de pronto:** Mural responsivo com cards, badges estilizados, filtros reativos e navegação para o detalhe.
- **Dependências:** Spec 03 (Ocorrências salvas).
- **Fora do escopo desta spec:** Filtro por data customizada ou exportação de relatórios em PDF.

---

### Spec 05 — Visualização de Detalhes e Thread de Comentários

- **Fase:** Fase 3 — Interação, Detalhes e Ciclo de Vida
- **Objetivo (o quê):** Exibir todos os detalhes de uma ocorrência específica (incluindo foto ampliada) e disponibilizar uma seção de comentários em texto cronológica para interação entre moradores e funcionários.
- **Intenção (por quê):** Permitir o diálogo direto sobre o problema, esclarecimento de dúvidas e prestação de contas sobre o andamento do atendimento.
- **Contexto:** Acessada ao clicar em um card no mural (Spec 04).
- **Atores:** Moradores autenticados e Funcionários autenticados.
- **Descrição do comportamento:**
  - Exibe o cabeçalho completo: Título, Categoria, Local, Status atual, Autor (Nome, Torre/Apto), Data e hora de criação.
  - Exibe a descrição na íntegra.
  - Se houver foto anexa, exibe a imagem em destaque com opção de clique para visualização em modal/lightbox ampliado.
  - Abaixo da ocorrência, exibe a seção "Comentários":
    - Linha do tempo com todos os comentários anteriores contendo: Nome do autor, identificação do papel (ex.: "Morador - Torre A Apto 101" ou "Funcionário / Administração"), data/hora e o texto do comentário.
    - Campo de texto ("Adicionar comentário...") e botão "Enviar".
  - Ao enviar o comentário, a lista é revalidada via TanStack Query e o novo comentário surge imediatamente na conversa.
- **Entradas e saídas:**
  - Entradas: Texto do comentário digitado pelo usuário.
  - Saídas: Comentário persistido e exibido na timeline da ocorrência.
- **Dados/entidades envolvidos (conceitual):**
  - Comentário: ID, ID da Ocorrência, ID do Autor, Tipo de Autor (Morador/Funcionário), Nome do Autor, Identificação da Unidade (se morador), Conteúdo em Texto, Data/Hora de Envio.
- **Estados e transições:**
  - Ocorrência: Aberta/Em Análise/Em Andamento ➔ Aceita novos comentários.
  - Ocorrência Resolvida/Cancelada ➔ Continua permitindo leitura dos comentários históricos e inserção de novos apontamentos se necessário.
- **Regras de negócio:**
  - Comentários são estritamente em formato de texto (sem fotos anexas).
  - Qualquer morador ou funcionário autenticado pode comentar em qualquer ocorrência do condomínio.
  - Não é permitida a exclusão ou edição de comentários por moradores após o envio (para manter a integridade da conversa).
- **Validações:**
  - Comentário não pode ser vazio e deve ter pelo menos 2 caracteres.
  - Limite máximo de 1.000 caracteres por comentário para evitar textos abusivos.
- **Fluxo do usuário (passo a passo):**
  1. Usuário entra na página `/ocorrencias/[id]`.
  2. Lê a descrição e confere a foto do local.
  3. Rola até o final da página e digita: "O barulho começou novamente agora às 22h".
  4. Clica em "Enviar".
  5. O comentário aparece na lista com seu nome e horário.
- **Casos de borda e erros:**
  - Usuário clica em enviar sem digitar texto: o botão permanece desabilitado ou exibe aviso de preenchimento.
  - Ocorrência inexistente ou excluída: exibir tela amigável 404 com botão "Voltar ao mural".
- **Impacto no existente:** Enriquece o detalhamento das ocorrências criadas nas specs anteriores.
- **Critérios de aceite (Dado/Quando/Então):**
  - Dado um usuário visualizando uma ocorrência, Quando a ocorrência possuir foto, Então a imagem deve ser carregada corretamente com proporções preservadas.
  - Dado um morador autenticado, Quando digitar um comentário válido e clicar em Enviar, Então o comentário deve ser gravado e exibido na lista com sua identificação de morador.
  - Dado um funcionário autenticado, Quando enviar um comentário, Então o comentário deve receber destaque visual diferenciado indicando resposta oficial da administração.
- **Definição de pronto:** Tela de detalhes completa com visualizador de foto e thread de comentários funcional e reativa.
- **Dependências:** Spec 04 (Navegação a partir do mural) e Spec 01 (Identificação do autor).
- **Fora do escopo desta spec:** Upload de áudio, anexos de imagem em comentários ou reações com emojis.

---

### Spec 06 — Moderação e Gestão de Status pelo Painel do Funcionário

- **Fase:** Fase 3 — Interação, Detalhes e Ciclo de Vida
- **Objetivo (o quê):** Disponibilizar aos funcionários ferramentas exclusivas para alterar o status das ocorrências (`Aberta`, `Em Análise`, `Em Andamento`, `Resolvida`, `Cancelada`) e realizar a moderação/cancelamento de ocorrências impróprias.
- **Intenção (por quê):** Dar controle operacional à equipe do condomínio para gerenciar o fluxo de atendimento aos chamados e manter a ordem das informações.
- **Contexto:** Funcionalidade restrita aos funcionários, acessível tanto no Dashboard Administrativo quanto na tela de detalhes da ocorrência quando acessada por um funcionário.
- **Atores:** Funcionário da administração autenticado.
- **Descrição do comportamento:**
  - Quando um funcionário visualiza uma ocorrência, é exibido um controle de gestão de status (seletor de status com confirmação).
  - O funcionário pode mudar o status para qualquer etapa do ciclo:
    - `Aberta` (recém-criada, aguardando triagem)
    - `Em Análise` (administração está avaliando)
    - `Em Andamento` (equipe ou prestador atuando no local)
    - `Resolvida` (concluída)
    - `Cancelada` (chamado inválido, duplicado ou cancelado)
  - Ao alterar o status, o sistema atualiza o registro no banco de dados e adiciona automaticamente um registro de histórico na linha do tempo da ocorrência.
  - Botão de ação de moderação: "Cancelar Ocorrência" ou "Excluir Ocorrência" com modal de confirmação obrigatório para evitar cliques acidentais.
  - Moradores comuns não visualizam esses controles na interface.
- **Entradas e saídas:**
  - Entradas: Novo status selecionado ou confirmação de cancelamento/exclusão.
  - Saídas: Status da ocorrência atualizado no banco, revalidação automática das telas via TanStack Query e notificação de confirmação.
- **Dados/entidades envolvidos (conceitual):**
  - Ocorrência: Status atual, Data de última atualização de status, ID do funcionário responsável pela alteração.
- **Estados e transições:**
  - `Aberta` ➔ `Em Análise` ➔ `Em Andamento` ➔ `Resolvida`
  - Qualquer status ➔ `Cancelada`
- **Regras de negócio:**
  - Somente funcionários autenticados podem alterar o status de qualquer ocorrência.
  - Moradores têm acesso apenas de leitura ao status.
  - Toda alteração de status deve refletir imediatamente para todos os moradores no mural e no detalhe.
- **Validações:**
  - O status informado deve ser um dos 5 valores pré-definidos válidos.
- **Fluxo do usuário (passo a passo):**
  1. Funcionário abre a ocorrência no painel.
  2. No painel lateral ou cabeçalho, clica no seletor de status e muda de "Aberta" para "Em Andamento".
  3. Clica em "Salvar alteração".
  4. O sistema atualiza o status e exibe toast "Status atualizado para Em Andamento".
  5. Moradores que visualizarem o mural passam a ver a ocorrência com a badge correspondente.
- **Casos de borda e erros:**
  - Tentativa de alteração não autorizada via chamada direta de API por usuário não-funcionário: o backend/RLS deve rejeitar a requisição com código 403 (Proibido).
- **Impacto no existente:** Atualiza o estado das ocorrências visualizadas nas Specs 04 e 05.
- **Critérios de aceite (Dado/Quando/Então):**
  - Dado um funcionário autenticado no detalhe da ocorrência, Quando selecionar o status "Em Andamento" e confirmar, Então o status da ocorrência deve ser persistido e refletido no mural.
  - Dado um morador autenticado, Quando acessar a mesma tela de detalhes, Então os botões de alteração de status e cancelamento não devem ser visíveis nem acessíveis.
  - Dado que o funcionário opta por cancelar uma ocorrência, Quando confirmar a ação no modal, Então a ocorrência deve passar para o status "Cancelada".
- **Definição de pronto:** Painel e controles de status operacionais com validação estrita de permissões de funcionário.
- **Dependências:** Spec 01 (Autenticação de Funcionário) e Spec 03 (Ocorrências).
- **Fora do escopo desta spec:** Atribuição de tarefas para prestadores terceirizados externos.

---

## 14. Ordem recomendada de implementação

Para garantir uma construção sólida onde cada etapa se apoie em componentes previamente validados, a ordem recomendada de execução é:

1. **Spec 01 — Autenticação e Gestão de Sessões:** Cria a base de segurança, diferencia os papéis de Morador (e-mail sem senha) e Funcionário (Supabase Auth) e estrutura a proteção de rotas.
2. **Spec 02 — Gestão e Cadastro de Moradores:** Permite que a administração cadastre os moradores que terão permissão para acessar o sistema na Spec 01.
3. **Spec 03 — Abertura de Ocorrências com Upload de Foto:** Constrói o formulário central de ocorrências e a integração com o Supabase Storage.
4. **Spec 04 — Mural de Ocorrências e Sistema de Filtros:** Desenvolve a visualização principal compartilhada com filtros reativos e cache via TanStack Query.
5. **Spec 05 — Visualização de Detalhes e Thread de Comentários:** Entrega a tela rica de leitura da ocorrência, visualização de fotos e o sistema de comentários para diálogo entre condomínio e moradores.
6. **Spec 06 — Moderação e Gestão de Status pelo Painel do Funcionário:** Fecha o ciclo com as ferramentas de controle operacional e resolução das ocorrências pela equipe administrativa.

Seguir rigorosamente esta sequência assegura que nenhuma tela ou componente seja construído sem que seus dados e regras de acesso já estejam disponíveis e testáveis.

