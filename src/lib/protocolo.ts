import { prisma } from "@/lib/prisma";

export async function gerarProtocolo(): Promise<string> {
  const ano = new Date().getFullYear();
  const prefixo = `RC-${ano}-`;

  const quantidade = await prisma.reclamacao.count({
    where: { protocolo: { startsWith: prefixo } },
  });

  const sequencial = String(quantidade + 1).padStart(7, "0");
  return `${prefixo}${sequencial}`;
}
