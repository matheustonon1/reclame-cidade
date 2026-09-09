import * as z from "zod";

export const RespostaOficialSchema = z.object({
  texto: z
    .string()
    .trim()
    .min(10, { error: "A resposta deve ter pelo menos 10 caracteres." }),
  novoStatus: z
    .union([z.literal(""), z.enum(["EM_ANDAMENTO", "RESOLVIDA"])])
    .transform((valor) => (valor === "" ? undefined : valor)),
  prazoEstimado: z
    .union([
      z.literal(""),
      z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
        error: "Data inválida.",
      }),
    ])
    .transform((valor) => (valor === "" ? undefined : valor)),
});

export const AvaliacaoSchema = z.object({
  nota: z.coerce.number().int().min(1).max(5),
  resolvido: z.enum(["true", "false"]).transform((valor) => valor === "true"),
  comentario: z
    .union([z.literal(""), z.string().trim().max(1000)])
    .transform((valor) => (valor === "" ? undefined : valor)),
});
