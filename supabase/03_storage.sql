-- ==============================================================================
-- 03_storage.sql — Configuração do Bucket e Políticas de Storage
-- Sistema de Ocorrências para Condomínio
-- Ordem de Execução: 3 de 5
-- ==============================================================================

-- 1. Criação do bucket 'ocorrencias-fotos' (se ainda não existir)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'ocorrencias-fotos',
  'ocorrencias-fotos',
  true,
  5242880, -- 5 MB em bytes
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

-- 2. Políticas de Acesso para storage.objects
-- Leitura pública para que qualquer pessoa/morador possa visualizar as fotos das ocorrências
DROP POLICY IF EXISTS "Fotos de ocorrencias sao publicas para visualizacao" ON storage.objects;
CREATE POLICY "Fotos de ocorrencias sao publicas para visualizacao"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'ocorrencias-fotos');

-- Upload permitido para usuários autenticados ou através da aplicação
DROP POLICY IF EXISTS "Upload permitido no bucket ocorrencias-fotos" ON storage.objects;
CREATE POLICY "Upload permitido no bucket ocorrencias-fotos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'ocorrencias-fotos');

-- Exclusão restrita a administradores / service role
DROP POLICY IF EXISTS "Exclusao de fotos restrita a administracao" ON storage.objects;
CREATE POLICY "Exclusao de fotos restrita a administracao"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'ocorrencias-fotos' 
    AND (
      auth.role() = 'service_role' 
      OR EXISTS (
        SELECT 1 FROM public.funcionarios WHERE funcionarios.id = auth.uid()
      )
    )
  );

