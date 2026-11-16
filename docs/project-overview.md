# Project Overview — Condomínio Aurora

> **Última atualização:** 2026-11-16  
> **Status:** Em desenvolvimento ativo / MVP funcional

O **Condomínio Aurora** é uma aplicação web para registro, triagem e acompanhamento transparente de ocorrências e manutenções prediais em condomínios residenciais. O sistema elimina a desorganização de grupos de mensagens ao centralizar relatos com histórico e fotos.

---

## 1. Perfis de Acesso & Autenticação

O sistema opera com autenticação dual para reduzir atrito na ponta e garantir governança na gestão:

- **Morador (Acesso Simplificado):**
  - Identificação por número da unidade e código de acesso individual (definido pela administração).
  - Gera sessão JWT assinada via cookie HTTP-only (`condo_morador_session`).
  - Sem necessidade de confirmação de e-mail ou senhas complexas.
- **Administrador / Síndico:**
  - Login seguro com e-mail e senha via Supabase Auth.
  - Acesso irrestrito a todas as ocorrências, métricas de gestão e cadastro de moradores.

---

## 2. Principais Funcionalidades

### Área do Morador

- **Mural de Ocorrências (`/ocorrencias`):** listagem em cartões das ocorrências públicas com busca textual, paginação e filtros por categoria e status.
- **Registro de Ocorrência (`/nova-ocorrencia`):** formulário guiado com validação client/server, seleção de categoria, upload de até 3 fotos e toggle de visibilidade (pública ou privada).
- **Detalhes & Diálogo (`/ocorrencias/[id]`):** visualização do status em tempo real, lightbox para inspeção de fotos e thread de comentários para interação com a administração.

### Área Administrativa (`/admin`)

- **Painel de Controle:** cards com KPIs de ocorrências abertas, em andamento, resolvidas hoje e tempo médio de resolução.
- **Gestão de Chamados (`/admin/ocorrencias`):** visão completa de ocorrências com modal para transição de status (`aberta`, `em_analise`, `em_andamento`, `resolvida`, `cancelada`) e respostas oficiais.
- **Gestão de Moradores (`/admin/moradores`):** tabela com listagem das unidades, status (ativo/inativo) e modal para cadastro e alteração de códigos de acesso.

---

## 3. Categorias & Ciclo de Vida da Ocorrência

- **Categorias Suportadas:** Barulho, Manutenção/Estrutural, Limpeza, Segurança, Áreas Comuns e Outros.
- **Fluxo de Estados:**
  1. `aberta` (recém-criada pelo morador)
  2. `em_analise` (recebida pela administração)
  3. `em_andamento` (equipe ou fornecedor acionado)
  4. `resolvida` (problema solucionado com registro no histórico)
  5. `cancelada` (duplicidade ou improcedência)

---

## 4. Documentos Relacionados

- Arquitetura técnica e stack: [architecture.md](./architecture.md)
- PRD funcional detalhado: [prd/sistema-ocorrencias-condominio.md](./prd/sistema-ocorrencias-condominio.md)
- Plano de implementação: [plano-implementacao.md](./plano-implementacao.md)
