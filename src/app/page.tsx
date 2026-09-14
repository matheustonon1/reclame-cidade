import Link from "next/link";
import {
  Award,
  BrainCircuit,
  MapPin,
  MessageSquare,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { prisma } from "@/lib/prisma";
import { botaoPrimario, botaoSecundario } from "@/lib/estilos";

const STATUS_PUBLICOS = [
  "PUBLICADA",
  "EM_ANDAMENTO",
  "RESOLVIDA",
  "ARQUIVADA",
] as const;

const PASSOS = [
  {
    titulo: "1. Registre",
    descricao:
      "Descreva o problema urbano do seu bairro — buraco, iluminação, coleta de lixo e outros — com fotos, se quiser.",
  },
  {
    titulo: "2. Moderação por IA",
    descricao:
      "Cada reclamação passa por checagens automáticas de conteúdo antes de ir ao ar publicamente.",
  },
  {
    titulo: "3. Órgão responde",
    descricao:
      "O órgão responsável responde oficialmente e atualiza o status do problema.",
  },
  {
    titulo: "4. Você confirma",
    descricao:
      "Avalie se o problema foi realmente resolvido — sua nota entra no índice público da cidade.",
  },
];

const DIFERENCIAIS = [
  {
    icone: BrainCircuit,
    titulo: "Moderação por IA",
    descricao:
      "Texto e imagem passam por checagens automáticas — conteúdo ofensivo, spam, dados pessoais, repostagem — antes de qualquer publicação.",
  },
  {
    icone: Award,
    titulo: "Reputação pública de órgãos",
    descricao:
      "Cada órgão tem um selo público (Ótimo, Bom, Regular, Ruim), calculado a partir do tempo de resposta e da taxa real de resolução.",
  },
  {
    icone: MessageSquare,
    titulo: "Comunidade ativa",
    descricao:
      "Confirme problemas que também afetam você e comente em qualquer reclamação — com moderação e fila de revisão humana.",
  },
  {
    icone: ShieldCheck,
    titulo: "Conta protegida",
    descricao:
      "Autenticação em duas etapas por aplicativo autenticador, CPF único por conta e verificação de e-mail.",
  },
];

export default async function Home() {
  const [totalReclamacoes, totalResolvidas, totalCidades, totalOrgaos] = await Promise.all([
    prisma.reclamacao.count({ where: { status: { in: [...STATUS_PUBLICOS] } } }),
    prisma.reclamacao.count({ where: { status: "RESOLVIDA" } }),
    prisma.cidade.count({
      where: { reclamacoes: { some: { status: { in: [...STATUS_PUBLICOS] } } } },
    }),
    prisma.orgao.count({ where: { ativo: true } }),
  ]);

  const indiceResolucao =
    totalReclamacoes > 0 ? Math.round((totalResolvidas / totalReclamacoes) * 100) : null;

  const ESTATISTICAS = [
    { valor: totalReclamacoes, rotulo: "reclamações registradas" },
    { valor: totalCidades, rotulo: "cidades atendidas" },
    { valor: totalOrgaos, rotulo: "órgãos participantes" },
    {
      valor: indiceResolucao !== null ? `${indiceResolucao}%` : "—",
      rotulo: "índice de resolução",
    },
  ];

  return (
    <main className="flex flex-1 flex-col items-center overflow-hidden">
      <section className="relative flex w-full flex-col items-center gap-10 px-6 py-20 sm:px-8 sm:py-28">
        <div
          aria-hidden
          className="animate-float pointer-events-none absolute left-1/2 top-0 -z-10 h-128 w-lg -translate-x-1/2 rounded-full bg-primary/10 blur-3xl dark:bg-blue-500/10"
        />

        <div className="animate-fade-in flex max-w-2xl flex-col items-center gap-5 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
            <Sparkles className="h-3.5 w-3.5 text-primary" aria-hidden />
            Moderação de conteúdo assistida por IA
          </span>

          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl dark:text-slate-100">
            Reclame <span className="text-primary">Cidade</span>
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Registre problemas urbanos do seu município, acompanhe a resposta
            oficial do órgão responsável e confirme quando o problema for
            resolvido de verdade.
          </p>
          <div className="mt-2 flex flex-wrap justify-center gap-3">
            <Link href="/reclamacoes" className={botaoPrimario}>
              Ver reclamações públicas
            </Link>
            <Link href="/cadastro" className={botaoSecundario}>
              Criar conta
            </Link>
          </div>
          <Link href="/login" className="text-sm text-primary underline">
            Já tem conta? Entrar
          </Link>
        </div>

        {totalReclamacoes > 0 && (
          <div className="grid w-full max-w-3xl grid-cols-2 gap-4 sm:grid-cols-4">
            {ESTATISTICAS.map((item, indice) => (
              <div
                key={item.rotulo}
                style={{ animationDelay: `${indice * 80}ms` }}
                className="animate-fade-in flex flex-col items-center gap-1 rounded-lg border border-slate-200 bg-white p-4 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900"
              >
                <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {item.valor}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">{item.rotulo}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="flex w-full flex-col items-center gap-8 px-6 py-16 sm:px-8">
        <div className="flex flex-col items-center gap-2 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Como funciona
          </h2>
          <p className="max-w-md text-sm text-slate-500 dark:text-slate-400">
            Do registro à confirmação, cada etapa é pública e auditável.
          </p>
        </div>

        <div className="grid w-full max-w-4xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PASSOS.map((passo, indice) => (
            <div
              key={passo.titulo}
              style={{ animationDelay: `${indice * 80}ms` }}
              className="animate-fade-in flex flex-col gap-2 rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
            >
              <p className="font-semibold text-slate-900 dark:text-slate-100">{passo.titulo}</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">{passo.descricao}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="flex w-full flex-col items-center gap-8 border-t border-slate-200 bg-slate-50 px-6 py-16 sm:px-8 dark:border-slate-800 dark:bg-slate-950/50">
        <div className="flex flex-col items-center gap-2 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Por que o Reclame Cidade é diferente
          </h2>
          <p className="max-w-md text-sm text-slate-500 dark:text-slate-400">
            Inspirado no modelo do Reclame Aqui, mas pensado para o setor
            público.
          </p>
        </div>

        <div className="grid w-full max-w-4xl gap-4 sm:grid-cols-2">
          {DIFERENCIAIS.map((item, indice) => (
            <div
              key={item.titulo}
              style={{ animationDelay: `${indice * 80}ms` }}
              className="animate-fade-in flex gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 dark:bg-blue-500/10">
                <item.icone className="h-5 w-5 text-primary" aria-hidden />
              </div>
              <div className="flex flex-col gap-1">
                <p className="font-semibold text-slate-900 dark:text-slate-100">{item.titulo}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">{item.descricao}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="flex w-full flex-col items-center gap-4 px-6 py-16 text-center sm:px-8">
        <MapPin className="h-8 w-8 text-primary" aria-hidden />
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Seu município ainda não está na plataforma?
        </h2>
        <p className="max-w-md text-sm text-slate-600 dark:text-slate-400">
          Cadastre-se e registre a primeira reclamação da sua cidade — o feed
          público e o índice de resolução são criados automaticamente.
        </p>
        <Link href="/cadastro" className={`${botaoPrimario} mt-2`}>
          Criar conta gratuita
        </Link>
      </section>
    </main>
  );
}
