import { z } from "zod";

export const comentarioSchema = z.object({
  conteudo: z
    .string()
    .trim()
    .min(2, "O comentário deve conter pelo menos 2 caracteres.")
    .max(1000, "O comentário não pode exceder 1.000 caracteres."),
});

export type ComentarioInput = z.infer<typeof comentarioSchema>;

