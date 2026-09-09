import Link from "next/link";

import { botaoPrimario, botaoSecundario } from "@/lib/estilos";

const PASSOS = [
  {
    titulo: "1. Registre",
    descricao:
      "Descreva o problema urbano do seu bairro — buraco, iluminação, coleta de lixo e outros.",
  },
  {
    titulo: "2. Moderação por IA",
    descricao:
      "Cada reclamação passa por checagens automáticas antes de ir ao ar publicamente.",
  },
  {
    titulo: "3. Órgão responde",
    descricao:
      "O órgão responsável responde oficialmente e você confirma se o problema foi resolvido.",
  },
];

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center gap-16 px-6 py-16 sm:px-8">
      <div className="flex max-w-xl flex-col items-center gap-4 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900">
          Reclame <span className="text-primary">Cidade</span>
        </h1>
        <p className="text-lg text-slate-600">
          Registre problemas urbanos do seu município e acompanhe a resposta
          oficial, com moderação de conteúdo assistida por IA.
        </p>
        <div className="mt-2 flex flex-wrap justify-center gap-3">
          <Link href="/reclamacoes" className={botaoPrimario}>
            Ver reclamações públicas
          </Link>
          <Link href="/login" className={botaoSecundario}>
            Entrar
          </Link>
        </div>
      </div>

      <div className="grid w-full max-w-3xl gap-4 sm:grid-cols-3">
        {PASSOS.map((passo) => (
          <div
            key={passo.titulo}
            className="rounded-lg border border-slate-200 bg-white p-4 text-sm shadow-sm"
          >
            <p className="font-semibold text-slate-900">{passo.titulo}</p>
            <p className="mt-1 text-slate-600">{passo.descricao}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
