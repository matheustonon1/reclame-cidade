import Link from "next/link";

import { botaoPrimario, campoInput, cartao } from "@/lib/estilos";

import { login } from "./actions";

export default async function LoginPage({
  searchParams,
}: PageProps<"/login">) {
  const { erro } = await searchParams;

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">Entrar</h1>

      <form action={login} className={`flex w-full max-w-sm flex-col gap-3 ${cartao}`}>
        <input
          type="text"
          name="identificador"
          placeholder="E-mail ou CPF"
          required
          className={campoInput}
        />
        <input
          type="password"
          name="senha"
          placeholder="Senha"
          required
          className={campoInput}
        />
        {erro === "banido" && (
          <p className="text-sm text-red-600">Esta conta está suspensa.</p>
        )}
        {erro && erro !== "banido" && (
          <p className="text-sm text-red-600">E-mail/CPF ou senha inválidos.</p>
        )}
        <button type="submit" className={botaoPrimario}>
          Entrar
        </button>
      </form>

      <Link href="/cadastro" className="text-sm text-primary underline">
        Ainda não tem conta? Cadastre-se
      </Link>
    </main>
  );
}
