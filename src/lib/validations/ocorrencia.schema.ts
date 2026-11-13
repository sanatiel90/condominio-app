import { z } from "zod";

export const CATEGORIAS_OCORRENCIA = [
  "Barulho",
  "Manutenção",
  "Segurança",
  "Limpeza",
  "Convivência",
  "Outros",
] as const;

export const STATUS_OCORRENCIA = [
  "Aberta",
  "Em Análise",
  "Em Andamento",
  "Resolvida",
  "Cancelada",
] as const;

export const ocorrenciaFormSchema = z.object({
  titulo: z
    .string()
    .trim()
    .min(5, "O título deve ter no mínimo 5 caracteres.")
    .max(100, "O título deve ter no máximo 100 caracteres."),
  categoria: z.enum(CATEGORIAS_OCORRENCIA, {
    message: "Selecione uma categoria válida.",
  }),
  local: z
    .string()
    .trim()
    .min(3, "O local deve ter no mínimo 3 caracteres (ex.: Garagem G1, Hall Torre A)."),
  descricao: z
    .string()
    .trim()
    .min(10, "A descrição deve conter no mínimo 10 caracteres detalhando a solicitação."),
  foto_url: z.string().optional().nullable(),
});

export const ocorrenciaStatusSchema = z.object({
  status: z.enum(STATUS_OCORRENCIA, {
    message: "Status informado inválido.",
  }),
  observacao: z.string().optional(),
});

export type OcorrenciaFormInput = z.infer<typeof ocorrenciaFormSchema>;
export type OcorrenciaStatusInput = z.infer<typeof ocorrenciaStatusSchema>;

