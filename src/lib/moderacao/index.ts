import { Type } from "@google/genai";

import { prisma } from "@/lib/prisma";
import { criarNotificacao } from "@/lib/notificacoes";

import { getGeminiClient } from "./gemini";

const MODELO = "gemini-3.6-flash";
const VERSAO_PROMPT = "v2";

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    scoreOfensivo: { type: Type.NUMBER },
    scoreSpam: { type: Type.NUMBER },
    scoreDadosPessoais: { type: Type.NUMBER },
    scoreForaEscopo: { type: Type.NUMBER },
    scoreDesinformacao: { type: Type.NUMBER },
    scoreImagemImpropria: { type: Type.NUMBER },
    coerenciaTextoImagem: { type: Type.NUMBER },
    regioesSensiveis: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          midiaIndice: { type: Type.INTEGER },
          ymin: { type: Type.NUMBER },
          xmin: { type: Type.NUMBER },
          ymax: { type: Type.NUMBER },
          xmax: { type: Type.NUMBER },
        },
        required: ["midiaIndice", "ymin", "xmin", "ymax", "xmax"],
      },
    },
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

interface RegiaoAnalise {
  midiaIndice: number;
  ymin: number;
  xmin: number;
  ymax: number;
  xmax: number;
}

interface ResultadoAnalise {
  scoreOfensivo: number;
  scoreSpam: number;
  scoreDadosPessoais: number;
  scoreForaEscopo: number;
  scoreDesinformacao: number;
  scoreImagemImpropria?: number;
  coerenciaTextoImagem?: number;
  regioesSensiveis?: RegiaoAnalise[];
  justificativa: string;
}

