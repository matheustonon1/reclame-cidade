import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const estadoId = request.nextUrl.searchParams.get("estadoId");
  if (!estadoId) {
    return NextResponse.json([]);
  }

  const cidades = await prisma.cidade.findMany({
    where: { estadoId },
    orderBy: { nome: "asc" },
    select: { id: true, nome: true },
  });

  return NextResponse.json(cidades);
}
