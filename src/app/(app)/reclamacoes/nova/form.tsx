"use client";

import { useActionState } from "react";

import { criarReclamacao } from "./actions";
import { SeletorCidade } from "./cidade-select";

interface Estado {
  id: string;
  nome: string;
  uf: string;
}

interface Categoria {
  id: string;
  nome: string;
}

export function NovaReclamacaoForm({
  estados,
  categorias,
}: {
  estados: Estado[];
  categorias: Categoria[];
}) {
  const [state, action, pending] = useActionState(criarReclamacao, undefined);

  return (
    <form action={action} className="flex flex-col gap-3">
      <input
        type="text"
        name="titulo"
        placeholder="Título"
        className="rounded border px-3 py-2"
      />
      {state?.erros?.titulo && (
        <p className="text-sm text-red-600">{state.erros.titulo[0]}</p>
      )}

      <textarea
        name="descricao"
        placeholder="Descreva o problema"
        rows={5}
        className="rounded border px-3 py-2"
      />
      {state?.erros?.descricao && (
        <p className="text-sm text-red-600">{state.erros.descricao[0]}</p>
      )}

      <select
        name="categoriaId"
        defaultValue=""
        className="rounded border px-3 py-2"
      >
        <option value="" disabled>
          Categoria
        </option>
        {categorias.map((categoria) => (
          <option key={categoria.id} value={categoria.id}>
            {categoria.nome}
          </option>
        ))}
      </select>
      {state?.erros?.categoriaId && (
        <p className="text-sm text-red-600">{state.erros.categoriaId[0]}</p>
      )}

      <SeletorCidade estados={estados} />
      {state?.erros?.cidadeId && (
        <p className="text-sm text-red-600">{state.erros.cidadeId[0]}</p>
      )}

      <input
        type="text"
        name="endereco"
        placeholder="Endereço (rua e número)"
        className="rounded border px-3 py-2"
      />
      {state?.erros?.endereco && (
        <p className="text-sm text-red-600">{state.erros.endereco[0]}</p>
      )}

      <input
        type="text"
        name="referencia"
        placeholder="Ponto de referência (opcional)"
        className="rounded border px-3 py-2"
      />

      <input
        type="text"
        name="cep"
        placeholder="CEP (opcional)"
        className="rounded border px-3 py-2"
      />

      {state?.mensagem && (
        <p className="text-sm text-red-600">{state.mensagem}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded bg-black px-3 py-2 text-white disabled:opacity-50"
      >
        Enviar reclamação
      </button>
    </form>
  );
}
