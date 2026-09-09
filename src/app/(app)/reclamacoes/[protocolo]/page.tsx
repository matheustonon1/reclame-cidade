import Link from "next/link";
import { notFound } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { StatusBadge } from "@/components/status-badge";
import { botaoPrimario, botaoSecundario, campoInput, cartao, containerPagina } from "@/lib/estilos";

import { alternarConfirmacao, avaliarReclamacao, criarDenuncia, responderReclamacao } from "./actions";
import { construirLinhaDoTempo } from "./linha-do-tempo";

const MOTIVO_LABEL: Record<string, string> = {
  OFENSIVO: "Conteúdo ofensivo",
  SPAM: "Spam",
  DESINFORMACAO: "Desinformação",
  FORA_DE_ESCOPO: "Fora do escopo municipal",
  DADOS_PESSOAIS: "Exposição de dados pessoais",
  DUPLICADA: "Reclamação duplicada",
  OUTRO: "Outro",
};

export default async function ReclamacaoPage({
  params,
  searchParams,
}: PageProps<"/reclamacoes/[protocolo]">) {
  const { protocolo } = await params;
  const { erro } = await searchParams;

  const reclamacao = await prisma.reclamacao.findUnique({
    where: { protocolo },
    include: {
      categoria: true,
      cidade: true,
      _count: { select: { confirmacoes: true } },
      respostas: { include: { orgao: true }, orderBy: { createdAt: "asc" } },
      avaliacao: true,
      midias: { orderBy: { ordem: "asc" } },
    },
  });

  const session = await auth();
  const ehAutor = reclamacao?.autorId === session?.user?.id;
  const ehModerador =
    session?.user?.papel === "MODERADOR" || session?.user?.papel === "ADMIN";
  const publicaOuAutor =
    reclamacao?.status === "PUBLICADA" ||
    reclamacao?.status === "EM_ANDAMENTO" ||
    reclamacao?.status === "RESOLVIDA" ||
    reclamacao?.status === "ARQUIVADA" ||
    ehAutor ||
    ehModerador;

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

  const orgaoDoUsuario =
    session?.user?.papel === "ORGAO" && session.user.orgaoId
      ? await prisma.orgao.findUnique({ where: { id: session.user.orgaoId } })
      : null;
  const podeResponder =
    !!orgaoDoUsuario?.ativo &&
    orgaoDoUsuario.cidadeId === reclamacao.cidadeId &&
    (reclamacao.status === "PUBLICADA" || reclamacao.status === "EM_ANDAMENTO");

  const podeAvaliar =
    ehAutor && reclamacao.status === "RESOLVIDA" && !reclamacao.avaliacao;

  const denunciaAberta =
    !!session?.user &&
    !ehAutor &&
    (await prisma.denuncia.findFirst({
      where: {
        denuncianteId: session.user.id,
        alvoTipo: "RECLAMACAO",
        alvoId: reclamacao.id,
        status: "ABERTA",
      },
    })) !== null;

  const linhaDoTempo = construirLinhaDoTempo(
    reclamacao,
    reclamacao.respostas,
    reclamacao.avaliacao
  );

  return (
    <main className={containerPagina}>
      <div className="flex flex-col gap-3">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          {reclamacao.titulo}
        </h1>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <span>Protocolo {reclamacao.protocolo}</span>
          <StatusBadge status={reclamacao.status} />
        </div>
        <p className="text-sm text-slate-500">
          {reclamacao.categoria.nome} ·{" "}
          <Link href={`/cidades/${reclamacao.cidade.slug}`} className="text-primary underline">
            {reclamacao.cidade.nome}
          </Link>{" "}
          · {reclamacao.endereco}
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
                className="h-40 w-40 rounded-lg border border-slate-200 object-cover"
              />
            ))}
          </div>
        )}
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
        {erro === "email-nao-verificado" && (
          <p className="text-sm text-amber-600">
            Verifique seu e-mail antes de confirmar ou denunciar reclamações —
            reenvie o link em{" "}
            <Link href="/painel" className="underline">
              seu painel
            </Link>
            .
          </p>
        )}
        {!ehAutor && session?.user && (
          <div className="flex flex-wrap gap-2">
            <form
              action={alternarConfirmacao.bind(null, reclamacao.id, protocolo)}
            >
              <button type="submit" className={`${botaoSecundario} w-fit`}>
                {jaConfirmou
                  ? "✓ Também sofro com isso"
                  : "Também sofro com isso"}
              </button>
            </form>
            {!denunciaAberta && (
              <details className="w-fit">
                <summary
                  className={`${botaoSecundario} inline-flex w-fit cursor-pointer list-none text-red-700`}
                >
                  Denunciar
                </summary>
                <form
                  action={criarDenuncia.bind(null, reclamacao.id, protocolo)}
                  className={`mt-2 flex w-72 flex-col gap-2 ${cartao}`}
                >
                  <select name="motivo" required defaultValue="" className={campoInput}>
                    <option value="" disabled>
                      Motivo
                    </option>
                    {Object.entries(MOTIVO_LABEL).map(([valor, label]) => (
                      <option key={valor} value={valor}>
                        {label}
                      </option>
                    ))}
                  </select>
                  <textarea
                    name="descricao"
                    placeholder="Descrição (opcional)"
                    rows={2}
                    className={campoInput}
                  />
                  <label className="flex items-start gap-2 text-xs text-slate-600">
                    <input
                      type="checkbox"
                      name="declaracaoVeracidade"
                      required
                      className="mt-0.5"
                    />
                    <span>Declaro que esta denúncia é feita de boa-fé.</span>
                  </label>
                  <button type="submit" className={`${botaoPrimario} w-fit`}>
                    Enviar denúncia
                  </button>
                </form>
              </details>
            )}
          </div>
        )}
        <p className="text-sm text-slate-500">
          {reclamacao._count.confirmacoes} pessoa(s) confirmaram este problema.
        </p>
      </div>

      {linhaDoTempo.length > 1 && (
        <div className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold text-slate-900">Linha do tempo</h2>
          <ol className="flex flex-col gap-2">
            {linhaDoTempo.map((evento, indice) => (
              <li key={indice} className={cartao}>
                <p className="font-medium text-slate-900">{evento.titulo}</p>
                <p className="text-sm text-slate-500">
                  {evento.data.toLocaleString("pt-BR")}
                </p>
                {evento.descricao && (
                  <p className="mt-1 text-sm text-slate-700">{evento.descricao}</p>
                )}
              </li>
            ))}
          </ol>
        </div>
      )}

      {podeResponder && (
        <form
          action={responderReclamacao.bind(null, reclamacao.id, protocolo)}
          className={`flex flex-col gap-2 ${cartao}`}
        >
          <h2 className="font-semibold text-slate-900">Responder como órgão</h2>
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
      )}

      {podeAvaliar && (
        <form
          action={avaliarReclamacao.bind(null, reclamacao.id, protocolo)}
          className={`flex flex-col gap-2 ${cartao}`}
        >
          <h2 className="font-semibold text-slate-900">
            O problema foi realmente resolvido?
          </h2>
          <select name="nota" required defaultValue="" className={campoInput}>
            <option value="" disabled>
              Nota (1 a 5)
            </option>
            {[1, 2, 3, 4, 5].map((nota) => (
              <option key={nota} value={nota}>
                {nota}
              </option>
            ))}
          </select>
          <div className="flex gap-4 text-sm text-slate-700">
            <label className="flex items-center gap-1">
              <input type="radio" name="resolvido" value="true" required />
              Sim, foi resolvido
            </label>
            <label className="flex items-center gap-1">
              <input type="radio" name="resolvido" value="false" required />
              Não foi resolvido
            </label>
          </div>
          <textarea
            name="comentario"
            placeholder="Comentário (opcional)"
            rows={2}
            className={campoInput}
          />
          <button type="submit" className={`${botaoPrimario} w-fit`}>
            Enviar avaliação
          </button>
        </form>
      )}
    </main>
  );
}
