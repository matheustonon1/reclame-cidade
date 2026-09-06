"use server";

import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { moderarReclamacao } from "@/lib/moderacao";
import { gerarProtocolo } from "@/lib/protocolo";

import { NovaReclamacaoSchema, type NovaReclamacaoFormState } from "./definitions";

export async function criarReclamacao(
  _state: NovaReclamacaoFormState,
  formData: FormData
): Promise<NovaReclamacaoFormState> {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const validado = NovaReclamacaoSchema.safeParse({
    titulo: formData.get("titulo"),
    descricao: formData.get("descricao"),
    categoriaId: formData.get("categoriaId") ?? "",
    cidadeId: formData.get("cidadeId") ?? "",
    endereco: formData.get("endereco"),
    referencia: formData.get("referencia"),
    cep: formData.get("cep"),
  });

  if (!validado.success) {
    return { erros: validado.error.flatten().fieldErrors };
  }

  const { titulo, descricao, categoriaId, cidadeId, endereco, referencia, cep } =
    validado.data;

  const protocolo = await gerarProtocolo();

  const reclamacao = await prisma.reclamacao.create({
    data: {
      protocolo,
      titulo,
      descricao,
      autorId: session.user.id,
      categoriaId,
      cidadeId,
      endereco,
      referencia: referencia || null,
      cep: cep || null,
    },
  });

  try {
    await moderarReclamacao(reclamacao.id);
  } catch (erro) {
    console.error("Falha na moderação automática:", erro);
  }

  redirect(`/reclamacoes/${reclamacao.protocolo}`);
}
