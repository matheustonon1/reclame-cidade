"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function alternarConfirmacao(
  reclamacaoId: string,
  protocolo: string
) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const reclamacao = await prisma.reclamacao.findUnique({
    where: { id: reclamacaoId },
  });

  if (!reclamacao || reclamacao.autorId === session.user.id) {
    return;
  }

  const chave = {
    userId_reclamacaoId: {
      userId: session.user.id,
      reclamacaoId,
    },
  };

  const existente = await prisma.confirmacao.findUnique({ where: chave });

  if (existente) {
    await prisma.confirmacao.delete({ where: chave });
  } else {
    await prisma.confirmacao.create({
      data: { userId: session.user.id, reclamacaoId },
    });
  }

  revalidatePath(`/reclamacoes/${protocolo}`);
}
