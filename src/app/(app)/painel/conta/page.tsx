import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { containerPagina } from "@/lib/estilos";

import { FormularioExclusao, FormularioPerfil, FormularioSenha } from "./formularios";

export default async function ContaPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const usuario = await prisma.user.findUniqueOrThrow({
    where: { id: session.user.id },
    select: { name: true, email: true, telefone: true },
  });

  return (
    <main className={`${containerPagina} max-w-xl`}>
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">Minha conta</h1>
      <p className="text-sm text-slate-500">{usuario.email}</p>

      <FormularioPerfil nome={usuario.name ?? ""} telefone={usuario.telefone ?? ""} />
      <FormularioSenha />
      <FormularioExclusao />
    </main>
  );
}
