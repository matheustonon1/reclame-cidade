import Link from "next/link";

import { login } from "./actions";

export default async function LoginPage({
  searchParams,
}: PageProps<"/login">) {
  const { erro } = await searchParams;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-2xl font-bold">Entrar</h1>

      <form action={login} className="flex w-full max-w-sm flex-col gap-3">
        <input
          type="email"
          name="email"
          placeholder="E-mail"
          required
          className="rounded border px-3 py-2"
        />
        <input
          type="password"
          name="senha"
          placeholder="Senha"
          required
          className="rounded border px-3 py-2"
        />
        {erro && (
          <p className="text-sm text-red-600">E-mail ou senha inválidos.</p>
        )}
        <button
          type="submit"
          className="rounded bg-black px-3 py-2 text-white"
        >
          Entrar
        </button>
      </form>

      <Link href="/cadastro" className="text-sm underline">
        Ainda não tem conta? Cadastre-se
      </Link>
    </main>
  );
}
