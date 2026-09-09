import Link from "next/link";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { CategoriaIcon } from "@/components/categoria-icon";
import { botaoPrimario, cartao, containerPagina } from "@/lib/estilos";

const STATUS_PUBLICOS = [
  "PUBLICADA",
  "EM_ANDAMENTO",
  "RESOLVIDA",
  "ARQUIVADA",
] as const;

export default async function CidadePage({
  params,
}: PageProps<"/cidades/[slug]">) {
  const { slug } = await params;

  const cidade = await prisma.cidade.findUnique({
    where: { slug },
    include: { estado: true },
  });
  if (!cidade) {
    notFound();
  }

  const [porCategoria, totalPublico, resolvidas, avaliacoes] = await Promise.all([
    prisma.reclamacao.groupBy({
      by: ["categoriaId"],
      where: { cidadeId: cidade.id, status: { in: [...STATUS_PUBLICOS] } },
      _count: { categoriaId: true },
      orderBy: { _count: { categoriaId: "desc" } },
      take: 5,
    }),
    prisma.reclamacao.count({
      where: { cidadeId: cidade.id, status: { in: [...STATUS_PUBLICOS] } },
    }),
    prisma.reclamacao.count({
      where: { cidadeId: cidade.id, status: "RESOLVIDA" },
    }),
    prisma.avaliacao.groupBy({
      by: ["resolvido"],
      where: { reclamacao: { cidadeId: cidade.id } },
      _count: { _all: true },
    }),
  ]);

  const categorias = await prisma.categoria.findMany({
    where: { id: { in: porCategoria.map((item) => item.categoriaId) } },
  });
  const categoriaPorId = new Map(categorias.map((c) => [c.id, c]));
  const ranking = porCategoria.map((item) => ({
    categoria: categoriaPorId.get(item.categoriaId),
    total: item._count.categoriaId,
  }));

  const totalAvaliadas = avaliacoes.reduce((soma, a) => soma + a._count._all, 0);
  const confirmadasPeloCidadao =
    avaliacoes.find((a) => a.resolvido)?._count._all ?? 0;

  const indiceOrgao =
    totalPublico > 0 ? Math.round((resolvidas / totalPublico) * 100) : null;
  const indiceCidadao =
    totalAvaliadas > 0
      ? Math.round((confirmadasPeloCidadao / totalAvaliadas) * 100)
      : null;

  return (
    <main className={containerPagina}>
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">
        {cidade.nome} - {cidade.estado.uf}
      </h1>

      <div className={`flex flex-col gap-2 ${cartao}`}>
        <h2 className="text-lg font-semibold text-slate-900">Índice de resolução</h2>
        <p className="text-sm text-slate-600">
          {indiceOrgao !== null
            ? `${indiceOrgao}% das reclamações públicas estão marcadas como resolvidas (autorreportado pelo órgão).`
            : "Ainda não há reclamações públicas suficientes nesta cidade."}
        </p>
        <p className="text-sm text-slate-600">
          {indiceCidadao !== null
            ? `${indiceCidadao}% dos cidadãos que avaliaram confirmam que o problema foi resolvido (${confirmadasPeloCidadao} de ${totalAvaliadas} avaliadas).`
            : "Ainda não há avaliações de cidadãos suficientes nesta cidade."}
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold text-slate-900">Categorias mais reclamadas</h2>
        {ranking.length === 0 && (
          <p className="text-sm text-slate-500">
            Nenhuma reclamação pública nesta cidade ainda.
          </p>
        )}
        {ranking.map(
          (item) =>
            item.categoria && (
              <div key={item.categoria.id} className={`flex items-center gap-3 ${cartao}`}>
                <CategoriaIcon icone={item.categoria.icone} className="h-5 w-5 text-slate-400" />
                <span className="flex-1 text-sm text-slate-800">{item.categoria.nome}</span>
                <span className="text-sm font-medium text-slate-700">
                  {item.total}
                </span>
              </div>
            )
        )}
      </div>

      <Link
        href={`/reclamacoes?cidadeId=${cidade.id}`}
        className={`${botaoPrimario} text-center`}
      >
        Ver todas as reclamações desta cidade
      </Link>
    </main>
  );
}
