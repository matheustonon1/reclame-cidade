import { prisma } from "@/lib/prisma";
import { botaoPrimario, campoInput, cartao, containerPagina } from "@/lib/estilos";

import { responderReclamacao } from "../reclamacoes/[protocolo]/actions";
import { exigirOrgao } from "../reclamacoes/[protocolo]/exigir-orgao";

export default async function PainelOrgaoPage() {
  const session = await exigirOrgao();

  const orgao = await prisma.orgao.findUnique({
    where: { id: session.user.orgaoId! },
  });

  const pendentes = orgao
    ? await prisma.reclamacao.findMany({
        where: {
          cidadeId: orgao.cidadeId,
          status: { in: ["PUBLICADA", "EM_ANDAMENTO"] },
        },
        orderBy: { publicadaEm: "asc" },
        include: { categoria: true },
      })
    : [];

  return (
    <main className={`${containerPagina} max-w-3xl`}>
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">
        Painel do órgão{orgao ? ` — ${orgao.nome}` : ""}
      </h1>

      {pendentes.length === 0 && (
        <p className="text-sm text-slate-500">
          Nenhuma reclamação pendente de resposta no momento.
        </p>
      )}

      {pendentes.map((reclamacao) => (
        <div key={reclamacao.id} className={`flex flex-col gap-2 ${cartao}`}>
          <p className="font-medium text-slate-900">{reclamacao.titulo}</p>
          <p className="text-sm text-slate-500">
            {reclamacao.protocolo} · {reclamacao.categoria.nome} · {reclamacao.endereco}
          </p>
          <p className="text-slate-700">{reclamacao.descricao}</p>

          <form
            action={responderReclamacao.bind(null, reclamacao.id, reclamacao.protocolo)}
            className="flex flex-col gap-2"
          >
            <textarea
              name="texto"
              required
              minLength={10}
              placeholder="Resposta oficial"
              rows={3}
              className={campoInput}
            />
            <select name="novoStatus" defaultValue="" className={campoInput}>
              <option value="">Manter status atual</option>
              <option value="EM_ANDAMENTO">Marcar como em andamento</option>
              <option value="RESOLVIDA">Marcar como resolvida</option>
            </select>
            <input type="date" name="prazoEstimado" className={campoInput} />
            <button type="submit" className={`${botaoPrimario} w-fit`}>
              Enviar resposta
            </button>
          </form>
        </div>
      ))}
    </main>
  );
}
