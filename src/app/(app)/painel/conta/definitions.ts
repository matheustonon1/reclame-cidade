import * as z from "zod";

export const PerfilSchema = z.object({
  nome: z.string().trim().min(2, { error: "Informe seu nome completo." }),
  telefone: z.string().trim().max(20).optional().or(z.literal("")),
});

export type PerfilFormState =
  | {
      erros?: { nome?: string[]; telefone?: string[] };
      mensagem?: string;
    }
  | undefined;

export const SenhaSchema = z
  .object({
    senhaAtual: z.string().min(1, { error: "Informe sua senha atual." }),
    novaSenha: z
      .string()
      .min(8, { error: "A nova senha deve ter ao menos 8 caracteres." }),
    confirmarNovaSenha: z.string(),
  })
  .refine((dados) => dados.novaSenha === dados.confirmarNovaSenha, {
    error: "As senhas não conferem.",
    path: ["confirmarNovaSenha"],
  });

export type SenhaFormState =
  | {
      erros?: {
        senhaAtual?: string[];
        novaSenha?: string[];
        confirmarNovaSenha?: string[];
      };
      mensagem?: string;
    }
  | undefined;

export const ExclusaoSchema = z.object({
  senhaAtual: z.string().min(1, { error: "Informe sua senha atual." }),
});

export type ExclusaoFormState =
  | {
      erros?: { senhaAtual?: string[] };
      mensagem?: string;
    }
  | undefined;
