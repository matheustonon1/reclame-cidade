"use client";

import { useState } from "react";

import { FormularioCadastroPessoa } from "@/app/(auth)/cadastro/formulario-pessoa";
import { FormularioSolicitarOrgao } from "@/app/orgao/solicitar/formulario";

type TipoCadastro = "pessoa" | "orgao";

export function CadastroTipoSwitch({ tipoInicial }: { tipoInicial: TipoCadastro }) {
  const [tipo, setTipo] = useState<TipoCadastro>(tipoInicial);
  const ehOrgao = tipo === "orgao";

  return (
    <>
      <div className="flex max-w-sm flex-col items-center gap-3 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          {ehOrgao ? "Solicitar acesso como órgão" : "Criar conta"}
        </h1>
        {ehOrgao && (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Uma conta de órgão pode responder oficialmente às reclamações da
            sua cidade. Um administrador analisa cada pedido antes de liberar
            o acesso.
          </p>
        )}

        <div className="mt-1 flex items-center gap-3 text-sm font-medium">
          <span
            className={
              ehOrgao
                ? "text-slate-400 dark:text-slate-600"
                : "text-slate-900 dark:text-slate-100"
            }
          >
            Pessoa
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={ehOrgao}
            aria-label="Alternar entre cadastro de pessoa e solicitação de acesso como órgão"
            onClick={() => setTipo(ehOrgao ? "pessoa" : "orgao")}
            className={`relative h-7 w-14 shrink-0 rounded-full transition-colors duration-300 ease-in-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
              ehOrgao ? "bg-primary dark:bg-blue-600" : "bg-slate-300 dark:bg-slate-700"
            }`}
          >
            <span
              className="absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow-md transition-transform duration-300 ease-in-out"
              style={{ transform: ehOrgao ? "translateX(1.75rem)" : "translateX(0)" }}
            />
          </button>
          <span
            className={
              ehOrgao
                ? "text-slate-900 dark:text-slate-100"
                : "text-slate-400 dark:text-slate-600"
            }
          >
            Órgão público
          </span>
        </div>
      </div>

      <div key={tipo} className="animate-fade-in flex w-full flex-col items-center gap-4">
        {ehOrgao ? <FormularioSolicitarOrgao /> : <FormularioCadastroPessoa />}
      </div>
    </>
  );
}
