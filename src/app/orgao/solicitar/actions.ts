"use server";

import { prisma } from "@/lib/prisma";

import { SolicitarOrgaoSchema, type SolicitarOrgaoFormState } from "./definitions";

export async function solicitarOrgao(
  _state: SolicitarOrgaoFormState,
  formData: FormData
): Promise<SolicitarOrgaoFormState> {
  const validado = SolicitarOrgaoSchema.safeParse({
    nomeOrgao: formData.get("nomeOrgao"),
    sigla: formData.get("sigla"),
    cidadeId: formData.get("cidadeId"),
    nomeResponsavel: formData.get("nomeResponsavel"),
    email: formData.get("email"),
    telefone: formData.get("telefone"),
  });
  if (!validado.success) {
    return { erros: validado.error.flatten().fieldErrors };
  }

  const { nomeOrgao, sigla, cidadeId, nomeResponsavel, email, telefone } = validado.data;

  const cidade = await prisma.cidade.findUnique({ where: { id: cidadeId } });
  if (!cidade) {
    return { erros: { cidadeId: ["Cidade inválida."] } };
  }

  const usuarioExistente = await prisma.user.findUnique({ where: { email } });
  if (usuarioExistente) {
    return { erros: { email: ["Já existe uma conta com este e-mail."] } };
  }

  const solicitacaoPendente = await prisma.solicitacaoOrgao.findFirst({
    where: { email, status: "PENDENTE" },
  });
  if (solicitacaoPendente) {
    return {
      mensagem: "Já existe uma solicitação pendente com este e-mail. Aguarde a análise.",
    };
  }

  await prisma.solicitacaoOrgao.create({
    data: {
      nomeOrgao,
      sigla: sigla || null,
      cidadeId,
      nomeResponsavel,
      email,
      telefone: telefone || null,
    },
  });

  return {
    sucesso: true,
    mensagem: "Solicitação enviada! Um administrador vai analisar e você recebe um e-mail com o resultado.",
  };
}
