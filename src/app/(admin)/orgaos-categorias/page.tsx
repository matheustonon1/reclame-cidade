import { prisma } from "@/lib/prisma";
import { botaoPrimario, cartao, containerPagina } from "@/lib/estilos";

import { exigirAdmin } from "../solicitacoes-orgao/exigir-admin";
import { atualizarCategoriasOrgao } from "./actions";

export default async function OrgaosCategoriasPage() {
  await exigirAdmin();

  const [orgaos, categorias] = await Promise.all([
    prisma.orgao.findMany({
      where: { ativo: true },
      orderBy: { nome: "asc" },
      include: { cidade: true, categorias: { select: { id: true } } },
    }),
    prisma.categoria.findMany({ where: { ativa: true }, orderBy: { ordem: "asc" } }),
  ]);

  return (
    <main className={containerPagina}>
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Categorias por órgão
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Define quais categorias de reclamação cada órgão vê e pode responder.
          Um órgão sem nenhuma categoria marcada continua atendendo qualquer
          reclamação da sua cidade (comportamento padrão).
        </p>
      </div>

      {orgaos.length === 0 && (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Nenhum órgão ativo cadastrado ainda.
        </p>
      )}

      {orgaos.map((orgao) => (
        <form
          key={orgao.id}
          action={atualizarCategoriasOrgao.bind(null, orgao.id)}
          className={`flex flex-col gap-3 ${cartao}`}
        >
          <div>
            <p className="font-medium text-slate-900 dark:text-slate-100">
              {orgao.nome}
              {orgao.sigla && ` (${orgao.sigla})`}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{orgao.cidade.nome}</p>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {categorias.map((categoria) => (
              <label
                key={categoria.id}
                className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300"
              >
                <input
                  type="checkbox"
                  name="categoriaIds"
                  value={categoria.id}
                  defaultChecked={orgao.categorias.some((c) => c.id === categoria.id)}
                />
                {categoria.nome}
              </label>
            ))}
          </div>

          <button type="submit" className={`${botaoPrimario} w-fit`}>
            Salvar
          </button>
        </form>
      ))}
    </main>
  );
}
