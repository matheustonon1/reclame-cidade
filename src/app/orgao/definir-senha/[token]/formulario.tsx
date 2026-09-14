"use client";

import { useActionState } from "react";

import { botaoPrimario, campoInput, cartao } from "@/lib/estilos";

import { definirSenhaOrgao } from "./actions";

export function FormularioDefinirSenha({ token }: { token: string }) {
  const acaoComToken = definirSenhaOrgao.bind(null, token);
  const [state, action, pending] = useActionState(acaoComToken, undefined);

  return (
    <form action={action} className={`flex w-full max-w-sm flex-col gap-3 ${cartao}`}>
      <input
        type="password"
        name="senha"
        placeholder="Crie uma senha"
        className={campoInput}
      />
      {state?.erros?.senha && (
        <p className="text-sm text-red-600 dark:text-red-400">{state.erros.senha[0]}</p>
      )}

      <input
        type="password"
        name="confirmarSenha"
        placeholder="Confirme a senha"
        className={campoInput}
      />
      {state?.erros?.confirmarSenha && (
        <p className="text-sm text-red-600 dark:text-red-400">
          {state.erros.confirmarSenha[0]}
        </p>
      )}

      {state?.mensagem && (
        <p className="text-sm text-slate-600 dark:text-slate-400">{state.mensagem}</p>
      )}

      <button type="submit" disabled={pending} className={botaoPrimario}>
        Definir senha e entrar
      </button>
    </form>
  );
}
