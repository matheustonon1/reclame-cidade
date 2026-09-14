import { Type } from "@google/genai";

import { prisma } from "@/lib/prisma";

import { gerarConteudoComRetry } from "./moderacao";

const MODELO = "gemini-3.6-flash";
const VERSAO_PROMPT = "v1";
const LIMIAR_REPROVACAO = 0.5;

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    scoreOfensivo: { type: Type.NUMBER },
    scoreSpam: { type: Type.NUMBER },
    scoreDadosPessoais: { type: Type.NUMBER },
    justificativa: { type: Type.STRING },
  },
  required: ["scoreOfensivo", "scoreSpam", "scoreDadosPessoais", "justificativa"],
};

interface ResultadoAnalise {
  scoreOfensivo: number;
  scoreSpam: number;
  scoreDadosPessoais: number;
  justificativa: string;
}

function montarPrompt(texto: string) {
  return `Você é o sistema de moderação de comentários do Reclame Cidade, uma plataforma de reclamações urbanas por município.

Analise o comentário abaixo e avalie, de 0 a 1, o quanto ele apresenta:
- scoreOfensivo: linguagem ofensiva, discurso de ódio ou ataque pessoal.
- scoreSpam: propaganda, spam ou conteúdo sem relação com uma discussão real.
- scoreDadosPessoais: exposição de dados pessoais de terceiros (CPF, telefone, endereço residencial, acusação nominal a um indivíduo específico).

Comentário: "${texto}"

Responda apenas com o JSON solicitado. Justificativa com até 200 caracteres.`;
}

// Comentário é conteúdo bem mais curto e de menor risco que uma
// reclamação inteira - moderação mais leve (3 eixos, decisão binária,
// sem fila de revisão prévia à publicação), mas ainda passa pelo mesmo
// pipeline de auditoria (LogModeracao) que o resto do projeto usa.
export async function moderarComentario(
  comentarioId: string,
  texto: string
): Promise<"APROVAR" | "REPROVAR"> {
  const inicio = Date.now();

  let analise: ResultadoAnalise;
  let resultadoJson: string;
  let latenciaMs: number;
  let tokensEntrada: number | undefined;
  let tokensSaida: number | undefined;

  try {
    const resposta = await gerarConteudoComRetry({
      model: MODELO,
      contents: montarPrompt(texto),
      config: {
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA,
      },
    });

    latenciaMs = Date.now() - inicio;
    if (!resposta.text) {
      throw new Error("Resposta vazia do modelo de moderação.");
    }

    analise = JSON.parse(resposta.text);
    resultadoJson = resposta.text;
    tokensEntrada = resposta.usageMetadata?.promptTokenCount;
    tokensSaida = resposta.usageMetadata?.candidatesTokenCount;
  } catch (erro) {
    // Falha na IA mesmo depois do retry erra pro lado de REPROVAR, não
    // aprovar - fica oculto até um moderador revisar em
    // /moderacao/comentarios, em vez de publicar sem moderação nenhuma
    // e sem nenhum registro de auditoria.
    console.error("Falha na moderação de comentário:", erro);
    await prisma.logModeracao.create({
      data: {
        alvoTipo: "COMENTARIO",
        alvoId: comentarioId,
        provedor: "google",
        modelo: MODELO,
        versaoPrompt: VERSAO_PROMPT,
        decisao: "REPROVAR",
        scoreGeral: 1,
        justificativa: "Falha ao consultar o modelo de moderação (ver logs do servidor).",
        resultadoJson: "{}",
        latenciaMs: Date.now() - inicio,
      },
    });
    return "REPROVAR";
  }

  const scoreGeral = Math.max(
    analise.scoreOfensivo,
    analise.scoreSpam,
    analise.scoreDadosPessoais
  );
  const decisao = scoreGeral >= LIMIAR_REPROVACAO ? "REPROVAR" : "APROVAR";

  await prisma.logModeracao.create({
    data: {
      alvoTipo: "COMENTARIO",
      alvoId: comentarioId,
      provedor: "google",
      modelo: MODELO,
      versaoPrompt: VERSAO_PROMPT,
      decisao,
      scoreGeral,
      scoreOfensivo: analise.scoreOfensivo,
      scoreSpam: analise.scoreSpam,
      scoreDadosPessoais: analise.scoreDadosPessoais,
      justificativa: analise.justificativa,
      resultadoJson,
      latenciaMs,
      tokensEntrada,
      tokensSaida,
    },
  });

  return decisao;
}
