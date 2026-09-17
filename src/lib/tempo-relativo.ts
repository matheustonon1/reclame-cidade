const RTF = new Intl.RelativeTimeFormat("pt-BR", { numeric: "auto" });

const UNIDADES: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 31536000],
  ["month", 2592000],
  ["week", 604800],
  ["day", 86400],
  ["hour", 3600],
  ["minute", 60],
];

export function formatarTempoRelativo(data: Date): string {
  const segundos = (data.getTime() - Date.now()) / 1000;

  for (const [unidade, segundosPorUnidade] of UNIDADES) {
    if (Math.abs(segundos) >= segundosPorUnidade) {
      return RTF.format(Math.round(segundos / segundosPorUnidade), unidade);
    }
  }

  return RTF.format(Math.round(segundos / 60), "minute");
}
