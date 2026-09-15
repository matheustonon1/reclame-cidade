"use server";

import { AuthError } from "next-auth";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";
import { signIn } from "@/auth";

import { DefinirSenhaSchema, type DefinirSenhaFormState } from "./definitions";

export async function definirSenhaOrgao(
  token: string,
  _state: DefinirSenhaFormState,
  formData: FormData
): Promise<DefinirSenhaFormState> {
  const validado = DefinirSenhaSchema.safeParse({
    senha: formData.get("senha"),
    confirmarSenha: formData.get("confirmarSenha"),
  });
  if (!validado.success) {
    return { erros: validado.error.flatten().fieldErrors };
  }

  const registro = await prisma.verificationToken.findUnique({ where: { token } });
  if (!registro || registro.expires <= new Date()) {
    return { mensagem: "Este link expirou. Peça pra um administrador reenviar o convite." };
  }

  const usuario = await prisma.user.findUnique({ where: { email: registro.identifier } });
  if (!usuario || usuario.papel !== "ORGAO" || usuario.senhaHash) {
    return { mensagem: "Este link já foi usado ou não é mais válido." };
  }

  const senhaHash = await bcrypt.hash(validado.data.senha, 10);

  // Diferente do token de verificação de e-mail, este é de uso único de
  // verdade (define a senha inicial) - apagar impede reaproveitar o
  // mesmo link depois.
  await prisma.$transaction([
    prisma.user.update({ where: { id: usuario.id }, data: { senhaHash } }),
    prisma.verificationToken.delete({ where: { token } }),
  ]);

  try {
    await signIn("credentials", {
      identificador: usuario.email,
      senha: validado.data.senha,
      redirectTo: "/orgao",
    });
  } catch (erro) {
    if (erro instanceof AuthError) {
      return { mensagem: "Senha definida! Faça login para continuar." };
    }
    throw erro;
  }
}
