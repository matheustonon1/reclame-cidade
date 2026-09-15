import { prisma } from "@/lib/prisma";

// Contador de força bruta na SENHA - separado do de TOTP (lib/totp.ts),
// que só entra em jogo depois que a senha já foi aceita. Sem isto, uma
// conta sem 2FA ativo podia ter a senha testada indefinidamente (o
// bcrypt.compare atrasa cada tentativa, mas não impede um script
// paciente ou distribuído).
const LIMITE_TENTATIVAS = 5;
const BLOQUEIO_MS = 15 * 60 * 1000;

export function usuarioBloqueadoPorLogin(usuario: {
  loginBloqueadoAte: Date | null;
}): boolean {
  return !!usuario.loginBloqueadoAte && usuario.loginBloqueadoAte > new Date();
}

// Incremento atômico (Prisma `increment`), não leitura-depois-escrita -
// mesmo motivo do equivalente em totp.ts: tentativas concorrentes não
// podem pisar uma na outra e mascarar o total real de tentativas.
export async function registrarFalhaLogin(userId: string) {
  const usuario = await prisma.user.update({
    where: { id: userId },
    data: { loginTentativasFalhas: { increment: 1 } },
    select: { loginTentativasFalhas: true },
  });

  if (usuario.loginTentativasFalhas >= LIMITE_TENTATIVAS) {
    await prisma.user.update({
      where: { id: userId },
      data: { loginTentativasFalhas: 0, loginBloqueadoAte: new Date(Date.now() + BLOQUEIO_MS) },
    });
  }
}

export async function resetarFalhasLogin(userId: string) {
  await prisma.user.update({
    where: { id: userId },
    data: { loginTentativasFalhas: 0, loginBloqueadoAte: null },
  });
}
