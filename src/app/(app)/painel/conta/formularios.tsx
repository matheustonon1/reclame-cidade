"use client";

import { useActionState } from "react";

import { botaoPrimario, campoInput, cartao } from "@/lib/estilos";

import { alterarSenha, atualizarPerfil, excluirConta } from "./actions";

export function FormularioPerfil({
  nome,
  telefone,
}: {
  nome: string;
  telefone: string;
}) {
  const [state, action, pending] = useActionState(atualizarPerfil, undefined);

  return (
    <form action={action} className={`flex flex-col gap-3 ${cartao}`}>
      <h2 className="font-semibold text-slate-900 dark:text-slate-100">Dados pessoais</h2>

      <input
        type="text"
        name="nome"
        defaultValue={nome}
        placeholder="Nome completo"
        className={campoInput}
      />
      {state?.erros?.nome && (
        <p className="text-sm text-red-600 dark:text-red-400">{state.erros.nome[0]}</p>
      )}

      <input
        type="tel"
        name="telefone"
        defaultValue={telefone}
        placeholder="Telefone (opcional)"
        className={campoInput}
      />
      {state?.erros?.telefone && (
        <p className="text-sm text-red-600 dark:text-red-400">{state.erros.telefone[0]}</p>
      )}

      {state?.mensagem && (
        <p className="text-sm text-slate-600 dark:text-slate-400">{state.mensagem}</p>
      )}

      <button type="submit" disabled={pending} className={`${botaoPrimario} w-fit`}>
        Salvar dados
      </button>
    </form>
  );
}

export function FormularioSenha() {
  const [state, action, pending] = useActionState(alterarSenha, undefined);

  return (
    <form action={action} className={`flex flex-col gap-3 ${cartao}`}>
      <h2 className="font-semibold text-slate-900 dark:text-slate-100">Alterar senha</h2>

      <input
        type="password"
        name="senhaAtual"
        placeholder="Senha atual"
        className={campoInput}
      />
      {state?.erros?.senhaAtual && (
        <p className="text-sm text-red-600 dark:text-red-400">{state.erros.senhaAtual[0]}</p>
      )}

      <input
        type="password"
        name="novaSenha"
        placeholder="Nova senha"
        className={campoInput}
      />
      {state?.erros?.novaSenha && (
        <p className="text-sm text-red-600 dark:text-red-400">{state.erros.novaSenha[0]}</p>
      )}

      <input
        type="password"
        name="confirmarNovaSenha"
        placeholder="Confirmar nova senha"
        className={campoInput}
      />
      {state?.erros?.confirmarNovaSenha && (
        <p className="text-sm text-red-600 dark:text-red-400">
          {state.erros.confirmarNovaSenha[0]}
        </p>
      )}

      {state?.mensagem && (
        <p className="text-sm text-slate-600 dark:text-slate-400">{state.mensagem}</p>
      )}

      <button type="submit" disabled={pending} className={`${botaoPrimario} w-fit`}>
        Alterar senha
      </button>
    </form>
  );
}

export function FormularioExclusao() {
  const [state, action, pending] = useActionState(excluirConta, undefined);

  return (
    <form
      action={action}
      className="flex flex-col gap-3 rounded-lg border border-red-200 bg-red-50/50 p-4 dark:border-red-900 dark:bg-red-950/30"
    >
      <h2 className="font-semibold text-red-800 dark:text-red-400">Excluir conta</h2>
      <p className="text-sm text-red-700 dark:text-red-400">
        Seus dados pessoais (nome, e-mail, CPF, telefone) são apagados. As
        reclamações que você publicou continuam visíveis, mas sem
        identificação do autor. Essa ação não pode ser desfeita.
      </p>

      <input
        type="password"
        name="senhaAtual"
        placeholder="Confirme sua senha"
        className={campoInput}
      />
      {state?.erros?.senhaAtual && (
        <p className="text-sm text-red-600 dark:text-red-400">{state.erros.senhaAtual[0]}</p>
      )}
      {state?.mensagem && (
        <p className="text-sm text-red-600 dark:text-red-400">{state.mensagem}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-fit rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-800 active:scale-95 disabled:opacity-50 disabled:active:scale-100 dark:bg-red-600 dark:hover:bg-red-500"
      >
        Excluir minha conta
      </button>
    </form>
  );
}
