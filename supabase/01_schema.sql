-- ==============================================================================
-- 01_schema.sql — Definição de Tipos, Tabelas Base e Triggers
-- Sistema de Ocorrências para Condomínio
-- Ordem de Execução: 1 de 5
-- ==============================================================================

-- 1. Extensões
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Tipos Enumerados (Enums)
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('morador', 'funcionario');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE status_morador AS ENUM ('ativo', 'inativo');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE categoria_ocorrencia AS ENUM (
    'Barulho', 
    'Manutenção', 
    'Segurança', 
    'Limpeza', 
    'Convivência', 
    'Outros'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE status_ocorrencia AS ENUM (
    'Aberta', 
    'Em Análise', 
    'Em Andamento', 
    'Resolvida', 
    'Cancelada'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 3. Função para atualização automática do campo updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Tabela: funcionarios (vinculada a auth.users do Supabase)
CREATE TABLE IF NOT EXISTS public.funcionarios (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome VARCHAR(150) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  cargo VARCHAR(100) DEFAULT 'Administração' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Tabela: moradores
CREATE TABLE IF NOT EXISTS public.moradores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(150) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  torre VARCHAR(50) NOT NULL,
  apartamento VARCHAR(50) NOT NULL,
  telefone VARCHAR(30) NOT NULL,
  status status_morador DEFAULT 'ativo' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

DROP TRIGGER IF EXISTS trigger_moradores_updated_at ON public.moradores;
CREATE TRIGGER trigger_moradores_updated_at
  BEFORE UPDATE ON public.moradores
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 6. Tabela: ocorrencias
CREATE TABLE IF NOT EXISTS public.ocorrencias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero_sequencial BIGINT GENERATED ALWAYS AS IDENTITY,
  titulo VARCHAR(100) NOT NULL,
  descricao TEXT NOT NULL,
  categoria categoria_ocorrencia NOT NULL,
  local VARCHAR(255) NOT NULL,
  foto_url TEXT,
  status status_ocorrencia DEFAULT 'Aberta' NOT NULL,
  autor_tipo user_role NOT NULL,
  morador_id UUID REFERENCES public.moradores(id) ON DELETE SET NULL,
  funcionario_id UUID REFERENCES public.funcionarios(id) ON DELETE SET NULL,
  nome_autor VARCHAR(150) NOT NULL,
  unidade_autor VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  CONSTRAINT check_autor_valido CHECK (
    (autor_tipo = 'morador' AND morador_id IS NOT NULL) OR
    (autor_tipo = 'funcionario' AND funcionario_id IS NOT NULL)
  )
);

DROP TRIGGER IF EXISTS trigger_ocorrencias_updated_at ON public.ocorrencias;
CREATE TRIGGER trigger_ocorrencias_updated_at
  BEFORE UPDATE ON public.ocorrencias
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 7. Tabela: comentarios
CREATE TABLE IF NOT EXISTS public.comentarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ocorrencia_id UUID NOT NULL REFERENCES public.ocorrencias(id) ON DELETE CASCADE,
  conteudo VARCHAR(1000) NOT NULL,
  autor_tipo user_role NOT NULL,
  morador_id UUID REFERENCES public.moradores(id) ON DELETE SET NULL,
  funcionario_id UUID REFERENCES public.funcionarios(id) ON DELETE SET NULL,
  nome_autor VARCHAR(150) NOT NULL,
  unidade_autor VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,

  CONSTRAINT check_comentario_autor CHECK (
    (autor_tipo = 'morador' AND morador_id IS NOT NULL) OR
    (autor_tipo = 'funcionario' AND funcionario_id IS NOT NULL)
  )
);

-- 8. Tabela: historico_status_ocorrencias
CREATE TABLE IF NOT EXISTS public.historico_status_ocorrencias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ocorrencia_id UUID NOT NULL REFERENCES public.ocorrencias(id) ON DELETE CASCADE,
  status_anterior status_ocorrencia NOT NULL,
  status_novo status_ocorrencia NOT NULL,
  funcionario_id UUID NOT NULL REFERENCES public.funcionarios(id) ON DELETE CASCADE,
  observacao TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

