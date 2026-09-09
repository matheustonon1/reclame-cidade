import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { containerPagina, cartao } from "@/lib/estilos";

import { exigirModerador } from "../exigir-moderador";

const LIMITE = 100;

const DECISAO_ESTILO: Record<string, string> = {
  APROVAR: "bg-green-50 text-green-700",
  REPROVAR: "bg-red-50 text-red-700",
  ENCAMINHAR_REVISAO: "bg-amber-50 text-amber-800",
};

const DECISAO_LABEL: Record<string, string> = {
  APROVAR: "Aprovado",
  REPROVAR: "Reprovado",
  ENCAMINHAR_REVISAO: "Encaminhado p/ revisão",
};

export default async function HistoricoModeracaoPage() {
  await exigirModerador();

  const logs = await prisma.logModeracao.findMany({
    where: { alvoTipo: "RECLAMACAO" },
    orderBy: { createdAt: "desc" },
    take: LIMITE,
    include: { revisadoPor: true },
  });

  const reclamacoes = logs.length
    ? await prisma.reclamacao.findMany({
        where: { id: { in: logs.map((log) => log.alvoId) } },
        select: { id: true, protocolo: true, titulo: true, status: true },
      })
    : [];
  const reclamacaoPorId = new Map(reclamacoes.map((r) => [r.id, r]));

  return (
    <main className={`${containerPagina} max-w-3xl`}>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Histórico de moderação
        </h1>
        <Link href="/moderacao" className="text-sm text-primary underline">
          Fila pendente
        </Link>
      </div>
      <p className="text-sm text-slate-500">
        Últimas {LIMITE} decisões automáticas e humanas, mais recentes primeiro.
      </p>

      {logs.length === 0 && (
        <p className="text-sm text-slate-500">Nenhuma decisão de moderação registrada ainda.</p>
      )}

      {logs.map((log) => {
        const reclamacao = reclamacaoPorId.get(log.alvoId);

        return (
          <div key={log.id} className={`flex flex-col gap-2 ${cartao}`}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                {reclamacao ? (
                  <Link
                    href={`/reclamacoes/${reclamacao.protocolo}`}
                    className="font-medium text-slate-900 hover:underline"
                  >
                    {reclamacao.titulo}
                  </Link>
                ) : (
                  <p className="font-medium text-slate-400">
                    (reclamação removida — {log.alvoId})
                  </p>
                )}
                <p className="text-xs text-slate-500">
                  {reclamacao?.protocolo} · {log.createdAt.toLocaleString("pt-BR")} ·
                  {" "}v{log.versaoPrompt}
                  {log.latenciaMs != null && ` · ${log.latenciaMs}ms`}
                </p>
              </div>
              <span
                className={`inline-block shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${DECISAO_ESTILO[log.decisao]}`}
              >
                {DECISAO_LABEL[log.decisao]} (IA)
              </span>
            </div>

            <p className="text-sm text-slate-700">
              Geral: {log.scoreGeral.toFixed(2)} · Ofensivo: {log.scoreOfensivo?.toFixed(2)} ·
              {" "}Spam: {log.scoreSpam?.toFixed(2)} · Dados pessoais: {log.scoreDadosPessoais?.toFixed(2)} ·
              {" "}Fora de escopo: {log.scoreForaEscopo?.toFixed(2)} · Desinformação:{" "}
              {log.scoreDesinformacao?.toFixed(2)}
              {log.coerenciaTextoImagem !== null &&
                ` · Coerência texto/imagem: ${log.coerenciaTextoImagem?.toFixed(2)}`}
            </p>

            {log.justificativa && (
              <p className="text-sm italic text-slate-600">“{log.justificativa}”</p>
            )}

            {log.decisaoFinal && (
              <p className="text-xs text-slate-500">
                Revisado por {log.revisadoPor?.name ?? log.revisadoPor?.email ?? "—"} em{" "}
                {log.revisadoEm?.toLocaleString("pt-BR")} → decisão final:{" "}
                <span className="font-medium">{DECISAO_LABEL[log.decisaoFinal]}</span>
              </p>
            )}
          </div>
        );
      })}
    </main>
  );
}
