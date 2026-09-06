import { Type } from "@google/genai";

import { prisma } from "@/lib/prisma";

import { getGeminiClient } from "./gemini";

const MODELO = "gemini-3.6-flash";
const VERSAO_PROMPT = "v1";

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    scoreOfensivo: { type: Type.NUMBER },
    scoreSpam: { type: Type.NUMBER },
    scoreDadosPessoais: { type: Type.NUMBER },
    scoreForaEscopo: { type: Type.NUMBER },
    scoreDesinformacao: { type: Type.NUMBER },
    justificativa: { type: Type.STRING },
  },
  required: [
    "scoreOfensivo",
    "scoreSpam",
    "scoreDadosPessoais",
    "scoreForaEscopo",
    "scoreDesinformacao",
    "justificativa",
  ],
};

interface ResultadoAnalise {
  scoreOfensivo: number;
  scoreSpam: number;
  scoreDadosPessoais: number;
  scoreForaEscopo: number;
  scoreDesinformacao: number;
  justificativa: string;
}

function montarPrompt(titulo: string, descricao: string, categoria: string) {
  return `Você é o sistema de moderação de conteúdo do Reclame Cidade, uma plataforma de reclamações urbanas por município.

Analise o título e a descrição de uma reclamação e avalie, em uma escala de 0 a 1, o quanto o texto apresenta cada um destes problemas:

- scoreOfensivo: conteúdo ofensivo, discurso de ódio ou linguagem abusiva.
- scoreSpam: propaganda, spam ou conteúdo sem relação com uma reclamação real.
- scoreDadosPessoais: exposição de dados pessoais de terceiros (CPF, telefone, endereço residencial de uma pessoa específica, acusação nominal a um indivíduo). NÃO conte o endereço do próprio problema relatado (rua, bairro) como dado pessoal.
- scoreForaEscopo: assunto fora do escopo de problemas urbanos/infraestrutura municipal. Categoria informada: "${categoria}".
- scoreDesinformacao: indícios de conteúdo pouco confiável — linguagem sensacionalista, alegações amplas não verificáveis, incoerências internas no texto. Você não tem como confirmar se o fato relatado é verdadeiro; avalie apenas indícios de baixa confiabilidade do relato, nunca a veracidade do problema em si.

Título: ${titulo}
Descrição: ${descricao}

Responda apenas com o JSON solicitado. Os scores devem ser números entre 0 e 1. A justificativa deve ter até 300 caracteres e ser objetiva.`;
}

function decidir(
  scoreGeral: number
): "APROVAR" | "REPROVAR" | "ENCAMINHAR_REVISAO" {
  if (scoreGeral >= 0.75) return "REPROVAR";
  if (scoreGeral >= 0.4) return "ENCAMINHAR_REVISAO";
  return "APROVAR";
}

// O modelo gratuito do Gemini retorna 503 (UNAVAILABLE) com frequência sob
// alta demanda; essas falhas são transitórias e desaparecem em segundos.
async function gerarConteudoComRetry(
  parametros: Parameters<
    ReturnType<typeof getGeminiClient>["models"]["generateContent"]
  >[0],
  tentativas = 3
) {
  for (let tentativa = 1; tentativa <= tentativas; tentativa++) {
    try {
      return await getGeminiClient().models.generateContent(parametros);
    } catch (erro) {
      const ultimaTentativa = tentativa === tentativas;
      if (ultimaTentativa) throw erro;
      await new Promise((resolve) => setTimeout(resolve, tentativa * 1500));
    }
  }
  throw new Error("Falha inesperada ao chamar o modelo de moderação.");
}

export async function moderarReclamacao(reclamacaoId: string) {
  const reclamacao = await prisma.reclamacao.findUniqueOrThrow({
    where: { id: reclamacaoId },
    include: { categoria: true },
  });

  const inicio = Date.now();

  const resposta = await gerarConteudoComRetry({
    model: MODELO,
    contents: montarPrompt(
      reclamacao.titulo,
      reclamacao.descricao,
      reclamacao.categoria.nome
    ),
    config: {
      responseMimeType: "application/json",
      responseSchema: RESPONSE_SCHEMA,
    },
  });

  const latenciaMs = Date.now() - inicio;

  if (!resposta.text) {
    throw new Error("Resposta vazia do modelo de moderação.");
  }

  const analise: ResultadoAnalise = JSON.parse(resposta.text);

  const scoreGeral = Math.max(
    analise.scoreOfensivo,
    analise.scoreSpam,
    analise.scoreDadosPessoais,
    analise.scoreForaEscopo,
    analise.scoreDesinformacao
  );

  const decisao = decidir(scoreGeral);

  await prisma.logModeracao.create({
    data: {
      alvoTipo: "RECLAMACAO",
      alvoId: reclamacao.id,
      provedor: "google",
      modelo: MODELO,
      versaoPrompt: VERSAO_PROMPT,
      decisao,
      scoreGeral,
      scoreOfensivo: analise.scoreOfensivo,
      scoreSpam: analise.scoreSpam,
      scoreDadosPessoais: analise.scoreDadosPessoais,
      scoreForaEscopo: analise.scoreForaEscopo,
      scoreDesinformacao: analise.scoreDesinformacao,
      justificativa: analise.justificativa,
      resultadoJson: resposta.text,
      latenciaMs,
      tokensEntrada: resposta.usageMetadata?.promptTokenCount,
      tokensSaida: resposta.usageMetadata?.candidatesTokenCount,
    },
  });

  const agora = new Date();

  if (decisao === "APROVAR") {
    await prisma.reclamacao.update({
      where: { id: reclamacao.id },
      data: {
        status: "PUBLICADA",
        publicadaEm: agora,
        scoreModeracao: scoreGeral,
      },
    });
  } else if (decisao === "REPROVAR") {
    await prisma.reclamacao.update({
      where: { id: reclamacao.id },
      data: {
        status: "REJEITADA",
        motivoRejeicao: analise.justificativa,
        scoreModeracao: scoreGeral,
      },
    });
  } else {
    await prisma.reclamacao.update({
      where: { id: reclamacao.id },
      data: { status: "AGUARDANDO_REVISAO", scoreModeracao: scoreGeral },
    });
  }

  return decisao;
}
