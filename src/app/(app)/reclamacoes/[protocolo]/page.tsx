import { notFound } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

import { alternarConfirmacao } from "./actions";

export default async function ReclamacaoPage({
  params,
}: PageProps<"/reclamacoes/[protocolo]">) {
  const { protocolo } = await params;

  const reclamacao = await prisma.reclamacao.findUnique({
    where: { protocolo },
    include: {
      categoria: true,
      cidade: true,
      _count: { select: { confirmacoes: true } },
    },
  });

  const session = await auth();
  const ehAutor = reclamacao?.autorId === session?.user?.id;
  const publicaOuAutor =
    reclamacao?.status === "PUBLICADA" ||
    reclamacao?.status === "EM_ANDAMENTO" ||
    reclamacao?.status === "RESOLVIDA" ||
    reclamacao?.status === "ARQUIVADA" ||
    ehAutor;

  if (!reclamacao || !publicaOuAutor) {
    notFound();
  }

  const jaConfirmou =
    !!session?.user &&
    (await prisma.confirmacao.findUnique({
      where: {
        userId_reclamacaoId: {
          userId: session.user.id,
          reclamacaoId: reclamacao.id,
        },
      },
    })) !== null;

  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col gap-3 p-8">
      <h1 className="text-2xl font-bold">{reclamacao.titulo}</h1>
      <p className="text-sm text-gray-500">
        Protocolo {reclamacao.protocolo} · {reclamacao.status}
      </p>
      <p className="text-sm text-gray-500">
        {reclamacao.categoria.nome} · {reclamacao.cidade.nome} ·{" "}
        {reclamacao.endereco}
      </p>
      <p>{reclamacao.descricao}</p>
      {reclamacao.status === "REJEITADA" && reclamacao.motivoRejeicao && (
        <p className="text-sm text-red-600">
          Motivo da rejeição: {reclamacao.motivoRejeicao}
        </p>
      )}
      {reclamacao.status === "AGUARDANDO_REVISAO" && (
        <p className="text-sm text-amber-600">
          Esta reclamação foi encaminhada para revisão humana antes da
          publicação.
        </p>
      )}
      {!ehAutor && session?.user && (
        <form
          action={alternarConfirmacao.bind(null, reclamacao.id, protocolo)}
        >
          <button
            type="submit"
            className="rounded border px-3 py-2 text-sm"
          >
            {jaConfirmou
              ? "✓ Também sofro com isso"
              : "Também sofro com isso"}
          </button>
        </form>
      )}
      <p className="text-sm text-gray-500">
        {reclamacao._count.confirmacoes} pessoa(s) confirmaram este problema.
      </p>
    </main>
  );
}
