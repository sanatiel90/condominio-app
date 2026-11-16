# Plano de Implementação — Exclusão do Próprio Comentário pelo Morador

> **Documento de Engenharia & Arquitetura de Software**  
> **Baseado em:** [PRD — Exclusão do Próprio Comentário pelo Morador](file:///c:/Users/Sanatiel/meus_projetos/condominio-app/docs/prd/feature-exclusao-comentario-morador.md)  
> **Design System:** [Civic Horizon](file:///c:/Users/Sanatiel/meus_projetos/condominio-app/docs/DESIGN.md)  
> **Stack:** Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS v4 + Shadcn/UI (Dialog) + TanStack Query v5 + Supabase (PostgreSQL)  
> **Status:** Implementação Concluída com Sucesso

---

## 1. Visão Geral da Arquitetura & Decisões Técnicas

### 1.1 Padrão de Exclusão (Soft Delete com Sanitização LGPD)

Para equilibrar a preservação do histórico da conversa com a privacidade do morador:

1. **Preservação de Linha no Banco:** A linha na tabela `comentarios` não é eliminada fisicamente (_sem hard delete_). Isso mantém a contagem cronológica e a coerência de respostas oficiais e réplicas no mural.
2. **Sobrescrita Definitiva de Conteúdo (Sanitização):** No momento da exclusão, a coluna `conteudo` é substituída por valor estático indicativo (`[Comentário removido pelo autor]`) e a coluna `deleted_at` é gravada com `now()`. Desta forma, nenhum dado pessoal sensível acidentalmente publicado permanece gravado no banco de dados.
3. **Apresentação Visual Neutra:** Na interface, o balão do comentário é estilizado em tom neutro e itálico (_"Este comentário foi removido pelo autor"_), omitindo ações de interação e mantendo o autor original para rastreabilidade de quem participou do diálogo.

### 1.2 Regras de Segurança e Isolamento

- **Verificação Estrita de Sessão:** O morador deve estar autenticado via cookie de sessão (`getCurrentSession()`).
- **Autoria Obrigatória:** `session.id === comentario.morador_id` e `session.role === 'morador'`.
- **Congelamento por Status de Ocorrência:** Se a ocorrência estiver com status `resolvida` ou `cancelada`, qualquer pedido de exclusão é rejeitado com HTTP 400 (_"Ocorrências finalizadas não permitem alteração no histórico de comentários"_).

---

## 2. Modificações no Banco de Dados (`/supabase`)

Seguindo as diretrizes de `supabase-postgres-best-practices`, criaremos um script incremental específico para a migração da feature, mantendo o histórico ordenado.

### 2.1 Script SQL Incremental: `supabase/06_add_deleted_at_to_comentarios.sql`

```sql
-- ==============================================================================
-- 06_add_deleted_at_to_comentarios.sql — Soft Delete em Comentários
-- Sistema de Ocorrências para Condomínio
-- Ordem de Execução: 6
-- ==============================================================================

-- 1. Adicionar coluna deleted_at na tabela comentarios
ALTER TABLE public.comentarios
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

-- 2. Índice parcial para otimizar consultas que filtram comentários ativos (opcional/futuro)
CREATE INDEX IF NOT EXISTS idx_comentarios_ocorrencia_deleted
  ON public.comentarios (ocorrencia_id, deleted_at)
  WHERE deleted_at IS NULL;

-- Comentário explicativo na coluna
COMMENT ON COLUMN public.comentarios.deleted_at IS 'Data/hora em que o autor solicitou a exclusão do comentário (soft delete).';
```

---

## 3. Tipagem e Validação (TypeScript & Zod)

### 3.1 Atualização de Tipos: `src/types/database.types.ts`

Adicionar o campo opcional `deleted_at`:

```typescript
export interface Comentario {
  id: string;
  ocorrencia_id: string;
  conteudo: string;
  autor_tipo: UserRole;
  morador_id: string | null;
  funcionario_id: string | null;
  nome_autor: string;
  unidade_autor: string | null;
  created_at: string;
  deleted_at?: string | null; // Novo campo de soft delete
}
```

### 3.2 Esquema de Validação: `src/lib/validations/comentario.schema.ts`

Adicionar esquema para validar payload de exclusão:

```typescript
export const deleteComentarioSchema = z.object({
  comentarioId: z.string().uuid("Identificador do comentário inválido."),
});

export type DeleteComentarioInput = z.infer<typeof deleteComentarioSchema>;
```

---

## 4. Camada de API (Backend)

### 4.1 Rota `DELETE`: `src/app/api/ocorrencias/[id]/comentarios/route.ts`

Adicionar o método `DELETE` para lidar com a exclusão segura:

1. **Obter Parâmetros & Sessão:**
   - Extrair `id` (ID da ocorrência) da URL.
   - Validar sessão via `getCurrentSession()`. Rejeitar se não houver usuário ou se `session.role !== 'morador'`.
2. **Validar Payload com Zod:**
   - Parsear body JSON `{ comentarioId }` contra `deleteComentarioSchema`.
3. **Checar Status da Ocorrência:**
   - Consultar `ocorrencias` pelo `id`.
   - Se `status IN ('resolvida', 'cancelada')`, retornar status 400.
4. **Validar Comentário & Autoria:**
   - Consultar `comentarios` filtrando por `id = comentarioId` e `ocorrencia_id = id`.
   - Se não encontrado, retornar 404.
   - Se `comentario.morador_id !== session.id`, retornar 403 (_"Você só pode excluir seus próprios comentários"_).
   - Se `comentario.deleted_at` já estiver preenchido, retornar 200 idempotente.
5. **Efetuar o Soft Delete:**
   - Atualizar `comentarios`:
     - `conteudo = '[Comentário removido pelo autor]'`
     - `deleted_at = new Date().toISOString()`
   - Retornar `{ success: true, message: "Comentário excluído com sucesso." }`.

---

## 5. Camada de Hooks e Estado (Data Access)

### 5.1 Atualização: `src/hooks/use-ocorrencias.ts`

Incluir a mutation `deleteComentario` dentro do hook `useOcorrenciaDetalhe`:

```typescript
const deleteComentario = useMutation({
  mutationFn: async (comentarioId: string) => {
    const res = await fetch(`/api/ocorrencias/${id}/comentarios`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ comentarioId }),
    });
    const resData = await res.json();
    if (!res.ok) {
      throw new Error(resData.error || "Erro ao excluir comentário.");
    }
    return resData;
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["comentarios", id] });
    toast.success("Comentário excluído com sucesso.");
  },
  onError: (err: Error) => {
    toast.error(err.message);
  },
});
```

Exportar `deleteComentario` no retorno do hook.

---

## 6. Camada de Interface (Frontend)

### 6.1 Atualização: `src/components/ocorrencias/comentarios-thread.tsx`

1. **Novas Props:**
   - `onDeleteComentario?: (comentarioId: string) => Promise<any>`
   - `currentUserId?: string | null`
   - `statusOcorrencia?: StatusOcorrencia`

2. **Estado Local:**
   - `comentarioParaExcluir: Comentario | null` (controla abertura do `Dialog` de confirmação).
   - `isExcluindo: boolean` (desabilita botões e exibe `Loader2` durante a mutação).

3. **Renderização de Card Removido (`comentario.deleted_at` preenchido):**
   - Card com borda tracejada suave (`border-dashed border-slate-200 bg-slate-50/70`).
   - Ícone de usuário atenuado em tom cinza claro.
   - Cabeçalho exibindo nome do autor e data/hora.
   - Corpo do comentário exibindo texto estilizado em itálico com mensagem padronizada:
     `"Este comentário foi removido pelo autor."` (cor `#64748B`).
   - **Sem botão de exclusão**.

4. **Renderização de Card Ativo com Ação de Exclusão:**
   - Se `currentUserId && comentario.morador_id === currentUserId && isOcorrenciaAberta`:
     - Exibir botão discreto com ícone `Trash2` (tamanho 14px, `text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md p-1.5 transition-colors`).
     - Tooltip ou `title="Excluir este comentário"`.
     - Ao clicar, define `setComentarioParaExcluir(comentario)`.

5. **Modal de Confirmação (`Dialog` de `src/components/ui/dialog.tsx`):**
   - **Título:** _"Excluir comentário"_
   - **Descrição:** _"Tem certeza de que deseja excluir este comentário? O texto original será removido permanentemente e esta ação não poderá ser desfeita."_
   - **Botões:**
     - Botão _"Cancelar"_ (fecha o modal).
     - Botão _"Excluir Comentário"_ (estilo `bg-rose-600 text-white hover:bg-rose-700`, com `Loader2` durante envio).

### 6.2 Atualização: `src/app/(condominio)/ocorrencias/[id]/page.tsx`

- Passar os dados para o `ComentariosThread`:
  ```tsx
  <ComentariosThread
    comentarios={comentarios}
    onAddComentario={addComentario.mutateAsync}
    onDeleteComentario={deleteComentario.mutateAsync}
    currentUserId={sessionUser?.id}
    statusOcorrencia={ocorrencia.status}
    isLoading={isLoadingComentarios}
  />
  ```

---

## 7. Roteiro de Testes e Validação

| #       | Cenário                                             | Passos                                                                                  | Resultado Esperado                                                                                              |
| ------- | --------------------------------------------------- | --------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| **T01** | Exclusão de comentário próprio em ocorrência aberta | Morador logado clica na lixeira do seu comentário em ocorrência `registrada` e confirma | Modal fecha, toast confirma, card vira _"Este comentário foi removido pelo autor"_, texto é sanitizado no banco |
| **T02** | Tentativa de excluir comentário de outro usuário    | Morador inspeciona a página ou chama API com ID de comentário alheio                    | Botão não é visível; chamada direta à API retorna 403 Forbidden                                                 |
| **T03** | Tentativa de exclusão em ocorrência `resolvida`     | Ocorrência tem status `resolvida` ou `cancelada`                                        | Botão de lixeira não é renderizado; API bloqueia com HTTP 400                                                   |
| **T04** | Cancelamento da exclusão no modal                   | Morador clica na lixeira e em seguida clica em "Cancelar" ou fecha no `X`               | Modal fecha sem disparar requisição, comentário permanece inalterado                                            |
| **T05** | Sanidade de banco de dados (LGPD)                   | Inspecionar a linha no Supabase após exclusão                                           | `deleted_at` preenchido com timestamp atual e `conteudo` sobrescrito com texto neutro                           |

---

## 8. Checklist de Implementação

- [x] **1. Banco de Dados:** Criar script `supabase/06_add_deleted_at_to_comentarios.sql` com coluna `deleted_at` e índice.
- [x] **2. Tipos & Schemas:**
  - [x] Atualizar interface `Comentario` em `src/types/database.types.ts`.
  - [x] Criar `deleteComentarioSchema` em `src/lib/validations/comentario.schema.ts`.
- [x] **3. Backend:**
  - [x] Implementar método `DELETE` em `src/app/api/ocorrencias/[id]/comentarios/route.ts` com validações de sessão, autoria e status da ocorrência.
- [x] **4. Hooks:**
  - [x] Adicionar `deleteComentario` mutation em `src/hooks/use-ocorrencias.ts`.
- [x] **5. Interface:**
  - [x] Atualizar `ComentariosThread` com suporte a `deleted_at`, botão `Trash2` e modal `Dialog`.
  - [x] Atualizar `src/app/(condominio)/ocorrencias/[id]/page.tsx` para passar `currentUserId`, `statusOcorrencia` e `deleteComentario`.
- [x] **6. Verificação:**
  - [x] Executar typecheck (`pnpm exec tsc --noEmit` ou `npm run build`).
  - [x] Validar fluxos de sucesso e casos de borda.
