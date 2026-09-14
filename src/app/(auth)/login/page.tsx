"use client";

import Link from "next/link";
import { useActionState } from "react";

import { botaoPrimario, campoInput, cartao } from "@/lib/estilos";

import { login } from "./actions";

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, undefined);

  return (
    <main className="animate-fade-in flex flex-1 flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
        Entrar
      </h1>

      <form action={action} className={`flex w-full max-w-sm flex-col gap-3 ${cartao}`}>
        <input
          type="text"
          name="identificador"
          placeholder="E-mail ou CPF"
          defaultValue={state?.identificador ?? ""}
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
        {state?.etapaTotp && (
          <input
            type="text"
            name="codigoTotp"
            inputMode="numeric"
            placeholder="Código do autenticador (ou código de backup)"
            autoFocus
            className={campoInput}
          />
        )}
        {state?.erro && <p className="text-sm text-red-600 dark:text-red-400">{state.erro}</p>}
        <button type="submit" disabled={pending} className={botaoPrimario}>
          Entrar
        </button>
      </form>

      <Link href="/cadastro" className="text-sm text-primary underline">
        Ainda não tem conta? Cadastre-se
      </Link>
      <Link href="/orgao/solicitar" className="text-sm text-slate-500 underline dark:text-slate-400">
        É um órgão público? Solicite acesso
      </Link>
    </main>
  );
}
