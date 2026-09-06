import * as z from "zod";

export const CadastroSchema = z
  .object({
    nome: z.string().trim().min(2, { error: "Informe seu nome completo." }),
    email: z.email({ error: "Informe um e-mail válido." }).trim(),
    senha: z
      .string()
      .min(8, { error: "A senha deve ter ao menos 8 caracteres." }),
    confirmarSenha: z.string(),
  })
  .refine((dados) => dados.senha === dados.confirmarSenha, {
    error: "As senhas não conferem.",
    path: ["confirmarSenha"],
  });

export type CadastroFormState =
  | {
      erros?: {
        nome?: string[];
        email?: string[];
        senha?: string[];
        confirmarSenha?: string[];
      };
      mensagem?: string;
    }
  | undefined;
