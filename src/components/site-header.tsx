import Link from "next/link";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { botaoSecundario } from "@/lib/estilos";

import { BuscaCidadeHeader } from "./busca-cidade-header";
import { NotificacoesSino } from "./notificacoes-sino";
import { UserMenu } from "./user-menu";

export async function SiteHeader() {
  const session = await auth();
  const ehModerador =
    session?.user?.papel === "MODERADOR" || session?.user?.papel === "ADMIN";
  const ehOrgao = session?.user?.papel === "ORGAO";

  const [usuario, notificacoes, totalNaoLidas] = await Promise.all([
    session?.user
      ? prisma.user.findUnique({
          where: { id: session.user.id },
          select: { name: true, email: true },
        })
      : null,
    session?.user
      ? prisma.notificacao.findMany({
          where: { userId: session.user.id },
          orderBy: { createdAt: "desc" },
          take: 10,
          include: { reclamacao: { select: { protocolo: true } } },
        })
      : [],
    session?.user
      ? prisma.notificacao.count({
          where: { userId: session.user.id, lida: false },
        })
      : 0,
  ]);

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-4xl items-center gap-4 px-6 py-3 sm:px-8">
        <Link href="/" className="text-lg font-bold tracking-tight text-slate-900">
          Reclame <span className="text-primary">Cidade</span>
        </Link>

        <BuscaCidadeHeader />

        <nav className="ml-auto flex items-center gap-4 text-sm">
          <Link
            href="/reclamacoes"
            className="hidden text-slate-600 hover:text-slate-900 sm:inline"
          >
            Reclamações
          </Link>

          {usuario ? (
            <>
              <NotificacoesSino
                notificacoes={notificacoes.map((notificacao) => ({
                  id: notificacao.id,
                  titulo: notificacao.titulo,
                  mensagem: notificacao.mensagem,
                  lida: notificacao.lida,
                  createdAt: notificacao.createdAt,
                  protocolo: notificacao.reclamacao?.protocolo ?? null,
                }))}
                totalNaoLidas={totalNaoLidas}
              />
              <UserMenu
                nome={usuario.name ?? usuario.email}
                email={usuario.email}
                ehModerador={ehModerador}
                ehOrgao={ehOrgao}
              />
            </>
          ) : (
            <>
              <Link href="/login" className="text-slate-600 hover:text-slate-900">
                Entrar
              </Link>
              <Link href="/cadastro" className={botaoSecundario}>
                Cadastrar
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
