import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { containerPagina } from "@/lib/estilos";
import { decifrarSegredoTotp, gerarQrCodeTotp, gerarUriTotp } from "@/lib/totp";

import { FormularioExclusao, FormularioPerfil, FormularioSenha } from "./formularios";
import { FormularioTotp } from "./totp-formulario";

export default async function ContaPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const usuario = await prisma.user.findUniqueOrThrow({
    where: { id: session.user.id },
    select: {
      name: true,
      email: true,
      telefone: true,
      totpSecret: true,
      totpConfirmadoEm: true,
    },
  });

  const pendente = !!usuario.totpSecret && !usuario.totpConfirmadoEm;
  let qrCodeDataUrl: string | undefined;
  let segredoManual: string | undefined;
  if (pendente && usuario.totpSecret) {
    segredoManual = decifrarSegredoTotp(usuario.totpSecret);
    qrCodeDataUrl = await gerarQrCodeTotp(gerarUriTotp(usuario.email, segredoManual));
  }

  return (
    <main className={`${containerPagina} max-w-xl`}>
      <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
        Minha conta
      </h1>
      <p className="text-sm text-slate-500 dark:text-slate-400">{usuario.email}</p>

      <FormularioPerfil nome={usuario.name ?? ""} telefone={usuario.telefone ?? ""} />
      <FormularioSenha />
      <FormularioTotp
        ativo={!!usuario.totpConfirmadoEm}
        pendente={pendente}
        qrCodeDataUrl={qrCodeDataUrl}
        segredoManual={segredoManual}
      />
      <FormularioExclusao />
    </main>
  );
}
