import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export default async function ReclamacaoPage({
  params,
}: PageProps<"/reclamacoes/[protocolo]">) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const { protocolo } = await params;

  const reclamacao = await prisma.reclamacao.findUnique({
    where: { protocolo },
    include: { categoria: true, cidade: true },
  });

  if (!reclamacao || reclamacao.autorId !== session.user.id) {
    notFound();
  }

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
    </main>
  );
}
