import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

import { sair } from "./actions";

export default async function PainelPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const reclamacoes = await prisma.reclamacao.findMany({
    where: { autorId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col gap-4 p-8">
      <h1 className="text-2xl font-bold">Painel</h1>
      <p>
        Logado como <strong>{session.user.email}</strong> (
        {session.user.papel})
      </p>

      <Link
        href="/reclamacoes/nova"
        className="rounded bg-black px-3 py-2 text-center text-white"
      >
        Nova reclamação
      </Link>

      <div className="flex flex-col gap-2">
        <h2 className="font-semibold">Minhas reclamações</h2>
        {reclamacoes.length === 0 && (
          <p className="text-sm text-gray-500">
            Você ainda não registrou nenhuma reclamação.
          </p>
        )}
        {reclamacoes.map((reclamacao) => (
          <Link
            key={reclamacao.id}
            href={`/reclamacoes/${reclamacao.protocolo}`}
            className="rounded border px-3 py-2"
          >
            <p className="font-medium">{reclamacao.titulo}</p>
            <p className="text-sm text-gray-500">
              {reclamacao.protocolo} · {reclamacao.status}
            </p>
          </Link>
        ))}
      </div>

      <form action={sair}>
        <button
          type="submit"
          className="rounded bg-black px-3 py-2 text-white"
        >
          Sair
        </button>
      </form>
    </main>
  );
}
