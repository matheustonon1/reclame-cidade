"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";

import { exigirModerador } from "../exigir-moderador";

async function buscarLogPendente(comentarioId: string) {
  return prisma.logModeracao.findFirst({
    where: {
      alvoTipo: "COMENTARIO",
      alvoId: comentarioId,
      decisao: "REPROVAR",
      revisadoEm: null,
    },
    orderBy: { createdAt: "desc" },
  });
}

async function revalidarReclamacaoDoComentario(reclamacaoId: string) {
  const reclamacao = await prisma.reclamacao.findUnique({
    where: { id: reclamacaoId },
    select: { protocolo: true },
  });
  if (reclamacao) {
    revalidatePath(`/reclamacoes/${reclamacao.protocolo}`);
  }
}

// Comentário não tem fila de "aguardando revisão" (decisão da IA é
// sempre final na hora) - "revisar" aqui é sempre uma correção
// retroativa de um comentário já reprovado, feita a partir do log.
export async function aprovarComentarioReprovado(comentarioId: string) {
  const session = await exigirModerador();

  const comentario = await prisma.comentario.findUnique({ where: { id: comentarioId } });
  if (!comentario || comentario.statusModeracao !== "REPROVADO") {
    return;
  }

  const log = await buscarLogPendente(comentarioId);
  const agora = new Date();

  await prisma.$transaction([
    prisma.comentario.update({
      where: { id: comentarioId },
      data: { statusModeracao: "APROVADO" },
    }),
    ...(log
      ? [
          prisma.logModeracao.update({
            where: { id: log.id },
            data: { revisadoPorId: session.user.id, decisaoFinal: "APROVAR", revisadoEm: agora },
          }),
        ]
      : []),
  ]);

  await revalidarReclamacaoDoComentario(comentario.reclamacaoId);
  revalidatePath("/moderacao/comentarios");
  revalidatePath("/moderacao/historico/comentarios");
}

export async function confirmarRejeicaoComentario(comentarioId: string) {
  const session = await exigirModerador();

  const log = await buscarLogPendente(comentarioId);
  if (!log) {
    return;
  }

  await prisma.logModeracao.update({
    where: { id: log.id },
    data: { revisadoPorId: session.user.id, decisaoFinal: "REPROVAR", revisadoEm: new Date() },
  });

  revalidatePath("/moderacao/comentarios");
  revalidatePath("/moderacao/historico/comentarios");
}
