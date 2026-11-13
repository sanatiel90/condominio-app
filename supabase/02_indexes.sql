-- ==============================================================================
-- 02_indexes.sql — Índices de Performance e Integridade Relacional
-- Sistema de Ocorrências para Condomínio
-- Ordem de Execução: 2 de 5
-- ==============================================================================

-- 1. Índices para moradores
-- Índice case-insensitive para busca e validação de unicidade de e-mail no login
CREATE UNIQUE INDEX IF NOT EXISTS idx_moradores_email_lower 
  ON public.moradores (lower(email));

-- Índice para filtragem rápida por status (ativo/inativo)
CREATE INDEX IF NOT EXISTS idx_moradores_status 
  ON public.moradores (status);

-- Índice para busca textual de moradores por nome
CREATE INDEX IF NOT EXISTS idx_moradores_nome 
  ON public.moradores (nome);

-- 2. Índices para ocorrencias
-- Ordenação principal do mural (mais recentes primeiro)
CREATE INDEX IF NOT EXISTS idx_ocorrencias_created_at_desc 
  ON public.ocorrencias (created_at DESC);

-- Índice composto para filtro rápido por status + ordenação
CREATE INDEX IF NOT EXISTS idx_ocorrencias_status_created_at 
  ON public.ocorrencias (status, created_at DESC);

-- Índice composto para filtro rápido por categoria + ordenação
CREATE INDEX IF NOT EXISTS idx_ocorrencias_categoria_created_at 
  ON public.ocorrencias (categoria, created_at DESC);

-- Chaves estrangeiras
CREATE INDEX IF NOT EXISTS idx_ocorrencias_morador_id 
  ON public.ocorrencias (morador_id);

CREATE INDEX IF NOT EXISTS idx_ocorrencias_funcionario_id 
  ON public.ocorrencias (funcionario_id);

-- 3. Índices para comentarios
-- Índice composto crítico para carregar toda a thread de uma ocorrência ordenada
CREATE INDEX IF NOT EXISTS idx_comentarios_ocorrencia_created 
  ON public.comentarios (ocorrencia_id, created_at ASC);

CREATE INDEX IF NOT EXISTS idx_comentarios_morador_id 
  ON public.comentarios (morador_id);

CREATE INDEX IF NOT EXISTS idx_comentarios_funcionario_id 
  ON public.comentarios (funcionario_id);

-- 4. Índices para historico_status_ocorrencias
CREATE INDEX IF NOT EXISTS idx_historico_ocorrencia_id 
  ON public.historico_status_ocorrencias (ocorrencia_id, created_at ASC);

CREATE INDEX IF NOT EXISTS idx_historico_funcionario_id 
  ON public.historico_status_ocorrencias (funcionario_id);

