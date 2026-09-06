import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

import { NovaReclamacaoForm } from "./form";

export default async function NovaReclamacaoPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const [estados, categorias] = await Promise.all([
    prisma.estado.findMany({ orderBy: { nome: "asc" } }),
    prisma.categoria.findMany({
      where: { ativa: true },
      orderBy: { ordem: "asc" },
    }),
  ]);

  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col gap-6 p-8">
      <h1 className="text-2xl font-bold">Nova reclamação</h1>
      <NovaReclamacaoForm estados={estados} categorias={categorias} />
    </main>
  );
}
