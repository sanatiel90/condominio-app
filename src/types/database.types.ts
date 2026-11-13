export type UserRole = "morador" | "funcionario";
export type StatusMorador = "ativo" | "inativo";
export type CategoriaOcorrencia =
  | "Barulho"
  | "Manutenção"
  | "Segurança"
  | "Limpeza"
  | "Convivência"
  | "Outros";

export type StatusOcorrencia =
  | "Aberta"
  | "Em Análise"
  | "Em Andamento"
  | "Resolvida"
  | "Cancelada";

export interface Funcionario {
  id: string;
  nome: string;
  email: string;
  cargo: string;
  created_at: string;
}

export interface Morador {
  id: string;
  nome: string;
  email: string;
  torre: string;
  apartamento: string;
  telefone: string;
  status: StatusMorador;
  created_at: string;
  updated_at: string;
}

export interface Ocorrencia {
  id: string;
  numero_sequencial: number;
  titulo: string;
  descricao: string;
  categoria: CategoriaOcorrencia;
  local: string;
  foto_url: string | null;
  status: StatusOcorrencia;
  autor_tipo: UserRole;
  morador_id: string | null;
  funcionario_id: string | null;
  nome_autor: string;
  unidade_autor: string | null;
  created_at: string;
  updated_at: string;
  comentarios_count?: number;
}

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
}

export interface HistoricoStatus {
  id: string;
  ocorrencia_id: string;
  status_anterior: StatusOcorrencia;
  status_novo: StatusOcorrencia;
  funcionario_id: string;
  observacao: string | null;
  created_at: string;
}

export interface MoradorSession {
  id: string;
  nome: string;
  email: string;
  torre: string;
  apartamento: string;
  role: "morador";
}

export interface FuncionarioSession {
  id: string;
  nome: string;
  email: string;
  cargo: string;
  role: "funcionario";
}

export type CurrentSession = MoradorSession | FuncionarioSession;

