"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

import { sair } from "@/app/(app)/painel/actions";

export function UserMenu({
  nome,
  email,
  ehModerador,
  ehOrgao,
}: {
  nome: string;
  email: string;
  ehModerador: boolean;
  ehOrgao: boolean;
}) {
  const [aberto, setAberto] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function aoClicarFora(evento: MouseEvent) {
      if (!containerRef.current?.contains(evento.target as Node)) {
        setAberto(false);
      }
    }
    document.addEventListener("mousedown", aoClicarFora);
    return () => document.removeEventListener("mousedown", aoClicarFora);
  }, []);

  const iniciais = nome
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((parte) => parte[0]?.toUpperCase())
    .join("");

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setAberto((valor) => !valor)}
        aria-expanded={aberto}
        className="flex items-center gap-2 rounded-lg py-1 pl-1 pr-2 text-sm text-slate-700 hover:bg-slate-50"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white">
          {iniciais}
        </span>
        <span className="hidden sm:inline">{nome}</span>
        <ChevronDown className="h-4 w-4 text-slate-400" aria-hidden />
      </button>

      {aberto && (
        <div className="absolute right-0 z-10 mt-1 w-56 rounded-lg border border-slate-200 bg-white py-1 shadow-md">
          <p className="truncate px-3 py-2 text-xs text-slate-400">{email}</p>

          <Link
            href="/painel"
            onClick={() => setAberto(false)}
            className="block px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            Painel
          </Link>
          <Link
            href="/painel/conta"
            onClick={() => setAberto(false)}
            className="block px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            Minha conta
          </Link>
          {ehModerador && (
            <>
              <Link
                href="/moderacao"
                onClick={() => setAberto(false)}
                className="block px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                Fila de moderação
              </Link>
              <Link
                href="/moderacao/historico"
                onClick={() => setAberto(false)}
                className="block px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                Histórico de moderação
              </Link>
              <Link
                href="/denuncias"
                onClick={() => setAberto(false)}
                className="block px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                Denúncias
              </Link>
            </>
          )}
          {ehOrgao && (
            <Link
              href="/orgao"
              onClick={() => setAberto(false)}
              className="block px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              Painel do órgão
            </Link>
          )}

          <form action={sair} className="border-t border-slate-100">
            <button
              type="submit"
              className="block w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-slate-50"
            >
              Sair
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
