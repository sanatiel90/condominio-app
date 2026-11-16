# PRD — Exclusão do Próprio Comentário pelo Morador

> Tipo: PRD de feature · Data: 2026-11-16  
> **Status:** Implementada
>
> <!-- Valores possíveis: "Aguardando implementação" | "Implementada". Atualize para "Implementada" quando todas as specs estiverem concluídas. -->

## 1. Visão geral

Esta funcionalidade permite que o morador autenticado exclua comentários publicados por ele mesmo no mural de ocorrências do condomínio. A exclusão adota o padrão de _soft delete com sobrescrita definitiva do texto_, mantendo a cronologia da conversa com a mensagem _"Este comentário foi removido pelo autor"_, sem reter dados confidenciais ou sensíveis no banco de dados.

## 2. Problema que resolve

Atualmente, uma vez enviado um comentário em uma ocorrência, o morador não possui nenhum meio de removê-lo ou retratá-lo. Caso o morador cometa um erro de digitação, exponha dados pessoais acidentalmente (como telefone ou documentos privados) ou deseje retirar um comentário após esclarecimento verbal, o texto permanece visível indefinidamente para todos os moradores do condomínio, gerando desconforto, potenciais conflitos de convivência e riscos de não conformidade com privacidade (LGPD).

## 3. Público-alvo

Moradores do condomínio autenticados que participam ativamente do acompanhamento de chamados e ocorrências.

## 4. Objetivo do recorte atual

Entregar um fluxo seguro, intuitivo e com confirmação explícita para que o morador possa remover suas próprias mensagens em ocorrências em andamento, garantindo a proteção da privacidade do autor e mantendo a integridade histórica da conversa para a comunidade.

## 5. Funcionalidades

**Essenciais:**

- Identificação de autoria nos comentários, habilitando gatilho de exclusão apenas para o autor logado.
- Diálogo modal de confirmação antes de efetivar a remoção (prevenção contra toques acidentais em mobile).
- Bloqueio de exclusão em ocorrências já finalizadas (`resolvida` ou `cancelada`), congelando o histórico.
- Atualização visual imediata na thread de comentários, exibindo marcador de comentário removido.
- Sobrescrita definitiva do texto no banco de dados no momento da exclusão (`deleted_at` preenchido e conteúdo original apagado).

**Desejáveis:**

- _Nenhuma neste recorte._ (Mantido estritamente enxuto conforme princípio YAGNI).

## 6. Fora do escopo

- Moderação ou exclusão de comentários por funcionários/síndicos.
- Edição ou alteração de texto de comentários já enviados.
- Restauração de comentários excluídos.
- Armazenamento em log/backup do texto apagado para fins de auditoria interna.
- Notificações por push ou e-mail avisando sobre a remoção de comentários.

## 7. Regras de negócio

- **Regra 1 (Autoria estrita):** Um comentário só pode ser excluído pelo morador que o criou (`session.id === comentario.morador_id`). Nenhuma outra pessoa, exceto o autor, tem permissão para disparar essa ação.
- **Regra 2 (Congelamento em ocorrências finalizadas):** A exclusão só é autorizada se a ocorrência estiver em status ativo (`registrada`, `em_analise` ou `em_andamento`). Se a ocorrência estiver com status `resolvida` ou `cancelada`, a exclusão é terminantemente bloqueada tanto na interface quanto nas regras de validação da API.
- **Regra 3 (Irreversibilidade e LGPD):** A exclusão é irreversível. No momento da remoção, o conteúdo textual original é sobrescrito/limpo no banco de dados, preenchendo a data/hora da exclusão.
- **Regra 4 (Preservação da cronologia):** O comentário excluído não é deletado fisicamente (não há _hard delete_ da linha), permanecendo na listagem com indicação visual neutra de que foi removido pelo autor, evitando que réplicas e respostas posteriores fiquem sem contexto.

## 8. Fluxos principais

### Fluxo 1 — Exclusão bem-sucedida pelo autor em ocorrência aberta

1. O morador acessa a página de detalhes de uma ocorrência aberta (`/ocorrencias/[id]`).
2. Na seção de comentários, o morador visualiza seus próprios comentários contendo um ícone discreto de lixeira.
3. O morador clica no ícone de lixeira do comentário que deseja remover.
4. O sistema abre uma janela modal (`Dialog`) de confirmação com texto claro: _"Deseja excluir seu comentário? Esta ação não pode ser desfeita"_.
5. O morador confirma a exclusão clicando no botão de confirmação.
6. O sistema processa a requisição, sobrescreve o texto do comentário no banco, registra o timestamp de exclusão e atualiza a interface.
7. O comentário passa a exibir a mensagem neutra: _"Este comentário foi removido pelo autor"_, sem exibir o texto anterior e sem botão de exclusão.
8. Uma notificação amigável (toast) confirma a remoção.

