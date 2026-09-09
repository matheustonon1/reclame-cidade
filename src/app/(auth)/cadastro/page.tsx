"use client";

import { useActionState } from "react";
import Link from "next/link";

import { botaoPrimario, campoInput, cartao } from "@/lib/estilos";

import { cadastrar } from "./actions";

export default function CadastroPage() {
  const [state, action, pending] = useActionState(cadastrar, undefined);

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">Criar conta</h1>

      <form action={action} className={`flex w-full max-w-sm flex-col gap-3 ${cartao}`}>
        <input
          type="text"
          name="nome"
          placeholder="Nome completo"
          className={campoInput}
        />
        {state?.erros?.nome && (
          <p className="text-sm text-red-600">{state.erros.nome[0]}</p>
        )}

        <input
          type="email"
          name="email"
          placeholder="E-mail"
          className={campoInput}
        />
        {state?.erros?.email && (
          <p className="text-sm text-red-600">{state.erros.email[0]}</p>
        )}

        <input
          type="text"
          name="cpf"
          placeholder="CPF"
          className={campoInput}
        />
        {state?.erros?.cpf && (
          <p className="text-sm text-red-600">{state.erros.cpf[0]}</p>
        )}

        <input
          type="password"
          name="senha"
          placeholder="Senha"
          className={campoInput}
        />
        {state?.erros?.senha && (
          <p className="text-sm text-red-600">{state.erros.senha[0]}</p>
        )}

        <input
          type="password"
          name="confirmarSenha"
          placeholder="Confirmar senha"
          className={campoInput}
        />
        {state?.erros?.confirmarSenha && (
          <p className="text-sm text-red-600">
            {state.erros.confirmarSenha[0]}
          </p>
        )}

        {state?.mensagem && (
          <p className="text-sm text-red-600">{state.mensagem}</p>
        )}

        <button type="submit" disabled={pending} className={botaoPrimario}>
          Criar conta
        </button>
      </form>

      <Link href="/login" className="text-sm text-primary underline">
        Já tem conta? Entrar
      </Link>
    </main>
  );
}
