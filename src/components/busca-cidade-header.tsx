"use client";

import { useRouter } from "next/navigation";

import { SeletorCidade } from "./cidade-combobox";

export function BuscaCidadeHeader() {
  const router = useRouter();

  return (
    <div className="hidden max-w-xs flex-1 sm:block">
      <SeletorCidade
        name="cidadeId"
        placeholder="Buscar cidade..."
        onSelecionar={(cidade) => {
          if (cidade.slug) {
            router.push(`/cidades/${cidade.slug}`);
          }
        }}
      />
    </div>
  );
}
