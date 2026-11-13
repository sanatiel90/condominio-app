-- ==============================================================================
-- 05_seed.sql — Dados Iniciais para Homologação e Testes (Seed)
-- Sistema de Ocorrências para Condomínio
-- Ordem de Execução: 5 de 5
-- ==============================================================================

-- 1. Moradores de demonstração
INSERT INTO public.moradores (id, nome, email, torre, apartamento, telefone, status)
VALUES 
  (
    'a1111111-1111-1111-1111-111111111111',
    'Carlos Silva',
    'carlos.silva@aurora.com',
    'Torre A',
    '101',
    '(11) 98765-4321',
    'ativo'
  ),
  (
    'a2222222-2222-2222-2222-222222222222',
    'Mariana Costa',
    'mariana.costa@aurora.com',
    'Torre B',
    '402',
    '(11) 91234-5678',
    'ativo'
  ),
  (
    'a3333333-3333-3333-3333-333333333333',
    'Roberto Almeida',
    'roberto.almeida@aurora.com',
    'Torre A',
    '804',
    '(11) 99887-7665',
    'ativo'
  ),
  (
    'a4444444-4444-4444-4444-444444444444',
    'Lucas Moraes (Ex-morador)',
    'lucas.moraes@aurora.com',
    'Torre B',
    '203',
    '(11) 97777-6666',
    'inativo'
  )
ON CONFLICT (email) DO NOTHING;

-- 2. Ocorrências de demonstração
INSERT INTO public.ocorrencias (
  id,
  titulo,
  descricao,
  categoria,
  local,
  foto_url,
  status,
  autor_tipo,
  morador_id,
  nome_autor,
  unidade_autor,
  created_at
)
VALUES
  (
    'b1111111-1111-1111-1111-111111111111',
    'Barulho excessivo após as 22h',
    'Música alta e barulho constante vindos da unidade no último fim de semana.',
    'Barulho',
    'Torre A - 2º Andar',
    NULL,
    'Aberta',
    'morador',
    'a1111111-1111-1111-1111-111111111111',
    'Carlos Silva',
    'Torre A - Apto 101',
    NOW() - INTERVAL '3 hours'
  ),
  (
    'b2222222-2222-2222-2222-222222222222',
    'Vazamento de água na garagem G1',
    'Há uma poça d''água aumentando próxima à vaga 22, aparentemente vindo de uma tubulação suspensa.',
    'Manutenção',
    'Garagem Subsolo G1 vaga 22',
    NULL,
    'Em Andamento',
    'morador',
    'a2222222-2222-2222-2222-222222222222',
    'Mariana Costa',
    'Torre B - Apto 402',
    NOW() - INTERVAL '1 day'
  ),
  (
    'b3333333-3333-3333-3333-333333333333',
    'Lâmpada queimada no hall de entrada',
    'A luminária principal do hall social da Torre A parou de funcionar.',
    'Manutenção',
    'Hall Social Torre A',
    NULL,
    'Resolvida',
    'morador',
    'a3333333-3333-3333-3333-333333333333',
    'Roberto Almeida',
    'Torre A - Apto 804',
    NOW() - INTERVAL '3 days'
  )
ON CONFLICT (id) DO NOTHING;

-- 3. Comentários de demonstração
INSERT INTO public.comentarios (
  id,
  ocorrencia_id,
  conteudo,
  autor_tipo,
  morador_id,
  nome_autor,
  unidade_autor,
  created_at
)
VALUES
  (
    'c1111111-1111-1111-1111-111111111111',
    'b2222222-2222-2222-2222-222222222222',
    'Equipe de manutenção predial já foi acionada e o encanador chega às 14h para reparo da tubulação.',
    'funcionario',
    NULL,
    'Administração / Zeladoria',
    'Gestão Predial',
    NOW() - INTERVAL '18 hours'
  ),
  (
    'c2222222-2222-2222-2222-222222222222',
    'b2222222-2222-2222-2222-222222222222',
    'Obrigada pelo retorno rápido!',
    'morador',
    'a2222222-2222-2222-2222-222222222222',
    'Mariana Costa',
    'Torre B - Apto 402',
    NOW() - INTERVAL '17 hours'
  )
ON CONFLICT (id) DO NOTHING;

