import type { Avaliacao, Orgao, Reclamacao, RespostaOficial } from "@prisma/client";

export interface EventoTimeline {
  data: Date;
  titulo: string;
  descricao?: string;
}

export function construirLinhaDoTempo(
  reclamacao: Reclamacao,
  respostas: (RespostaOficial & { orgao: Orgao })[],
  avaliacao: Avaliacao | null
): EventoTimeline[] {
  const eventos: EventoTimeline[] = [
    { data: reclamacao.createdAt, titulo: "Reclamação registrada" },
  ];

  if (reclamacao.publicadaEm) {
    eventos.push({ data: reclamacao.publicadaEm, titulo: "Publicada" });
  }

  if (reclamacao.status === "REJEITADA" && reclamacao.motivoRejeicao) {
    eventos.push({
      data: reclamacao.updatedAt,
      titulo: "Rejeitada",
      descricao: reclamacao.motivoRejeicao,
    });
  }

  for (const resposta of respostas) {
    eventos.push({
      data: resposta.createdAt,
      titulo: `Resposta de ${resposta.orgao.nome}`,
      descricao:
        resposta.texto +
        (resposta.novoStatus ? ` (novo status: ${resposta.novoStatus})` : ""),
    });
  }

  if (avaliacao) {
    eventos.push({
      data: avaliacao.createdAt,
      titulo: avaliacao.resolvido
        ? "Cidadão confirmou a resolução"
        : "Cidadão contestou a resolução",
      descricao: avaliacao.comentario ?? undefined,
    });
  }

  return eventos.sort((a, b) => a.data.getTime() - b.data.getTime());
}
