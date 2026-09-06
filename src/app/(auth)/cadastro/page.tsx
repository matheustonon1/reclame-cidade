"use client";

import { useActionState } from "react";
import Link from "next/link";

import { cadastrar } from "./actions";

export default function CadastroPage() {
  const [state, action, pending] = useActionState(cadastrar, undefined);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-2xl font-bold">Criar conta</h1>

      <form action={action} className="flex w-full max-w-sm flex-col gap-3">
        <input
          type="text"
          name="nome"
          placeholder="Nome completo"
          className="rounded border px-3 py-2"
        />
        {state?.erros?.nome && (
          <p className="text-sm text-red-600">{state.erros.nome[0]}</p>
        )}

        <input
          type="email"
          name="email"
          placeholder="E-mail"
          className="rounded border px-3 py-2"
        />
        {state?.erros?.email && (
          <p className="text-sm text-red-600">{state.erros.email[0]}</p>
        )}

        <input
          type="password"
          name="senha"
          placeholder="Senha"
          className="rounded border px-3 py-2"
        />
        {state?.erros?.senha && (
          <p className="text-sm text-red-600">{state.erros.senha[0]}</p>
        )}

        <input
          type="password"
          name="confirmarSenha"
          placeholder="Confirmar senha"
          className="rounded border px-3 py-2"
        />
        {state?.erros?.confirmarSenha && (
          <p className="text-sm text-red-600">
            {state.erros.confirmarSenha[0]}
          </p>
        )}

        {state?.mensagem && (
          <p className="text-sm text-red-600">{state.mensagem}</p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="rounded bg-black px-3 py-2 text-white disabled:opacity-50"
        >
          Criar conta
        </button>
      </form>

      <Link href="/login" className="text-sm underline">
        Já tem conta? Entrar
      </Link>
    </main>
  );
}
