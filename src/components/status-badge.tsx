import type { StatusReclamacao } from "@prisma/client";

const CONFIG: Record<StatusReclamacao, { label: string; className: string }> = {
  RASCUNHO: {
    label: "Rascunho",
    className: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  },
  EM_MODERACAO: {
    label: "Em moderação",
    className: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  },
  AGUARDANDO_REVISAO: {
    label: "Aguardando revisão",
    className: "bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-400",
  },
  PUBLICADA: {
    label: "Publicada",
    className: "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400",
  },
  REJEITADA: {
    label: "Rejeitada",
    className: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400",
  },
  EM_ANDAMENTO: {
    label: "Em andamento",
    className: "bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-400",
  },
  RESOLVIDA: {
    label: "Resolvida",
    className: "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400",
  },
  ARQUIVADA: {
    label: "Arquivada",
    className: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
  },
};

export function StatusBadge({ status }: { status: StatusReclamacao }) {
  const { label, className } = CONFIG[status];

  return (
    <span
      className={`inline-block shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${className}`}
    >
      {label}
    </span>
  );
}
