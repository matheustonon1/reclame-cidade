export const ITENS_POR_PAGINA = 20;

export function lerPaginaAtual(valor: string | string[] | undefined): number {
  const numero = typeof valor === "string" ? Number.parseInt(valor, 10) : NaN;
  return Number.isFinite(numero) && numero > 1 ? numero : 1;
}

export function calcularTotalPaginas(totalItens: number, itensPorPagina = ITENS_POR_PAGINA): number {
  return Math.max(1, Math.ceil(totalItens / itensPorPagina));
}

export function calcularSkip(paginaAtual: number, itensPorPagina = ITENS_POR_PAGINA): number {
  return (paginaAtual - 1) * itensPorPagina;
}
