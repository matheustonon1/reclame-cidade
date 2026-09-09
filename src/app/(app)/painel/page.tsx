import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { StatusBadge } from "@/components/status-badge";
import { botaoPrimario, botaoSecundario, cartao, containerPagina } from "@/lib/estilos";

import { reenviarVerificacao } from "./actions";

export default async function PainelPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const [reclamacoes, usuario] = await Promise.all([
    prisma.reclamacao.findMany({
      where: { autorId: session.user.id },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { emailVerified: true },
    }),
  ]);

  return (
    <main className={containerPagina}>
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">Painel</h1>
      <p className="text-sm text-slate-600">
        Logado como <strong>{session.user.email}</strong> ({session.user.papel})
      </p>

      {!usuario?.emailVerified && (
        <div className={`flex items-center justify-between gap-3 ${cartao}`}>
          <p className="text-sm text-amber-700">
            Seu e-mail ainda não foi verificado.
          </p>
          <form action={reenviarVerificacao}>
            <button type="submit" className={botaoSecundario}>
              Reenviar e-mail de verificação
            </button>
          </form>
        </div>
      )}

      <Link href="/reclamacoes/nova" className={`${botaoPrimario} w-fit`}>
        Nova reclamação
      </Link>

      <div className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold text-slate-900">Minhas reclamações</h2>
        {reclamacoes.length === 0 && (
          <p className="text-sm text-slate-500">
            Você ainda não registrou nenhuma reclamação.
          </p>
        )}
        {reclamacoes.map((reclamacao) => (
          <Link
            key={reclamacao.id}
            href={`/reclamacoes/${reclamacao.protocolo}`}
            className={`flex items-center justify-between gap-2 ${cartao}`}
          >
            <div>
              <p className="font-medium text-slate-900">{reclamacao.titulo}</p>
              <p className="text-sm text-slate-500">{reclamacao.protocolo}</p>
            </div>
            <StatusBadge status={reclamacao.status} />
          </Link>
        ))}
      </div>
    </main>
  );
}
