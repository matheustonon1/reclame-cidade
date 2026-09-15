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

export const DenunciaSchema = z.object({
  motivo: z.enum([
    "OFENSIVO",
    "SPAM",
    "DESINFORMACAO",
    "FORA_DE_ESCOPO",
    "DADOS_PESSOAIS",
    "DUPLICADA",
    "OUTRO",
  ]),
  descricao: z
    .union([z.literal(""), z.string().trim().max(1000)])
    .transform((valor) => (valor === "" ? undefined : valor)),
  declaracaoVeracidade: z.literal("on", {
    error: "É preciso confirmar que a denúncia é feita de boa-fé.",
  }),
});

export const RecursoSchema = z.object({
  texto: z
    .string()
    .trim()
    .min(20, { error: "Explique com mais detalhes por que a rejeição deveria ser revista (mín. 20 caracteres)." })
    .max(1000, { error: "Texto muito longo (máx. 1000 caracteres)." }),
});

export const ComentarioSchema = z.object({
  texto: z
    .string()
    .trim()
    .min(3, { error: "Comentário muito curto." })
    .max(1000, { error: "Comentário muito longo (máx. 1000 caracteres)." }),
  paiId: z
    .union([z.literal(""), z.string()])
    .transform((valor) => (valor === "" ? undefined : valor)),
});
