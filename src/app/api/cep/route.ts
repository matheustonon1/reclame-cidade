import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

interface RespostaViaCep {
  erro?: boolean;
  logradouro?: string;
  bairro?: string;
  ibge?: string;
}

export async function GET(request: NextRequest) {
  const cep = (request.nextUrl.searchParams.get("cep") ?? "").replace(/\D/g, "");

  if (!/^\d{8}$/.test(cep)) {
    return NextResponse.json({ erro: true }, { status: 400 });
  }

  let dados: RespostaViaCep;
  try {
    const resposta = await fetch(`https://viacep.com.br/ws/${cep}/json/`, {
      signal: AbortSignal.timeout(8000),
    });
    if (!resposta.ok) {
      return NextResponse.json({ erro: true }, { status: 502 });
    }
    dados = await resposta.json();
  } catch {
    return NextResponse.json({ erro: true }, { status: 502 });
  }

  if (dados.erro) {
    return NextResponse.json({ erro: true });
  }

  const cidade = dados.ibge
    ? await prisma.cidade.findUnique({
        where: { codigoIbge: dados.ibge },
        select: { id: true, nome: true, estado: { select: { uf: true } } },
      })
    : null;

  return NextResponse.json({
    logradouro: dados.logradouro ?? "",
    bairro: dados.bairro ?? "",
    cidade: cidade
      ? { id: cidade.id, nome: cidade.nome, uf: cidade.estado.uf }
      : null,
  });
}
