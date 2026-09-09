"use server";

import { redirect } from "next/navigation";
import sharp from "sharp";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { moderarReclamacao } from "@/lib/moderacao";
import { gerarProtocolo } from "@/lib/protocolo";
import { uploadImagem } from "@/lib/storage";
import { aplicarBlur, calcularPhash, distanciaHamming, extrairExif } from "@/lib/imagem";

import { NovaReclamacaoSchema, type NovaReclamacaoFormState } from "./definitions";

const MAX_IMAGENS = 5;
const MAX_TAMANHO_BYTES = 5 * 1024 * 1024;
const TIPOS_ACEITOS = ["image/jpeg", "image/png", "image/webp"];
const DISTANCIA_REPOSTAGEM = 8;

export async function criarReclamacao(
  _state: NovaReclamacaoFormState,
  formData: FormData
): Promise<NovaReclamacaoFormState> {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const validado = NovaReclamacaoSchema.safeParse({
    titulo: formData.get("titulo"),
    descricao: formData.get("descricao"),
    categoriaId: formData.get("categoriaId") ?? "",
    cidadeId: formData.get("cidadeId") ?? "",
    endereco: formData.get("endereco"),
    bairro: formData.get("bairro"),
    referencia: formData.get("referencia"),
    cep: formData.get("cep"),
  });

  if (!validado.success) {
    return { erros: validado.error.flatten().fieldErrors };
  }

  const arquivos = formData
    .getAll("imagens")
    .filter((valor): valor is File => valor instanceof File && valor.size > 0);

  if (arquivos.length > MAX_IMAGENS) {
    return { mensagem: `Envie no máximo ${MAX_IMAGENS} imagens.` };
  }
  for (const arquivo of arquivos) {
    if (!TIPOS_ACEITOS.includes(arquivo.type)) {
      return { mensagem: "As imagens devem ser JPEG, PNG ou WebP." };
    }
    if (arquivo.size > MAX_TAMANHO_BYTES) {
      return { mensagem: "Cada imagem deve ter no máximo 5MB." };
    }
  }

  const { titulo, descricao, categoriaId, cidadeId, endereco, bairro, referencia, cep } =
    validado.data;

  const protocolo = await gerarProtocolo();

  const bairroRegistro = await prisma.bairro.upsert({
    where: { cidadeId_nome: { cidadeId, nome: bairro } },
    update: {},
    create: { cidadeId, nome: bairro },
  });

  const reclamacao = await prisma.reclamacao.create({
    data: {
      protocolo,
      titulo,
      descricao,
      autorId: session.user.id,
      categoriaId,
      cidadeId,
      bairroId: bairroRegistro.id,
      endereco,
      referencia: referencia || null,
      cep,
    },
  });

  const midiasCriadas: {
    id: string;
    buffer: Buffer;
    larguraPx: number;
    alturaPx: number;
  }[] = [];

  let possivelReposicao = false;

  try {
    const phashesExistentes =
      arquivos.length > 0
        ? (
            await prisma.midia.findMany({
              where: { reclamacaoId: { not: reclamacao.id }, phash: { not: null } },
              select: { phash: true },
            })
          ).map((midia) => midia.phash!)
        : [];

    for (const [ordem, arquivo] of arquivos.entries()) {
      const buffer = Buffer.from(await arquivo.arrayBuffer());
      const metadados = await sharp(buffer).metadata();
      const [phash, exif] = await Promise.all([
        calcularPhash(buffer),
        extrairExif(buffer),
      ]);

      if (
        phashesExistentes.some(
          (phashExistente) => distanciaHamming(phash, phashExistente) <= DISTANCIA_REPOSTAGEM
        )
      ) {
        possivelReposicao = true;
      }

      const url = await uploadImagem(buffer, {
        reclamacaoId: reclamacao.id,
        nomeArquivo: arquivo.name,
        mimeType: arquivo.type,
      });

      const midia = await prisma.midia.create({
        data: {
          reclamacaoId: reclamacao.id,
          url,
          tipo: "IMAGEM",
          nomeArquivo: arquivo.name,
          mimeType: arquivo.type,
          tamanhoBytes: arquivo.size,
          larguraPx: metadados.width,
          alturaPx: metadados.height,
          phash,
          exifJson: exif.exifJson,
          capturadaEm: exif.capturadaEm,
          ordem,
        },
      });

      midiasCriadas.push({
        id: midia.id,
        buffer,
        larguraPx: metadados.width ?? 0,
        alturaPx: metadados.height ?? 0,
      });
    }

    const { regioesSensiveis } = await moderarReclamacao(
      reclamacao.id,
      midiasCriadas.map((midia, indice) => ({
        buffer: midia.buffer,
        mimeType: arquivos[indice].type,
      })),
      { possivelReposicao }
    );

    const regioesPorMidia = new Map<number, typeof regioesSensiveis>();
    for (const regiao of regioesSensiveis) {
      const lista = regioesPorMidia.get(regiao.midiaIndice) ?? [];
      lista.push(regiao);
      regioesPorMidia.set(regiao.midiaIndice, lista);
    }

    for (const [indice, midia] of midiasCriadas.entries()) {
      const regioes = regioesPorMidia.get(indice);
      if (!regioes || regioes.length === 0) continue;

      const bufferTratado = await aplicarBlur(
        midia.buffer,
        midia.larguraPx,
        midia.alturaPx,
        regioes
      );
      const urlTratada = await uploadImagem(bufferTratado, {
        reclamacaoId: reclamacao.id,
        nomeArquivo: `tratada-${arquivos[indice].name}`,
        mimeType: arquivos[indice].type,
      });

      await prisma.midia.update({
        where: { id: midia.id },
        data: { urlTratada },
      });
    }
  } catch (erro) {
    console.error("Falha na moderação automática:", erro);
  }

  redirect(`/reclamacoes/${reclamacao.protocolo}`);
}
