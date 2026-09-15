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
  ehAdmin,
}: {
  nome: string;
  email: string;
  ehModerador: boolean;
  ehOrgao: boolean;
  ehAdmin: boolean;
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
        className="flex items-center gap-2 rounded-lg py-1 pl-1 pr-2 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white dark:bg-blue-600">
          {iniciais}
        </span>
        <span className="hidden max-w-40 truncate sm:inline">{nome}</span>
        <ChevronDown className="h-4 w-4 text-slate-400 dark:text-slate-500" aria-hidden />
      </button>

      {aberto && (
        <div className="animate-pop-in absolute right-0 z-10 mt-1 w-56 origin-top-right rounded-lg border border-slate-200 bg-white py-1 shadow-md dark:border-slate-700 dark:bg-slate-900">
          <p className="truncate px-3 py-2 text-xs text-slate-400 dark:text-slate-500">{email}</p>

          <Link
            href="/painel"
            onClick={() => setAberto(false)}
            className="block px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Painel
          </Link>
          <Link
            href="/painel/conta"
            onClick={() => setAberto(false)}
            className="block px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Minha conta
          </Link>
          {ehModerador && (
            <>
              <Link
                href="/moderacao"
                onClick={() => setAberto(false)}
                className="block px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Fila de moderação
              </Link>
              <Link
                href="/moderacao/historico"
                onClick={() => setAberto(false)}
                className="block px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Histórico de moderação
              </Link>
              <Link
                href="/moderacao/comentarios"
                onClick={() => setAberto(false)}
                className="block px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Comentários reprovados
              </Link>
              <Link
                href="/moderacao/estatisticas"
                onClick={() => setAberto(false)}
                className="block px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Estatísticas de moderação
              </Link>
              <Link
                href="/denuncias"
                onClick={() => setAberto(false)}
                className="block px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Denúncias
              </Link>
              {ehAdmin && (
                <>
                  <Link
                    href="/solicitacoes-orgao"
                    onClick={() => setAberto(false)}
                    className="block px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    Solicitações de órgão
                  </Link>
                  <Link
                    href="/orgaos-categorias"
                    onClick={() => setAberto(false)}
                    className="block px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    Categorias por órgão
                  </Link>
                </>
              )}
            </>
          )}
          {ehOrgao && (
            <Link
              href="/orgao"
              onClick={() => setAberto(false)}
              className="block px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Painel do órgão
            </Link>
          )}

          <form action={sair} className="border-t border-slate-100 dark:border-slate-800">
            <button
              type="submit"
              className="block w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-slate-50 dark:text-red-400 dark:hover:bg-slate-800"
            >
              Sair
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
