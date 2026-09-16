"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { criarNotificacao } from "@/lib/notificacoes";

import { exigirModerador } from "../moderacao/exigir-moderador";

async function buscarDenunciaAberta(denunciaId: string) {
  return prisma.denuncia.findFirst({
    where: { id: denunciaId, status: "ABERTA" },
  });
}

export async function marcarImprocedente(denunciaId: string) {
  const session = await exigirModerador();

  const denuncia = await buscarDenunciaAberta(denunciaId);
  if (!denuncia) {
    return;
  }

  await prisma.denuncia.update({
    where: { id: denuncia.id },
    data: {
      status: "IMPROCEDENTE",
      analisadoPorId: session.user.id,
      analisadoEm: new Date(),
    },
  });

  revalidatePath("/denuncias");
}

export async function marcarProcedente(denunciaId: string) {
  const session = await exigirModerador();

  const denuncia = await buscarDenunciaAberta(denunciaId);
  if (!denuncia || denuncia.alvoTipo !== "RECLAMACAO") {
    return;
  }

  const reclamacao = await prisma.reclamacao.findUnique({
    where: { id: denuncia.alvoId },
  });
  if (!reclamacao) {
    return;
  }

  const agora = new Date();

  await prisma.$transaction([
    prisma.denuncia.update({
      where: { id: denuncia.id },
      data: { status: "PROCEDENTE", analisadoPorId: session.user.id, analisadoEm: agora },
    }),
    prisma.reclamacao.update({
      where: { id: reclamacao.id },
      data: { status: "ARQUIVADA" },
    }),
  ]);

  await criarNotificacao({
    userId: reclamacao.autorId,
    tipo: "MUDANCA_STATUS",
    titulo: "Reclamação arquivada",
    mensagem: `Sua reclamação "${reclamacao.titulo}" foi arquivada após denúncia procedente.`,
    reclamacaoId: reclamacao.id,
    protocolo: reclamacao.protocolo,
  });

  revalidatePath("/denuncias");
  revalidatePath("/reclamacoes");
  revalidatePath(`/reclamacoes/${reclamacao.protocolo}`);
}

const DIAS_BANIMENTO: Record<string, number> = {
  "7": 7,
  "30": 30,
  permanente: 100 * 365,
};

export async function banirAutor(denunciaId: string, formData: FormData) {
  const session = await auth();
  if (session?.user?.papel !== "ADMIN") {
    return;
  }

  const denuncia = await prisma.denuncia.findUnique({ where: { id: denunciaId } });
  if (!denuncia || denuncia.alvoTipo !== "RECLAMACAO") {
    return;
  }

  const reclamacao = await prisma.reclamacao.findUnique({
    where: { id: denuncia.alvoId },
  });
  if (!reclamacao) {
    return;
  }

  const duracao = String(formData.get("duracao"));
  const dias = DIAS_BANIMENTO[duracao];
  if (!dias) {
    return;
  }

  await prisma.user.update({
    where: { id: reclamacao.autorId },
    data: { banidoAte: new Date(Date.now() + dias * 24 * 60 * 60 * 1000) },
  });

  revalidatePath("/denuncias");
}
