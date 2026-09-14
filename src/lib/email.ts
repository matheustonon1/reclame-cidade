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

function montarUrl(caminho: string) {
  return `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}${caminho}`;
}

// Sem RESEND_API_KEY configurada, o e-mail fica no log do servidor (útil
// em dev sem depender de provedor). Com a chave, envia de verdade - a
// assinatura não muda, então quem chama não precisa saber qual dos dois.
// Falha no provedor não pode travar o fluxo que chamou isto, só loga.
async function enviarEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.log(`[email] "${subject}" para ${to} (Resend não configurado, corpo abaixo)`);
    console.log(html);
    return;
  }

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL ?? "Reclame Cidade <onboarding@resend.dev>",
      to,
      subject,
      html,
    });

    if (error) {
      console.error(`Falha ao enviar e-mail ("${subject}"):`, error);
    }
  } catch (erro) {
    console.error(`Falha ao enviar e-mail ("${subject}"):`, erro);
  }
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

export async function enviarEmailVerificacao({
  email,
  token,
}: {
  email: string;
  token: string;
}) {
  const url = montarUrl(`/verificar-email/${token}`);
  await enviarEmail({
    to: email,
    subject: "Confirme seu e-mail — Reclame Cidade",
    html: montarHtmlVerificacao(url),
  });
}

function montarHtmlAcessoOrgao(url: string, nomeOrgao: string) {
  return `
    <div style="font-family: -apple-system, Helvetica, Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
      <h1 style="color: #1d4ed8; font-size: 20px;">Reclame Cidade</h1>
      <p style="color: #334155; font-size: 14px; line-height: 1.5;">
        Sua solicitação de acesso como <strong>${nomeOrgao}</strong> foi aprovada.
        Defina sua senha para começar a responder oficialmente às reclamações da sua cidade.
      </p>
      <a
        href="${url}"
        style="display: inline-block; background: #1d4ed8; color: #ffffff; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-size: 14px; margin: 8px 0;"
      >
        Definir minha senha
      </a>
      <p style="color: #94a3b8; font-size: 12px; margin-top: 24px;">
        Este link expira em 24 horas. Se você não reconhece esta solicitação, ignore este e-mail.
      </p>
    </div>
  `;
}

export async function enviarEmailAcessoOrgao({
  email,
  token,
  nomeOrgao,
}: {
  email: string;
  token: string;
  nomeOrgao: string;
}) {
  const url = montarUrl(`/orgao/definir-senha/${token}`);
  await enviarEmail({
    to: email,
    subject: "Acesso de órgão aprovado — Reclame Cidade",
    html: montarHtmlAcessoOrgao(url, nomeOrgao),
  });
}

function montarHtmlSolicitacaoRejeitada(motivo: string) {
  return `
    <div style="font-family: -apple-system, Helvetica, Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
      <h1 style="color: #1d4ed8; font-size: 20px;">Reclame Cidade</h1>
      <p style="color: #334155; font-size: 14px; line-height: 1.5;">
        Sua solicitação de acesso como órgão não foi aprovada.
      </p>
      <p style="color: #334155; font-size: 14px; line-height: 1.5;">
        <strong>Motivo:</strong> ${motivo}
      </p>
    </div>
  `;
}

export async function enviarEmailSolicitacaoRejeitada({
  email,
  motivo,
}: {
  email: string;
  motivo: string;
}) {
  await enviarEmail({
    to: email,
    subject: "Solicitação de acesso como órgão — Reclame Cidade",
    html: montarHtmlSolicitacaoRejeitada(motivo),
  });
}
