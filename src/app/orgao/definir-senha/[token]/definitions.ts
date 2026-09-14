import * as z from "zod";

export const DefinirSenhaSchema = z
  .object({
    senha: z.string().min(8, { error: "A senha deve ter ao menos 8 caracteres." }),
    confirmarSenha: z.string(),
  })
  .refine((dados) => dados.senha === dados.confirmarSenha, {
    error: "As senhas não conferem.",
    path: ["confirmarSenha"],
  });

export type DefinirSenhaFormState =
  | {
      erros?: { senha?: string[]; confirmarSenha?: string[] };
      mensagem?: string;
    }
  | undefined;
