import * as z from "zod";

export const RejeitarSolicitacaoSchema = z.object({
  motivo: z
    .string()
    .trim()
    .min(10, { error: "Informe um motivo com pelo menos 10 caracteres." })
    .max(500),
});