### Fluxo 2 — Tentativa de exclusão em ocorrência finalizada

1. O morador acessa os detalhes de uma ocorrência que já se encontra com status `resolvida` ou `cancelada`.
2. O sistema não renderiza o botão de exclusão nos comentários do morador.
3. Caso haja tentativa direta de chamada à API de exclusão para essa ocorrência, a requisição é rejeitada com erro amigável informando que a ocorrência está concluída e o histórico não pode ser alterado.

## 9. Critérios de aceite

- O morador consegue ver o botão de exclusão apenas nos comentários de sua própria autoria.
- O morador não vê botões de exclusão em comentários de outros moradores ou de funcionários.
- O sistema exige confirmação explícita em modal antes de efetivar qualquer exclusão.
- O sistema impede a exclusão se a ocorrência estiver nos status `resolvida` ou `cancelada`.
- Quando a exclusão é confirmada, o texto original do comentário deixa de existir no banco de dados.
- Quando o comentário é excluído, a interface substitui o texto pelo informativo _"Este comentário foi removido pelo autor"_.
- Após a exclusão, nenhum botão de ação adicional fica disponível para aquele comentário.

## 10. Stack

- **Frontend / Aplicação:** Next.js (App Router, React Server e Client Components), TypeScript, Tailwind CSS.
- **Componentes e Ícones:** Lucide React (ícone `Trash2`), shadcn/ui (`Dialog` existente no repositório), Sonner (notificações toast).
- **Gerenciamento de Estado de Servidor:** TanStack Query (`useMutation`, invalidação de query `["comentarios", id]`).
- **Backend e Banco de Dados:** Next.js Route Handlers, Supabase (PostgreSQL), políticas RLS existentes e validação com Zod.

## 11. Justificativa da stack

Reutiliza integralmente as convenções, bibliotecas e componentes já adotados no projeto, sem adicionar novas dependências externas e aproveitando o design system corporativo existente.

## 12. Fases de construção

### Fase 1 — Regra de Negócio e Persistência

Objetivo: Ajustar a estrutura de dados de comentários para suportar exclusão lógica e disponibilizar a operação com validações de autoria e status da ocorrência.  
Specs:

- Spec 01 — Validação e Persistência da Exclusão de Comentário

### Fase 2 — Interface e Experiência do Usuário

Objetivo: Permitir o acionamento da exclusão com confirmação visual segura e exibir o estado de comentário removido na conversa.  
Specs:

- Spec 02 — Interface de Exclusão e Visualização de Comentário Removido

---

## 13. Specs funcionais detalhadas

### Spec 01 — Validação e Persistência da Exclusão de Comentário

- **Fase:** Fase 1 — Regra de Negócio e Persistência
- **Objetivo (o quê):** Disponibilizar a capacidade de exclusão lógica de um comentário de ocorrência, garantindo que apenas o morador autor consiga realizar a ação e somente enquanto a ocorrência estiver ativa.
- **Intenção (por quê):** Proteger a integridade dos dados e impedir ações não autorizadas (ex.: morador excluindo comentário alheio ou alterando ocorrência já encerrada), atendendo à LGPD ao sobrescrever o texto apagado.
- **Contexto:** Relaciona-se com a entidade de comentários (`comentarios`), tabela de ocorrências (`ocorrencias`) e o endpoint de manipulação de comentários (`/api/ocorrencias/[id]/comentarios`).
- **Atores:** Morador autenticado que seja autor do comentário.
- **Descrição do comportamento:**
  1. A operação recebe o identificador do comentário e o identificador da ocorrência associada.
  2. Identifica a sessão ativa do usuário autenticado.
  3. Verifica se a ocorrência existe e se seu status é `registrada`, `em_analise` ou `em_andamento`. Caso contrário, rejeita.
  4. Localiza o comentário correspondente e valida se `morador_id` é idêntico ao identificador do usuário na sessão. Caso contrário, rejeita com erro de permissão.
  5. Verifica se o comentário já foi excluído previamente. Se já foi excluído, encerra sem nova alteração.
  6. Efetua a atualização no registro: preenche a data de exclusão (`deleted_at = now()`) e substitui o texto original em `conteudo` por valor padronizado ou vazio, impedindo leitura futura do conteúdo antigo.
  7. Retorna resposta de sucesso confirmando a remoção.
