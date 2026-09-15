"use server";

import { AuthError } from "next-auth";
import bcrypt from "bcryptjs";

import { signIn } from "@/auth";
import { buscarUsuarioPorIdentificador } from "@/lib/identificador";
import { usuarioBloqueadoPorLogin } from "@/lib/loginSeguranca";

export type LoginFormState =
  | {
      erro?: string;
      etapaTotp?: boolean;
      identificador?: string;
    }
  | undefined;

export async function login(
  _state: LoginFormState,
  formData: FormData
): Promise<LoginFormState> {
  const identificador = formData.get("identificador");
  const senha = formData.get("senha");
  const codigoTotp = formData.get("codigoTotp");

  if (typeof identificador !== "string" || typeof senha !== "string") {
    return { erro: "Informe e-mail/CPF e senha." };
  }
  if (identificador.length > 254 || senha.length > 100) {
    return { erro: "E-mail/CPF ou senha inválidos." };
  }

  const usuario = await buscarUsuarioPorIdentificador(identificador);
  if (usuario?.banidoAte && usuario.banidoAte > new Date()) {
    return { erro: "Esta conta está suspensa." };
  }
  if (usuario && usuarioBloqueadoPorLogin(usuario)) {
    return {
      erro: "Muitas tentativas de login incorretas. Aguarde alguns minutos e tente novamente.",
    };
  }

  // Pré-checagem só de UX: mostra o campo de código antes de tentar,
  // pra não fazer o usuário digitar a senha de novo. Quem realmente
  // barra o login sem 2FA válido é o authorize() em auth.ts. Só decide
  // isso depois de confirmar a senha - senão dá pra descobrir se uma
  // conta existe e tem 2FA ativado testando identificadores com senha
  // errada, sem nunca precisar acertá-la (enumeração de conta).
  const senhaValida =
    !!usuario?.senhaHash && (await bcrypt.compare(senha, usuario.senhaHash));
  const precisaTotp = senhaValida && !!usuario?.totpConfirmadoEm;
  if (precisaTotp && (typeof codigoTotp !== "string" || codigoTotp.trim() === "")) {
    return { identificador, etapaTotp: true };
  }

  try {
    await signIn("credentials", {
      identificador,
      senha,
      codigoTotp: typeof codigoTotp === "string" ? codigoTotp : undefined,
      redirectTo: "/painel",
    });
  } catch (erro) {
    if (erro instanceof AuthError) {
      return {
        erro: precisaTotp
          ? "E-mail/CPF, senha ou código inválidos."
          : "E-mail/CPF ou senha inválidos.",
        identificador,
        etapaTotp: precisaTotp,
      };
    }
    throw erro;
  }
}
