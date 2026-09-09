"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { criarNotificacao } from "@/lib/notificacoes";

import { AvaliacaoSchema, RespostaOficialSchema } from "./definitions";
import { exigirOrgao } from "./exigir-orgao";

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

export async function responderReclamacao(
  reclamacaoId: string,
  protocolo: string,
  formData: FormData
) {
  const session = await exigirOrgao();

  const validado = RespostaOficialSchema.safeParse({
    texto: formData.get("texto"),
    novoStatus: formData.get("novoStatus"),
    prazoEstimado: formData.get("prazoEstimado"),
  });
  if (!validado.success) {
    return;
  }

  const [orgao, reclamacao] = await Promise.all([
    prisma.orgao.findUnique({ where: { id: session.user.orgaoId! } }),
    prisma.reclamacao.findUnique({ where: { id: reclamacaoId } }),
  ]);

  if (!orgao?.ativo || !reclamacao) {
    return;
  }
  if (orgao.cidadeId !== reclamacao.cidadeId) {
    return;
  }
  if (reclamacao.status !== "PUBLICADA" && reclamacao.status !== "EM_ANDAMENTO") {
    return;
  }

  const agora = new Date();

  await prisma.$transaction([
    prisma.respostaOficial.create({
      data: {
        reclamacaoId,
        autorId: session.user.id,
        orgaoId: orgao.id,
        texto: validado.data.texto,
        novoStatus: validado.data.novoStatus,
        prazoEstimado: validado.data.prazoEstimado
          ? new Date(validado.data.prazoEstimado)
          : undefined,
      },
    }),
    ...(validado.data.novoStatus
      ? [
          prisma.reclamacao.update({
            where: { id: reclamacaoId },
            data: {
              status: validado.data.novoStatus,
              ...(validado.data.novoStatus === "RESOLVIDA"
                ? { resolvidaEm: agora }
                : {}),
            },
          }),
        ]
      : []),
  ]);

  await criarNotificacao({
    userId: reclamacao.autorId,
    tipo: "RESPOSTA_OFICIAL",
    titulo: `${orgao.nome} respondeu sua reclamação`,
    mensagem: validado.data.texto,
    reclamacaoId: reclamacao.id,
  });

  if (validado.data.novoStatus === "RESOLVIDA") {
    await criarNotificacao({
      userId: reclamacao.autorId,
      tipo: "PEDIDO_AVALIACAO",
      titulo: "O problema foi resolvido?",
      mensagem: `${orgao.nome} marcou "${reclamacao.titulo}" como resolvida. Avalie se o problema foi realmente resolvido.`,
      reclamacaoId: reclamacao.id,
    });
  }

  revalidatePath(`/reclamacoes/${protocolo}`);
  revalidatePath("/reclamacoes");
}

export async function avaliarReclamacao(
  reclamacaoId: string,
  protocolo: string,
  formData: FormData
) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const validado = AvaliacaoSchema.safeParse({
    nota: formData.get("nota"),
    resolvido: formData.get("resolvido"),
    comentario: formData.get("comentario"),
  });
  if (!validado.success) {
    return;
  }

  const reclamacao = await prisma.reclamacao.findUnique({
    where: { id: reclamacaoId },
  });
  if (!reclamacao || reclamacao.autorId !== session.user.id) {
    return;
  }
  if (reclamacao.status !== "RESOLVIDA") {
    return;
  }

  const existente = await prisma.avaliacao.findUnique({
    where: { reclamacaoId },
  });
  if (existente) {
    return;
  }

  await prisma.avaliacao.create({
    data: {
      reclamacaoId,
      autorId: session.user.id,
      nota: validado.data.nota,
      resolvido: validado.data.resolvido,
      comentario: validado.data.comentario,
    },
  });

  revalidatePath(`/reclamacoes/${protocolo}`);
}
