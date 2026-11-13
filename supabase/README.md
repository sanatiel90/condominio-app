# Scripts SQL de Banco de Dados — Supabase

Todos os scripts de banco de dados do Sistema de Ocorrências estão organizados em ordem estrita de execução nesta pasta:

## Ordem de Execução

1. **[`01_schema.sql`](file:///c:/Users/Sanatiel/meus_projetos/condominio-app/supabase/01_schema.sql)**
   - Extensões (`uuid-ossp`, `pgcrypto`)
   - Enums (`user_role`, `status_morador`, `categoria_ocorrencia`, `status_ocorrencia`)
   - Função e triggers de `updated_at`
   - Tabelas: `funcionarios`, `moradores`, `ocorrencias`, `comentarios`, `historico_status_ocorrencias`

2. **[`02_indexes.sql`](file:///c:/Users/Sanatiel/meus_projetos/condominio-app/supabase/02_indexes.sql)**
   - Índice único `lower(email)` para moradores
   - Índices compostos de ordenação e filtro para o mural (`status, created_at DESC`, `categoria, created_at DESC`)
   - Índices para todas as chaves estrangeiras
   - Índice composto para comentários (`ocorrencia_id, created_at ASC`)

3. **[`03_storage.sql`](file:///c:/Users/Sanatiel/meus_projetos/condominio-app/supabase/03_storage.sql)**
   - Criação do bucket `ocorrencias-fotos` (limite 5MB, MIME types: JPG, PNG, WEBP)
   - Políticas de visualização pública e upload autenticado/aplicação

4. **[`04_rls_policies.sql`](file:///c:/Users/Sanatiel/meus_projetos/condominio-app/supabase/04_rls_policies.sql)**
   - Habilitação de Row Level Security (RLS) em todas as tabelas
   - Políticas de acesso e restrições (moradores não alteram status; apenas funcionários moderam)

5. **[`05_seed.sql`](file:///c:/Users/Sanatiel/meus_projetos/condominio-app/supabase/05_seed.sql)** *(Opcional para ambiente de desenvolvimento/teste)*
   - Moradores de demonstração (`carlos.silva@aurora.com`, `mariana.costa@aurora.com`, `roberto.almeida@aurora.com` e 1 inativo para testar bloqueio)
   - Ocorrências de exemplo com diferentes status
   - Comentários de exemplo na timeline

---

## Como Executar

### Opção 1: Via Supabase Dashboard (SQL Editor)
Copie o conteúdo de cada arquivo na ordem (01 até 05) e execute no **SQL Editor** do projeto Supabase.

### Opção 2: Via Supabase CLI
```bash
supabase db push
# ou executar sequencialmente
psql -h <host> -U postgres -d postgres -f supabase/01_schema.sql
psql -h <host> -U postgres -d postgres -f supabase/02_indexes.sql
psql -h <host> -U postgres -d postgres -f supabase/03_storage.sql
psql -h <host> -U postgres -d postgres -f supabase/04_rls_policies.sql
psql -h <host> -U postgres -d postgres -f supabase/05_seed.sql
```

