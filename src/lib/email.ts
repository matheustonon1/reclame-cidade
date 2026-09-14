import { randomBytes } from "crypto";

import { Resend } from "resend";

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

function montarHtmlVerificacao(url: string) {
  return `
    <div style="font-family: -apple-system, Helvetica, Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
      <h1 style="color: #1d4ed8; font-size: 20px;">Reclame Cidade</h1>
      <p style="color: #334155; font-size: 14px; line-height: 1.5;">
        Confirme seu e-mail para ativar sua conta e poder confirmar ou denunciar reclamações.
      </p>
      <a
        href="${url}"
        style="display: inline-block; background: #1d4ed8; color: #ffffff; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-size: 14px; margin: 8px 0;"
      >
        Verificar e-mail
      </a>
      <p style="color: #94a3b8; font-size: 12px; margin-top: 24px;">
        Se você não criou uma conta no Reclame Cidade, ignore este e-mail.
      </p>
    </div>
  `;
}

// Sem RESEND_API_KEY configurada, o link fica no log do servidor (útil
// em dev sem depender de provedor). Com a chave, envia de verdade - a
// assinatura não muda, então quem chama não precisa saber qual dos dois.
export async function enviarEmailVerificacao({
  email,
  token,
}: {
  email: string;
  token: string;
}) {
  const url = `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/verificar-email/${token}`;

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.log(`[email] Verificação de e-mail para ${email}: ${url}`);
    return;
  }

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL ?? "Reclame Cidade <onboarding@resend.dev>",
      to: email,
      subject: "Confirme seu e-mail — Reclame Cidade",
      html: montarHtmlVerificacao(url),
    });

    if (error) {
      // Falha no provedor não pode travar o cadastro - mesma postura já
      // adotada no projeto pra outros serviços externos indisponíveis.
      console.error("Falha ao enviar e-mail de verificação:", error);
    }
  } catch (erro) {
    console.error("Falha ao enviar e-mail de verificação:", erro);
  }
}