function montarPrompt(
  titulo: string,
  descricao: string,
  categoria: string,
  quantidadeImagens: number
) {
  const instrucaoImagens =
    quantidadeImagens > 0
      ? `
Além do texto, ${quantidadeImagens} imagem(ns) foram anexadas, nesta ordem (índice 0 a ${quantidadeImagens - 1}). Para cada imagem, avalie:

- scoreImagemImpropria: conteúdo impróprio na imagem (nudez, violência gráfica, etc.) — use o maior valor entre todas as imagens.
- coerenciaTextoImagem: de 0 a 1, o quanto a(s) imagem(ns) realmente mostra(m) o problema descrito no texto (1 = totalmente coerente).
- regioesSensiveis: para cada rosto de pessoa ou placa veicular legível encontrado em qualquer imagem, retorne a caixa delimitadora normalizada (ymin, xmin, ymax, xmax, escala 0-1000) e o índice da imagem correspondente (midiaIndice). Retorne uma entrada por rosto/placa encontrado, mesmo que haja vários na mesma imagem. Se nenhum rosto ou placa for encontrado, retorne uma lista vazia.`
      : `
Nenhuma imagem foi anexada — retorne scoreImagemImpropria: 0, coerenciaTextoImagem: 1 e regioesSensiveis: [].`;

  return `Você é o sistema de moderação de conteúdo do Reclame Cidade, uma plataforma de reclamações urbanas por município.

Analise o título, a descrição e (se houver) as imagens de uma reclamação e avalie, em uma escala de 0 a 1, o quanto o conteúdo apresenta cada um destes problemas:

- scoreOfensivo: conteúdo ofensivo, discurso de ódio ou linguagem abusiva no texto.
- scoreSpam: propaganda, spam ou conteúdo sem relação com uma reclamação real.
- scoreDadosPessoais: exposição de dados pessoais de terceiros (CPF, telefone, endereço residencial de uma pessoa específica, acusação nominal a um indivíduo). NÃO conte o endereço do próprio problema relatado (rua, bairro) como dado pessoal.
- scoreForaEscopo: assunto fora do escopo de problemas urbanos/infraestrutura municipal. Categoria informada: "${categoria}".
- scoreDesinformacao: indícios de conteúdo pouco confiável — linguagem sensacionalista, alegações amplas não verificáveis, incoerências internas no texto. Você não tem como confirmar se o fato relatado é verdadeiro; avalie apenas indícios de baixa confiabilidade do relato, nunca a veracidade do problema em si.
${instrucaoImagens}

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

export async function moderarReclamacao(
  reclamacaoId: string,
  imagens: { buffer: Buffer; mimeType: string }[] = [],
  opcoes: { possivelReposicao?: boolean } = {}
) {
  const reclamacao = await prisma.reclamacao.findUniqueOrThrow({
    where: { id: reclamacaoId },
    include: { categoria: true },
  });

  const inicio = Date.now();

  const contents = [
    montarPrompt(
      reclamacao.titulo,
      reclamacao.descricao,
      reclamacao.categoria.nome,
      imagens.length
    ),
    ...imagens.map((imagem) => ({
      inlineData: {
        data: imagem.buffer.toString("base64"),
        mimeType: imagem.mimeType,
      },
    })),
  ];

  const resposta = await gerarConteudoComRetry({
    model: MODELO,
    contents,
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
  const scoreImagemImpropria = analise.scoreImagemImpropria ?? 0;
  const coerenciaTextoImagem = analise.coerenciaTextoImagem ?? 1;
  const regioesSensiveis = analise.regioesSensiveis ?? [];

  const scoreGeral = Math.max(
    analise.scoreOfensivo,
    analise.scoreSpam,
    analise.scoreDadosPessoais,
    analise.scoreForaEscopo,
    analise.scoreDesinformacao,
    scoreImagemImpropria,
    1 - coerenciaTextoImagem
  );

  // scoreOfensivo grava o maior entre o eixo de texto e o de imagem — não
  // existe coluna separada pra "imagem imprópria" no schema, e é
  // semanticamente o mesmo eixo (bloquear por conteúdo impróprio),
  // só que agora informado por texto ou por imagem.
  const scoreOfensivoFinal = Math.max(analise.scoreOfensivo, scoreImagemImpropria);

  let decisao = decidir(scoreGeral);
  // Pré-checagem determinística (phash de repostagem) pode forçar revisão
  // humana mesmo quando a análise por IA sozinha aprovaria — reposição não
  // deve auto-rejeitar (pode ser um segundo relato legítimo do mesmo
  // problema), só levantar a suspeita para um humano decidir.
  if (opcoes.possivelReposicao && decisao === "APROVAR") {
    decisao = "ENCAMINHAR_REVISAO";
  }

  await prisma.logModeracao.create({
    data: {
      alvoTipo: "RECLAMACAO",
      alvoId: reclamacao.id,
      provedor: "google",
      modelo: MODELO,
      versaoPrompt: VERSAO_PROMPT,
      decisao,
      scoreGeral,
      scoreOfensivo: scoreOfensivoFinal,
      scoreSpam: analise.scoreSpam,
      scoreDadosPessoais: analise.scoreDadosPessoais,
      scoreForaEscopo: analise.scoreForaEscopo,
      scoreDesinformacao: analise.scoreDesinformacao,
      coerenciaTextoImagem: imagens.length > 0 ? coerenciaTextoImagem : null,
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
    await criarNotificacao({
      userId: reclamacao.autorId,
      tipo: "RECLAMACAO_PUBLICADA",
      titulo: "Reclamação publicada",
      mensagem: `Sua reclamação "${reclamacao.titulo}" foi publicada.`,
      reclamacaoId: reclamacao.id,
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
    await criarNotificacao({
      userId: reclamacao.autorId,
      tipo: "RECLAMACAO_REJEITADA",
      titulo: "Reclamação rejeitada",
      mensagem: `Sua reclamação "${reclamacao.titulo}" foi rejeitada: ${analise.justificativa}`,
      reclamacaoId: reclamacao.id,
    });
  } else {
    await prisma.reclamacao.update({
      where: { id: reclamacao.id },
      data: { status: "AGUARDANDO_REVISAO", scoreModeracao: scoreGeral },
    });
  }

  // statusModeracao de cada Midia espelha a decisão final — uma chamada
  // multimodal combinada por reclamação, não uma análise por imagem.
  if (imagens.length > 0) {
    const statusMidia =
      decisao === "APROVAR"
        ? "APROVADO"
        : decisao === "REPROVAR"
          ? "REPROVADO"
          : "REVISAO_HUMANA";
    await prisma.midia.updateMany({
      where: { reclamacaoId: reclamacao.id },
      data: { statusModeracao: statusMidia },
    });
  }

  return { decisao, regioesSensiveis };
}
