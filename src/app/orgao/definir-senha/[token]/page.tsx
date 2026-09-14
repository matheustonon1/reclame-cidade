import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { botaoPrimario, cartao } from "@/lib/estilos";

import { FormularioDefinirSenha } from "./formulario";

export default async function DefinirSenhaOrgaoPage({
  params,
}: PageProps<"/orgao/definir-senha/[token]">) {
  const { token } = await params;

  const registro = await prisma.verificationToken.findUnique({ where: { token } });
  const usuario = registro
    ? await prisma.user.findUnique({ where: { email: registro.identifier } })
    : null;
  const valido =
    !!registro && registro.expires > new Date() && !!usuario && !usuario.senhaHash;

  if (!valido) {
    return (
      <main className="animate-fade-in flex flex-1 flex-col items-center justify-center gap-4 p-8">
        <div className={`flex w-full max-w-sm flex-col items-center gap-3 text-center ${cartao}`}>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Link inválido ou expirado
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Peça pra um administrador reenviar o convite, ou faça login se já
            tiver definido sua senha.
          </p>
          <Link href="/login" className={botaoPrimario}>
            Ir para o login
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="animate-fade-in flex flex-1 flex-col items-center justify-center gap-6 p-8">
      <div className="flex max-w-sm flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Bem-vindo(a), {usuario!.name}!
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Defina uma senha pra acessar sua conta de órgão.
        </p>
      </div>
      <FormularioDefinirSenha token={token} />
    </main>
  );
}