- **Entradas e saídas:**
  - _Entradas:_ ID da ocorrência, ID do comentário a ser excluído, credenciais da sessão ativa do morador.
  - _Saídas:_ Objeto com confirmação de sucesso e dados atualizados do comentário (status de excluído e data).
- **Dados/entidades envolvidos (conceitual):**
  - _Comentário:_ identificador, vínculo com ocorrência, vínculo com morador autor, conteúdo textual, data de criação, data de exclusão (`deleted_at`).
  - _Ocorrência:_ identificador, status atual.
- **Estados e transições:**
  - Comentário ativo (`deleted_at` nulo) $\rightarrow$ Comentário removido (`deleted_at` preenchido, conteúdo original limpo). Transição unidirecional (não há restauração).
- **Regras de negócio:**
  - Somente o autor morador pode acionar a exclusão.
  - Proibido excluir comentários em ocorrências `resolvida` ou `cancelada`.
  - Conteúdo original deve ser definitivamente sobrescrito/apagado.
- **Validações:**
  - Sessão do usuário deve ser válida e ter perfil `morador`.
  - Ocorrência informada deve existir no banco de dados.
  - Status da ocorrência não pode ser `resolvida` nem `cancelada`.
  - Comentário deve pertencer à ocorrência informada.
  - Comentário deve ter sido criado pelo morador requisitante.
- **Fluxo do usuário (passo a passo):**
  1. O cliente envia solicitação de exclusão para o comentário selecionado.
  2. O backend valida a autenticação da sessão.
  3. O backend consulta o status da ocorrência e a titularidade do comentário.
  4. O backend aplica o soft delete e sobrescreve o conteúdo.
  5. O backend responde com status 200 (Sucesso).
- **Casos de borda e erros:**
  - _Usuário não autenticado:_ Retorna erro 401 (Não autorizado).
  - _Tentativa de apagar comentário de outro morador ou de funcionário:_ Retorna erro 403 (Acesso negado).
  - _Ocorrência com status resolvida ou cancelada:_ Retorna erro 400 informando que ocorrências encerradas não permitem alteração de comentários.
  - _Comentário inexistente:_ Retorna erro 404 (Não encontrado).
- **Impacto no existente:** Requer adição de coluna conceitual de exclusão (`deleted_at`) na entidade de comentários e suporte à remoção na rota correspondente.
- **Critérios de aceite (Dado/Quando/Então):**
  - Dado um morador autenticado autor de um comentário em ocorrência com status `em_andamento`, quando solicitar a exclusão do seu comentário, então a operação é aceita, `deleted_at` é gravado e o texto original é apagado.
  - Dado um morador autenticado tentando excluir o comentário de outro morador, quando a requisição for processada, então a ação é bloqueada com erro 403.
  - Dado um morador autenticado tentando excluir seu próprio comentário em ocorrência com status `resolvida`, quando a requisição for processada, então a ação é bloqueada com mensagem de status congelado.
- **Definição de pronto:** Endpoint ou método de exclusão operacional, seguro contra acessos indevidos e com todas as validações de autoria e status ativas.
- **Dependências:** Nenhuma.
- **Fora do escopo desta spec:** Elementos visuais da interface (modais, botões, ícones).

---

### Spec 02 — Interface de Exclusão e Visualização de Comentário Removido

- **Fase:** Fase 2 — Interface e Experiência do Usuário
- **Objetivo (o quê):** Adicionar à listagem de comentários o botão de exclusão para o autor, o diálogo de confirmação prévia e a renderização estilizada de comentários que foram removidos.
- **Intenção (por quê):** Evitar disparos acidentais em telas sensíveis ao toque (smartphones) e fornecer feedback claro ao usuário de que o comentário foi removido com sucesso, mantendo a coerência visual do mural de ocorrências.
- **Contexto:** Componente de comentários (`ComentariosThread`), visualização de detalhes da ocorrência (`/ocorrencias/[id]`) e hook de mutação de dados.
- **Atores:** Morador autenticado navegando pelos detalhes da ocorrência.
- **Descrição do comportamento:**
  1. Ao renderizar a thread de comentários, o componente verifica para cada comentário se `session.user.id === comentario.morador_id` e se a ocorrência está com status aberto (`registrada`, `em_analise`, `em_andamento`).
  2. Se as condições forem atendidas e o comentário não estiver excluído, um botão com ícone de lixeira é exibido no topo do card do comentário.
  3. Ao clicar no botão, um diálogo modal (`Dialog`) é aberto com título _"Excluir comentário"_, mensagem descritiva alertando sobre a irreversibilidade da ação, botão de cancelar e botão de confirmação com destaque visual de perigo (vermelho).
  4. Ao clicar em confirmar, o botão entra em estado de carregamento desabilitado.
  5. Em caso de sucesso, o modal fecha, um toast informa _"Comentário excluído com sucesso"_ e a lista atualiza instantaneamente.
  6. Para comentários cujo `deleted_at` está preenchido, o componente renderiza o card com estilo atenuado/itálico e a mensagem fixa _"Este comentário foi removido pelo autor"_, sem exibir conteúdo anterior nem ícones de ação.
