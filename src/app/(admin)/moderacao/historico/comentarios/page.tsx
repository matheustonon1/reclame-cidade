import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { Paginacao } from "@/components/paginacao";
import { calcularSkip, calcularTotalPaginas, ITENS_POR_PAGINA, lerPaginaAtual } from "@/lib/paginacao";
import { containerPagina, cartao } from "@/lib/estilos";

import { exigirModerador } from "../../exigir-moderador";

const DECISAO_ESTILO: Record<string, string> = {
  APROVAR: "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400",
  REPROVAR: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400",
};

const DECISAO_LABEL: Record<string, string> = {
  APROVAR: "Aprovado",
  REPROVAR: "Reprovado",
};

export default async function HistoricoModeracaoComentariosPage({
  searchParams,
}: PageProps<"/moderacao/historico/comentarios">) {
  await exigirModerador();

  const { page } = await searchParams;
  const paginaAtual = lerPaginaAtual(page);
  const filtro = { alvoTipo: "COMENTARIO" as const };

  const [logs, totalLogs] = await Promise.all([
    prisma.logModeracao.findMany({
      where: filtro,
      orderBy: { createdAt: "desc" },
      skip: calcularSkip(paginaAtual),
      take: ITENS_POR_PAGINA,
      include: { revisadoPor: true },
    }),
    prisma.logModeracao.count({ where: filtro }),
  ]);
  const totalPaginas = calcularTotalPaginas(totalLogs);

  const comentarios = logs.length
    ? await prisma.comentario.findMany({
        where: { id: { in: logs.map((log) => log.alvoId) } },
        include: { reclamacao: { select: { protocolo: true, titulo: true } } },
      })
    : [];
  const comentarioPorId = new Map(comentarios.map((c) => [c.id, c]));

  return (
    <main className={`${containerPagina} max-w-3xl`}>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Histórico de moderação de comentários
        </h1>
        <Link href="/moderacao/comentarios" className="text-sm text-primary underline">
          Pendentes de revisão
        </Link>
      </div>
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Decisões automáticas e humanas, mais recentes primeiro
        {totalLogs > 0 && ` (${totalLogs})`}.
      </p>

      {logs.length === 0 && (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Nenhuma decisão de moderação registrada ainda.
        </p>
      )}

      {logs.map((log) => {
        const comentario = comentarioPorId.get(log.alvoId);

        return (
          <div key={log.id} className={`flex flex-col gap-2 ${cartao}`}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                {comentario ? (
                  <Link
                    href={`/reclamacoes/${comentario.reclamacao.protocolo}`}
                    className="font-medium text-slate-900 hover:underline dark:text-slate-100"
                  >
                    {comentario.texto.length > 80
                      ? `${comentario.texto.slice(0, 80)}…`
                      : comentario.texto}
                  </Link>
                ) : (
                  <p className="font-medium text-slate-400 dark:text-slate-500">
                    (comentário removido — {log.alvoId})
                  </p>
                )}
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {comentario && `em "${comentario.reclamacao.titulo}" · `}
                  {log.createdAt.toLocaleString("pt-BR")} · v{log.versaoPrompt}
                  {log.latenciaMs != null && ` · ${log.latenciaMs}ms`}
                </p>
              </div>
              <span
                className={`inline-block shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${DECISAO_ESTILO[log.decisao]}`}
              >
                {DECISAO_LABEL[log.decisao]} (IA)
              </span>
            </div>

            <p className="text-sm text-slate-700 dark:text-slate-300">
              Geral: {log.scoreGeral.toFixed(2)} · Ofensivo: {log.scoreOfensivo?.toFixed(2)} ·{" "}
              Spam: {log.scoreSpam?.toFixed(2)} · Dados pessoais:{" "}
              {log.scoreDadosPessoais?.toFixed(2)}
            </p>

            {log.justificativa && (
              <p className="text-sm italic text-slate-600 dark:text-slate-400">
                “{log.justificativa}”
              </p>
            )}

            {log.decisaoFinal && (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Revisado por {log.revisadoPor?.name ?? log.revisadoPor?.email ?? "—"} em{" "}
                {log.revisadoEm?.toLocaleString("pt-BR")} → decisão final:{" "}
                <span className="font-medium">{DECISAO_LABEL[log.decisaoFinal]}</span>
              </p>
            )}
          </div>
        );
      })}

      <Paginacao
        paginaAtual={paginaAtual}
        totalPaginas={totalPaginas}
        basePath="/moderacao/historico/comentarios"
      />
    </main>
  );
}
