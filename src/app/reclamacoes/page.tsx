import Link from "next/link";

import { prisma } from "@/lib/prisma";

export default async function ReclamacoesPublicasPage({
  searchParams,
}: PageProps<"/reclamacoes">) {
  const { cidadeId } = await searchParams;

  const reclamacoes = await prisma.reclamacao.findMany({
    where: {
      status: "PUBLICADA",
      ...(typeof cidadeId === "string" ? { cidadeId } : {}),
    },
    orderBy: { publicadaEm: "desc" },
    include: {
      categoria: true,
      cidade: true,
      _count: { select: { confirmacoes: true } },
    },
    take: 50,
  });

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-4 p-8">
      <h1 className="text-2xl font-bold">Reclamações públicas</h1>

      {reclamacoes.length === 0 && (
        <p className="text-sm text-gray-500">
          Nenhuma reclamação publicada ainda.
        </p>
      )}

      {reclamacoes.map((reclamacao) => (
        <Link
          key={reclamacao.id}
          href={`/reclamacoes/${reclamacao.protocolo}`}
          className="rounded border px-4 py-3"
        >
          <p className="font-medium">{reclamacao.titulo}</p>
          <p className="text-sm text-gray-500">
            {reclamacao.categoria.nome} · {reclamacao.cidade.nome} ·{" "}
            {reclamacao._count.confirmacoes} confirmação(ões)
          </p>
        </Link>
      ))}
    </main>
  );
}
