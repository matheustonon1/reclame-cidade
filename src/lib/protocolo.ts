import { prisma } from "@/lib/prisma";

export async function gerarProtocolo(): Promise<string> {
  const ano = new Date().getFullYear();
  const prefixo = `RC-${ano}-`;

  // Baseado no maior número já existente, não na contagem de linhas - uma
  // reclamação apagada (ex.: dado de teste) deixa um "buraco" na sequência,
  // e contar linhas geraria um número que já existe.
  const ultima = await prisma.reclamacao.findFirst({
    where: { protocolo: { startsWith: prefixo } },
    orderBy: { protocolo: "desc" },
    select: { protocolo: true },
  });

  const ultimoNumero = ultima
    ? parseInt(ultima.protocolo.slice(prefixo.length), 10)
    : 0;
  const sequencial = String(ultimoNumero + 1).padStart(7, "0");
  return `${prefixo}${sequencial}`;
}
