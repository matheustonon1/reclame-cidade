import * as z from "zod";

export const SolicitarOrgaoSchema = z.object({
  nomeOrgao: z.string().trim().min(2, { error: "Informe o nome do órgão." }),
  sigla: z.string().trim().max(20).optional().or(z.literal("")),
  cidadeId: z.string().trim().min(1, { error: "Selecione a cidade." }),
  nomeResponsavel: z.string().trim().min(2, { error: "Informe o nome do responsável." }),
  email: z.email({ error: "Informe um e-mail válido." }).trim(),
  telefone: z.string().trim().max(20).optional().or(z.literal("")),
});

export type SolicitarOrgaoFormState =
  | {
      erros?: {
        nomeOrgao?: string[];
        sigla?: string[];
        cidadeId?: string[];
        nomeResponsavel?: string[];
        email?: string[];
        telefone?: string[];
      };
      mensagem?: string;
      sucesso?: boolean;
    }
  | undefined;
