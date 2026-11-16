-- ==============================================================================
-- 06_add_deleted_at_to_comentarios.sql — Soft Delete em Comentários
-- Sistema de Ocorrências para Condomínio
-- Ordem de Execução: 6
-- ==============================================================================

-- 1. Adicionar coluna deleted_at na tabela comentarios
ALTER TABLE public.comentarios 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

-- 2. Índice parcial para otimizar consultas que filtram comentários ativos
CREATE INDEX IF NOT EXISTS idx_comentarios_ocorrencia_deleted 
  ON public.comentarios (ocorrencia_id, deleted_at)
  WHERE deleted_at IS NULL;

-- Comentário explicativo na coluna
COMMENT ON COLUMN public.comentarios.deleted_at IS 'Data/hora em que o autor solicitou a exclusão do comentário (soft delete).';
