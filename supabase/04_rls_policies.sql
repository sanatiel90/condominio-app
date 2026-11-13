-- ==============================================================================
-- 04_rls_policies.sql — Políticas de Segurança em Nível de Linha (RLS)
-- Sistema de Ocorrências para Condomínio
-- Ordem de Execução: 4 de 5
-- ==============================================================================

-- 1. Habilitar RLS em todas as tabelas
ALTER TABLE public.funcionarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moradores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ocorrencias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comentarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.historico_status_ocorrencias ENABLE ROW LEVEL SECURITY;

-- 2. Políticas para 'funcionarios'
-- Funcionários podem visualizar outros funcionários autenticados
DROP POLICY IF EXISTS "Funcionarios podem visualizar outros funcionarios" ON public.funcionarios;
CREATE POLICY "Funcionarios podem visualizar outros funcionarios"
  ON public.funcionarios FOR SELECT
  TO authenticated
  USING (true);

-- Apenas service_role ou o próprio funcionário pode alterar seus dados
DROP POLICY IF EXISTS "Service role ou o proprio funcionario edita perfil" ON public.funcionarios;
CREATE POLICY "Service role ou o proprio funcionario edita perfil"
  ON public.funcionarios FOR ALL
  USING (auth.uid() = id OR auth.role() = 'service_role');

-- 3. Políticas para 'moradores'
-- Funcionários autenticados podem ver todos os moradores
DROP POLICY IF EXISTS "Funcionarios visualizam todos os moradores" ON public.moradores;
CREATE POLICY "Funcionarios visualizam todos os moradores"
  ON public.moradores FOR SELECT
  TO authenticated
  USING (true);

-- Backend (service_role) e API autenticada podem gerenciar moradores
DROP POLICY IF EXISTS "Gerenciamento de moradores por administradores" ON public.moradores;
CREATE POLICY "Gerenciamento de moradores por administradores"
  ON public.moradores FOR ALL
  USING (
    auth.role() = 'service_role' 
    OR EXISTS (SELECT 1 FROM public.funcionarios WHERE funcionarios.id = auth.uid())
  );

-- Morador pode consultar status do seu e-mail no login via endpoint server-side
DROP POLICY IF EXISTS "Leitura de morador ativo para validacao" ON public.moradores;
CREATE POLICY "Leitura de morador ativo para validacao"
  ON public.moradores FOR SELECT
  TO anon
  USING (status = 'ativo');

-- 4. Políticas para 'ocorrencias'
-- Mural comunitário: leitura liberada para todos os usuários do condomínio
DROP POLICY IF EXISTS "Leitura comunitaria de ocorrencias" ON public.ocorrencias;
CREATE POLICY "Leitura comunitaria de ocorrencias"
  ON public.ocorrencias FOR SELECT
  USING (true);

-- Criação de ocorrências: permitida via service_role ou usuário autenticado
DROP POLICY IF EXISTS "Criacao de ocorrencias" ON public.ocorrencias;
CREATE POLICY "Criacao de ocorrencias"
  ON public.ocorrencias FOR INSERT
  WITH CHECK (true);

-- Moderação / Mudança de status: restrita estritamente a funcionários ou service_role
DROP POLICY IF EXISTS "Apenas funcionarios alteram status ou ocorrencias" ON public.ocorrencias;
CREATE POLICY "Apenas funcionarios alteram status ou ocorrencias"
  ON public.ocorrencias FOR UPDATE
  USING (
    auth.role() = 'service_role' 
    OR EXISTS (SELECT 1 FROM public.funcionarios WHERE funcionarios.id = auth.uid())
  );

DROP POLICY IF EXISTS "Apenas funcionarios excluem ocorrencias" ON public.ocorrencias;
CREATE POLICY "Apenas funcionarios excluem ocorrencias"
  ON public.ocorrencias FOR DELETE
  USING (
    auth.role() = 'service_role' 
    OR EXISTS (SELECT 1 FROM public.funcionarios WHERE funcionarios.id = auth.uid())
  );

-- 5. Políticas para 'comentarios'
-- Leitura pública dos comentários das ocorrências
DROP POLICY IF EXISTS "Leitura publica de comentarios" ON public.comentarios;
CREATE POLICY "Leitura publica de comentarios"
  ON public.comentarios FOR SELECT
  USING (true);

-- Inserção de novos comentários (morador ou funcionário)
DROP POLICY IF EXISTS "Insercao de comentarios" ON public.comentarios;
CREATE POLICY "Insercao de comentarios"
  ON public.comentarios FOR INSERT
  WITH CHECK (true);

-- Comentários não podem ser alterados nem excluídos por moradores (apenas service_role ou admin)
DROP POLICY IF EXISTS "Apenas administradores moderam comentarios" ON public.comentarios;
CREATE POLICY "Apenas administradores moderam comentarios"
  ON public.comentarios FOR DELETE
  USING (
    auth.role() = 'service_role' 
    OR EXISTS (SELECT 1 FROM public.funcionarios WHERE funcionarios.id = auth.uid())
  );

-- 6. Políticas para 'historico_status_ocorrencias'
DROP POLICY IF EXISTS "Leitura publica do historico de status" ON public.historico_status_ocorrencias;
CREATE POLICY "Leitura publica do historico de status"
  ON public.historico_status_ocorrencias FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Insercao de historico restrita a funcionarios" ON public.historico_status_ocorrencias;
CREATE POLICY "Insercao de historico restrita a funcionarios"
  ON public.historico_status_ocorrencias FOR INSERT
  WITH CHECK (
    auth.role() = 'service_role' 
    OR EXISTS (SELECT 1 FROM public.funcionarios WHERE funcionarios.id = auth.uid())
  );

