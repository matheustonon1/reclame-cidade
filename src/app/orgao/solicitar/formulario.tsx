"use client";

import Link from "next/link";
import { useActionState } from "react";

import { SeletorCidade } from "@/components/cidade-combobox";
import { botaoPrimario, campoInput, cartao } from "@/lib/estilos";

import { solicitarOrgao } from "./actions";

export function FormularioSolicitarOrgao() {
  const [state, action, pending] = useActionState(solicitarOrgao, undefined);

  if (state?.sucesso) {
    return (
      <div className={`flex w-full max-w-sm flex-col items-center gap-3 text-center ${cartao}`}>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
          Solicitação enviada!
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">{state.mensagem}</p>
        <Link href="/" className="text-sm text-primary underline">
          Voltar para o início
        </Link>
      </div>
    );
  }

  return (
    <>
      <form action={action} className={`flex w-full max-w-sm flex-col gap-3 ${cartao}`}>
        <input
          type="text"
          name="nomeOrgao"
          placeholder="Nome do órgão (ex: Secretaria de Obras)"
          className={campoInput}
        />
        {state?.erros?.nomeOrgao && (
          <p className="text-sm text-red-600 dark:text-red-400">{state.erros.nomeOrgao[0]}</p>
        )}

        <input type="text" name="sigla" placeholder="Sigla (opcional)" className={campoInput} />

        <SeletorCidade name="cidadeId" required placeholder="Cidade" />
        {state?.erros?.cidadeId && (
          <p className="text-sm text-red-600 dark:text-red-400">{state.erros.cidadeId[0]}</p>
        )}

        <input
          type="text"
          name="nomeResponsavel"
          placeholder="Seu nome completo"
          className={campoInput}
        />
        {state?.erros?.nomeResponsavel && (
          <p className="text-sm text-red-600 dark:text-red-400">
            {state.erros.nomeResponsavel[0]}
          </p>
        )}

        <input
          type="email"
          name="email"
          placeholder="E-mail institucional"
          className={campoInput}
        />
        {state?.erros?.email && (
          <p className="text-sm text-red-600 dark:text-red-400">{state.erros.email[0]}</p>
        )}

        <input
          type="tel"
          name="telefone"
          placeholder="Telefone (opcional)"
          className={campoInput}
        />

        {state?.mensagem && (
          <p className="text-sm text-red-600 dark:text-red-400">{state.mensagem}</p>
        )}

        <button type="submit" disabled={pending} className={botaoPrimario}>
          Enviar solicitação
        </button>
      </form>

      <Link href="/login" className="text-sm text-primary underline">
        Já tem conta? Entrar
      </Link>
    </>
  );
}
