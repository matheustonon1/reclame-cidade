import type { TipoNotificacao } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export async function criarNotificacao({
  userId,
  tipo,
  titulo,
  mensagem,
  reclamacaoId,
}: {
  userId: string;
  tipo: TipoNotificacao;
  titulo: string;
  mensagem: string;
  reclamacaoId?: string;
}) {
  await prisma.notificacao.create({
    data: { userId, tipo, titulo, mensagem, reclamacaoId },
  });
}
