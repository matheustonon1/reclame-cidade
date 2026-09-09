"use client";

import { useActionState } from "react";

import { botaoPrimario, campoInput, cartao } from "@/lib/estilos";

import { alterarSenha, atualizarPerfil } from "./actions";

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
      <h2 className="font-semibold text-slate-900">Dados pessoais</h2>

      <input
        type="text"
        name="nome"
        defaultValue={nome}
        placeholder="Nome completo"
        className={campoInput}
      />
      {state?.erros?.nome && (
        <p className="text-sm text-red-600">{state.erros.nome[0]}</p>
      )}

      <input
        type="tel"
        name="telefone"
        defaultValue={telefone}
        placeholder="Telefone (opcional)"
        className={campoInput}
      />
      {state?.erros?.telefone && (
        <p className="text-sm text-red-600">{state.erros.telefone[0]}</p>
      )}

      {state?.mensagem && (
        <p className="text-sm text-slate-600">{state.mensagem}</p>
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
      <h2 className="font-semibold text-slate-900">Alterar senha</h2>

      <input
        type="password"
        name="senhaAtual"
        placeholder="Senha atual"
        className={campoInput}
      />
      {state?.erros?.senhaAtual && (
        <p className="text-sm text-red-600">{state.erros.senhaAtual[0]}</p>
      )}

      <input
        type="password"
        name="novaSenha"
        placeholder="Nova senha"
        className={campoInput}
      />
      {state?.erros?.novaSenha && (
        <p className="text-sm text-red-600">{state.erros.novaSenha[0]}</p>
      )}

      <input
        type="password"
        name="confirmarNovaSenha"
        placeholder="Confirmar nova senha"
        className={campoInput}
      />
      {state?.erros?.confirmarNovaSenha && (
        <p className="text-sm text-red-600">
          {state.erros.confirmarNovaSenha[0]}
        </p>
      )}

      {state?.mensagem && (
        <p className="text-sm text-slate-600">{state.mensagem}</p>
      )}

      <button type="submit" disabled={pending} className={`${botaoPrimario} w-fit`}>
        Alterar senha
      </button>
    </form>
  );
}
