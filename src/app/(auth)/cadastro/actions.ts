"use server";

import { Prisma } from "@prisma/client";
import { AuthError } from "next-auth";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";
import { signIn } from "@/auth";

import { CadastroSchema, type CadastroFormState } from "./definitions";

export async function cadastrar(
  _state: CadastroFormState,
  formData: FormData
): Promise<CadastroFormState> {
  const validado = CadastroSchema.safeParse({
    nome: formData.get("nome"),
    email: formData.get("email"),
    senha: formData.get("senha"),
    confirmarSenha: formData.get("confirmarSenha"),
  });

  if (!validado.success) {
    return { erros: validado.error.flatten().fieldErrors };
  }

  const { nome, email, senha } = validado.data;
  const senhaHash = await bcrypt.hash(senha, 10);

  try {
    await prisma.user.create({
      data: { name: nome, email, senhaHash, papel: "CIDADAO" },
    });
  } catch (erro) {
    if (
      erro instanceof Prisma.PrismaClientKnownRequestError &&
      erro.code === "P2002"
    ) {
      return { erros: { email: ["Já existe uma conta com este e-mail."] } };
    }
    throw erro;
  }

  try {
    await signIn("credentials", { email, senha, redirectTo: "/painel" });
  } catch (erro) {
    if (erro instanceof AuthError) {
      return {
        mensagem:
          "Conta criada, mas não foi possível entrar automaticamente. Faça login.",
      };
    }
    throw erro;
  }
}
