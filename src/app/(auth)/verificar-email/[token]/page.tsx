import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { botaoPrimario, cartao } from "@/lib/estilos";

export default async function VerificarEmailPage({
  params,
}: PageProps<"/verificar-email/[token]">) {
  const { token } = await params;

  const registro = await prisma.verificationToken.findUnique({
    where: { token },
  });

  const valido = !!registro && registro.expires > new Date();

  if (valido) {
    const usuario = await prisma.user.findUnique({
      where: { email: registro.identifier },
    });

    if (usuario) {
      await prisma.user.update({
        where: { id: usuario.id },
        data: {
          emailVerified: new Date(),
          ...(usuario.nivelVerificacao === "NAO_VERIFICADO"
            ? { nivelVerificacao: "EMAIL" }
            : {}),
        },
      });
    }

    await prisma.verificationToken.delete({ where: { token } });
  }

  return (
    <main className="animate-fade-in flex flex-1 flex-col items-center justify-center gap-4 p-8">
      <div className={`flex w-full max-w-sm flex-col items-center gap-3 text-center ${cartao}`}>
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
          {valido ? "E-mail verificado!" : "Link inválido ou expirado"}
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {valido
            ? "Sua conta agora está com o e-mail confirmado."
            : "Peça um novo link de verificação no seu painel."}
        </p>
        <Link href="/painel" className={botaoPrimario}>
          Ir para o painel
        </Link>
      </div>
    </main>
  );
}
