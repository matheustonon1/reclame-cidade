import Link from "next/link";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { botaoPrimario, botaoSecundario, cartao, containerPagina } from "@/lib/estilos";

import { exigirModerador } from "../moderacao/exigir-moderador";
import { banirAutor, marcarImprocedente, marcarProcedente } from "./actions";

const MOTIVO_LABEL: Record<string, string> = {
  OFENSIVO: "Conteúdo ofensivo",
  SPAM: "Spam",
  DESINFORMACAO: "Desinformação",
  FORA_DE_ESCOPO: "Fora do escopo municipal",
  DADOS_PESSOAIS: "Exposição de dados pessoais",
  DUPLICADA: "Reclamação duplicada",
  OUTRO: "Outro",
};

export default async function DenunciasPage() {
  await exigirModerador();
  const session = await auth();
  const ehAdmin = session?.user?.papel === "ADMIN";

  const denuncias = await prisma.denuncia.findMany({
    where: { status: "ABERTA" },
    orderBy: { createdAt: "asc" },
    include: { denunciante: true },
  });

  const reclamacoes = denuncias.length
    ? await prisma.reclamacao.findMany({
        where: { id: { in: denuncias.map((d) => d.alvoId) } },
        select: { id: true, protocolo: true, titulo: true, descricao: true },
      })
    : [];
  const reclamacaoPorId = new Map(reclamacoes.map((r) => [r.id, r]));

  return (
    <main className={`${containerPagina} max-w-3xl`}>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Denúncias</h1>
        <Link href="/moderacao" className="text-sm text-primary underline">
          Fila de moderação
        </Link>
      </div>

      {denuncias.length === 0 && (
        <p className="text-sm text-slate-500">Nenhuma denúncia em aberto.</p>
      )}

      {denuncias.map((denuncia) => {
        const reclamacao = reclamacaoPorId.get(denuncia.alvoId);

        return (
          <div key={denuncia.id} className={`flex flex-col gap-2 ${cartao}`}>
            {reclamacao ? (
              <Link
                href={`/reclamacoes/${reclamacao.protocolo}`}
                className="font-medium text-slate-900 hover:underline"
              >
                {reclamacao.titulo}
              </Link>
            ) : (
              <p className="font-medium text-slate-400">(conteúdo removido)</p>
            )}
            {reclamacao && (
              <p className="text-sm text-slate-600">{reclamacao.descricao}</p>
            )}

            <p className="text-sm text-slate-500">
              Motivo: <strong>{MOTIVO_LABEL[denuncia.motivo]}</strong> · Denunciado por{" "}
              {denuncia.denunciante.name ?? denuncia.denunciante.email} em{" "}
              {denuncia.createdAt.toLocaleString("pt-BR")}
            </p>
            {denuncia.descricao && (
              <p className="text-sm italic text-slate-600">“{denuncia.descricao}”</p>
            )}

            <div className="flex flex-wrap items-center gap-2">
              <form action={marcarProcedente.bind(null, denuncia.id)}>
                <button type="submit" className={botaoPrimario}>
                  Procedente (arquivar reclamação)
                </button>
              </form>
              <form action={marcarImprocedente.bind(null, denuncia.id)}>
                <button type="submit" className={botaoSecundario}>
                  Improcedente
                </button>
              </form>

              {ehAdmin && (
                <form
                  action={banirAutor.bind(null, denuncia.id)}
                  className="flex items-center gap-2"
                >
                  <select name="duracao" defaultValue="7" className="rounded-lg border border-slate-300 px-2 py-1 text-sm">
                    <option value="7">7 dias</option>
                    <option value="30">30 dias</option>
                    <option value="permanente">Permanente</option>
                  </select>
                  <button
                    type="submit"
                    className="rounded-lg border border-red-300 px-3 py-1.5 text-sm text-red-700 hover:bg-red-50"
                  >
                    Banir autor
                  </button>
                </form>
              )}
            </div>
          </div>
        );
      })}
    </main>
  );
}
