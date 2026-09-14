"use client";

import { useActionState } from "react";
import Link from "next/link";
import Script from "next/script";

import { botaoPrimario, campoInput, cartao } from "@/lib/estilos";

import { cadastrar } from "./actions";

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

export default function CadastroPage() {
  const [state, action, pending] = useActionState(cadastrar, undefined);

  return (
    <main className="animate-fade-in flex flex-1 flex-col items-center justify-center gap-6 p-8">
      {TURNSTILE_SITE_KEY && (
        <Script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js"
          strategy="afterInteractive"
        />
      )}

      <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
        Criar conta
      </h1>

      <form action={action} className={`flex w-full max-w-sm flex-col gap-3 ${cartao}`}>
        <input
          type="text"
          name="nome"
          placeholder="Nome completo"
          className={campoInput}
        />
        {state?.erros?.nome && (
          <p className="text-sm text-red-600 dark:text-red-400">{state.erros.nome[0]}</p>
        )}

        <input
          type="email"
          name="email"
          placeholder="E-mail"
          className={campoInput}
        />
        {state?.erros?.email && (
          <p className="text-sm text-red-600 dark:text-red-400">{state.erros.email[0]}</p>
        )}

        <input
          type="text"
          name="cpf"
          placeholder="CPF"
          className={campoInput}
        />
        {state?.erros?.cpf && (
          <p className="text-sm text-red-600 dark:text-red-400">{state.erros.cpf[0]}</p>
        )}

        <input
          type="password"
          name="senha"
          placeholder="Senha"
          className={campoInput}
        />
        {state?.erros?.senha && (
          <p className="text-sm text-red-600 dark:text-red-400">{state.erros.senha[0]}</p>
        )}

        <input
          type="password"
          name="confirmarSenha"
          placeholder="Confirmar senha"
          className={campoInput}
        />
        {state?.erros?.confirmarSenha && (
          <p className="text-sm text-red-600 dark:text-red-400">
            {state.erros.confirmarSenha[0]}
          </p>
        )}

        <label className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
          <input type="checkbox" name="aceitaTermos" required className="mt-0.5" />
          <span>
            Li e aceito os{" "}
            <Link href="/termos" target="_blank" className="text-primary underline">
              Termos de Uso e a Política de Privacidade
            </Link>
            .
          </span>
        </label>
        {state?.erros?.aceitaTermos && (
          <p className="text-sm text-red-600 dark:text-red-400">{state.erros.aceitaTermos[0]}</p>
        )}

        {TURNSTILE_SITE_KEY && (
          <div className="cf-turnstile" data-sitekey={TURNSTILE_SITE_KEY} />
        )}

        {state?.mensagem && (
          <p className="text-sm text-red-600 dark:text-red-400">{state.mensagem}</p>
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
