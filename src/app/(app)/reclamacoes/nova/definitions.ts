import * as z from "zod";

export const NovaReclamacaoSchema = z.object({
  titulo: z
    .string()
    .trim()
    .min(10, { error: "O título deve ter ao menos 10 caracteres." })
    .max(180),
  descricao: z
    .string()
    .trim()
    .min(30, { error: "Descreva o problema com pelo menos 30 caracteres." }),
  categoriaId: z.string().min(1, { error: "Selecione uma categoria." }),
  cidadeId: z.string().min(1, { error: "Selecione a cidade." }),
  endereco: z
    .string()
    .trim()
    .min(5, { error: "Informe o endereço." })
    .max(255),
  referencia: z.string().trim().max(255).optional().or(z.literal("")),
  cep: z.string().trim().max(9).optional().or(z.literal("")),
});

export type NovaReclamacaoFormState =
  | {
      erros?: {
        titulo?: string[];
        descricao?: string[];
        categoriaId?: string[];
        cidadeId?: string[];
        endereco?: string[];
        referencia?: string[];
        cep?: string[];
      };
      mensagem?: string;
    }
  | undefined;
