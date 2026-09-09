import { randomBytes } from "crypto";

import { prisma } from "@/lib/prisma";

const VALIDADE_TOKEN_MS = 24 * 60 * 60 * 1000;

export async function criarTokenVerificacao(email: string): Promise<string> {
  await prisma.verificationToken.deleteMany({ where: { identifier: email } });

  const token = randomBytes(32).toString("hex");
  await prisma.verificationToken.create({
    data: {
      identifier: email,
      token,
      expires: new Date(Date.now() + VALIDADE_TOKEN_MS),
    },
  });

  return token;
}

// Sem provedor de e-mail configurado ainda: o link fica no log do
// servidor. Para ativar envio real (Resend, SMTP, etc.), troque o corpo
// desta função por uma chamada à API do provedor — a assinatura já foi
// pensada para isso, quem chama não precisa mudar.
export async function enviarEmailVerificacao({
  email,
  token,
}: {
  email: string;
  token: string;
}) {
  const url = `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/verificar-email/${token}`;

  console.log(
    `[email] Verificação de e-mail para ${email}: ${url}`
  );
}