- **Entradas e saídas:**
  - _Entradas:_ Lista de comentários com data de exclusão, dados da sessão do usuário ativo, status da ocorrência atual.
  - _Saídas:_ Renderização condicional do botão de exclusão, modal interativo de confirmação e exibição atenuada para comentários excluídos.
- **Dados/entidades envolvidos (conceitual):**
  - Sessão do usuário logado (id e papel).
  - Comentário (id, autor, status de exclusão).
  - Ocorrência (status).
- **Estados e transições:**
  - Modal fechado $\rightarrow$ Modal aberto para confirmação $\rightarrow$ Processando exclusão $\rightarrow$ Fechado com toast de sucesso.
  - Card ativo $\rightarrow$ Card em estado "removido pelo autor".
- **Regras de negócio:**
  - O botão de exclusão só pode aparecer quando a ocorrência estiver ativa e o comentário for do usuário ativo.
  - Não deve ser possível clicar no botão de confirmação mais de uma vez durante o processamento.
- **Validações:**
  - Garantir que o diálogo só dispara a exclusão para o identificador do comentário selecionado.
- **Fluxo do usuário (passo a passo):**
  1. O morador identifica seu comentário na lista e toca no ícone de lixeira.
  2. O modal de confirmação aparece na tela.
  3. O morador clica no botão "Excluir".
  4. O sistema processa a ação, fecha o modal e exibe o toast de sucesso.
  5. O balão do comentário agora exibe _"Este comentário foi removido pelo autor"_.
- **Casos de borda e erros:**
  - _Falha de conexão durante a exclusão:_ O modal exibe a mensagem de erro (ou toast) e restaura o botão para nova tentativa.
  - _Ocorrência resolvida em outra aba:_ Se a ocorrência foi encerrada simultaneamente, a API rejeita e a interface exibe o aviso de que a ocorrência já foi finalizada.
  - _Comentário já excluído:_ Se o comentário já tiver `deleted_at`, o card não renderiza nenhum botão de exclusão.
- **Impacto no existente:** Alteração na apresentação de cards dentro de `ComentariosThread` e conexão com o hook de mutação de exclusão.
- **Critérios de aceite (Dado/Quando/Então):**
  - Dado que o morador logado é autor de um comentário em ocorrência aberta, quando visualizar a thread de comentários, então o ícone de lixeira é exibido no seu card.
  - Dado que o comentário pertence a outro usuário, quando o morador visualizar a lista, então o ícone de lixeira não é exibido.
  - Dado que o morador clicou no ícone de lixeira, quando o modal abrir, então a exclusão só ocorre se o usuário clicar explicitamente no botão de confirmação.
  - Dado que a exclusão foi concluída, quando a thread for atualizada, então o card exibe _"Este comentário foi removido pelo autor"_ em estilo atenuado.
- **Definição de pronto:** Interface com modal de confirmação funcional, feedback via toast, suporte responsivo para dispositivos móveis e renderização adequada de comentários excluídos.
- **Dependências:** Spec 01 — Validação e Persistência da Exclusão de Comentário.
- **Fora do escopo desta spec:** Exclusão de múltiplos comentários em lote; filtros para ocultar comentários removidos.

---

## 14. Ordem recomendada de implementação

1. **Spec 01 — Validação e Persistência da Exclusão de Comentário:** Estabelece a coluna de suporte à exclusão lógica no modelo, a validação de segurança de autoria e status da ocorrência, garantindo que o backend esteja blindado antes da interface ser exposta.
2. **Spec 02 — Interface de Exclusão e Visualização de Comentário Removido:** Conecta o componente visual `ComentariosThread` ao hook de mutação, integrando o diálogo de confirmação (`Dialog`) e a renderização do estado removido.

> Seguir rigorosamente esta ordem garante que as validações de segurança e integridade de dados estejam operacionais antes de qualquer acionamento pelo cliente.
