import { z } from "zod";

export const moradorLoginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "O e-mail é obrigatório.")
    .email("Informe um endereço de e-mail válido."),
});

export const moradorFormSchema = z.object({
  nome: z
    .string()
    .trim()
    .min(3, "O nome completo deve ter no mínimo 3 caracteres."),
  email: z
    .string()
    .trim()
    .min(1, "O e-mail é obrigatório.")
    .email("Informe um endereço de e-mail válido."),
  torre: z
    .string()
    .trim()
    .min(1, "A torre ou bloco é obrigatório."),
  apartamento: z
    .string()
    .trim()
    .min(1, "O número do apartamento é obrigatório."),
  telefone: z
    .string()
    .trim()
    .min(8, "Informe um telefone ou celular válido com DDD."),
  status: z.enum(["ativo", "inativo"]).default("ativo"),
});

export type MoradorLoginInput = z.infer<typeof moradorLoginSchema>;
export type MoradorFormInput = z.infer<typeof moradorFormSchema>;

