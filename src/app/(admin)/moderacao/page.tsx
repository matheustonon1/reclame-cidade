import { prisma } from "@/lib/prisma";
import { botaoPrimario, botaoSecundario, campoInput, cartao, containerPagina } from "@/lib/estilos";

import { aprovarReclamacao, rejeitarReclamacao } from "./actions";
import { exigirModerador } from "./exigir-moderador";

export default async function ModeracaoPage() {
  await exigirModerador();

  const pendentes = await prisma.reclamacao.findMany({
    where: { status: "AGUARDANDO_REVISAO" },
    orderBy: { updatedAt: "asc" },
    include: {
      categoria: true,
      cidade: { include: { estado: true } },
      autor: true,
      midias: { orderBy: { ordem: "asc" } },
    },
  });

  const logs = pendentes.length
    ? await prisma.logModeracao.findMany({
        where: {
          alvoTipo: "RECLAMACAO",
          alvoId: { in: pendentes.map((reclamacao) => reclamacao.id) },
          decisao: "ENCAMINHAR_REVISAO",
          revisadoEm: null,
        },
        orderBy: { createdAt: "desc" },
      })
    : [];
  const logPorReclamacao = new Map(logs.map((log) => [log.alvoId, log]));

  return (
    <main className={`${containerPagina} max-w-3xl`}>
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">
        Fila de moderação
      </h1>

      {pendentes.length === 0 && (
        <p className="text-sm text-slate-500">
          Nenhuma reclamação aguardando revisão.
        </p>
      )}

      {pendentes.map((reclamacao) => {
        const log = logPorReclamacao.get(reclamacao.id);

        return (
          <div key={reclamacao.id} className={`flex flex-col gap-2 ${cartao}`}>
            <p className="font-medium text-slate-900">{reclamacao.titulo}</p>
            <p className="text-sm text-slate-500">
              {reclamacao.protocolo} · {reclamacao.categoria.nome} ·{" "}
              {reclamacao.cidade.nome} - {reclamacao.cidade.estado.uf} ·{" "}
              {reclamacao.endereco}
            </p>
            <p className="text-sm text-slate-500">
              Autor: {reclamacao.autor.name ?? reclamacao.autor.email}
            </p>
            <p className="text-slate-800">{reclamacao.descricao}</p>

            {reclamacao.midias.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {reclamacao.midias.map((midia) => (
                  // eslint-disable-next-line @next/next/no-img-element -- imagem externa (Vercel Blob), sem domínio fixo pra configurar no next/image
                  <img
                    key={midia.id}
                    src={midia.urlTratada ?? midia.url}
                    alt=""
                    className="h-32 w-32 rounded-lg border border-slate-200 object-cover"
                  />
                ))}
              </div>
            )}

            {log && (
              <div className="rounded-lg bg-amber-50 p-3 text-sm">
                <p className="font-medium text-amber-800">Análise da IA</p>
                <p className="text-amber-900">Ofensivo: {log.scoreOfensivo?.toFixed(2)}</p>
                <p className="text-amber-900">Spam: {log.scoreSpam?.toFixed(2)}</p>
                <p className="text-amber-900">
                  Dados pessoais: {log.scoreDadosPessoais?.toFixed(2)}
                </p>
                <p className="text-amber-900">
                  Fora de escopo: {log.scoreForaEscopo?.toFixed(2)}
                </p>
                <p className="text-amber-900">
                  Desinformação: {log.scoreDesinformacao?.toFixed(2)}
                </p>
                {log.coerenciaTextoImagem !== null && (
                  <p className="text-amber-900">
                    Coerência texto/imagem: {log.coerenciaTextoImagem?.toFixed(2)}
                  </p>
                )}
                {log.justificativa && (
                  <p className="mt-1 italic text-amber-900">{log.justificativa}</p>
                )}
              </div>
            )}

            <div className="flex items-start gap-2">
              <form action={aprovarReclamacao.bind(null, reclamacao.id)}>
                <button type="submit" className={botaoPrimario}>
                  Aprovar
                </button>
              </form>

              <form
                action={rejeitarReclamacao.bind(null, reclamacao.id)}
                className="flex flex-1 gap-2"
              >
                <textarea
                  name="motivo"
                  required
                  minLength={10}
                  placeholder="Motivo da rejeição"
                  rows={1}
                  className={`flex-1 ${campoInput}`}
                />
                <button type="submit" className={botaoSecundario}>
                  Rejeitar
                </button>
              </form>
            </div>
          </div>
        );
      })}
    </main>
  );
}
