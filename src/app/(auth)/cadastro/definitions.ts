import * as z from "zod";

import { validarCpf } from "@/lib/cpf";

export const CadastroSchema = z
  .object({
    nome: z.string().trim().min(2, { error: "Informe seu nome completo." }).max(100),
    email: z.email({ error: "Informe um e-mail válido." }).trim().max(254),
    cpf: z.string().trim().refine(validarCpf, { error: "CPF inválido." }),
    senha: z
      .string()
      .min(8, { error: "A senha deve ter ao menos 8 caracteres." })
      .max(100),
    confirmarSenha: z.string().max(100),
    aceitaTermos: z.literal("on", {
      error: "É preciso aceitar os Termos de Uso e a Política de Privacidade.",
    }),
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
        cpf?: string[];
        senha?: string[];
        confirmarSenha?: string[];
        aceitaTermos?: string[];
      };
      mensagem?: string;
    }
  | undefined;
