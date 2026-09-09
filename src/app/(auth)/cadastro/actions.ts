"use server";

import { Prisma } from "@prisma/client";
import { AuthError } from "next-auth";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";
import { signIn } from "@/auth";
import { hashCpf } from "@/lib/cpf";
import { criarTokenVerificacao, enviarEmailVerificacao } from "@/lib/email";

import { CadastroSchema, type CadastroFormState } from "./definitions";

export async function cadastrar(
  _state: CadastroFormState,
  formData: FormData
): Promise<CadastroFormState> {
  const validado = CadastroSchema.safeParse({
    nome: formData.get("nome"),
    email: formData.get("email"),
    cpf: formData.get("cpf"),
    senha: formData.get("senha"),
    confirmarSenha: formData.get("confirmarSenha"),
  });

  if (!validado.success) {
    return { erros: validado.error.flatten().fieldErrors };
  }

  const { nome, email, cpf, senha } = validado.data;
  const senhaHash = await bcrypt.hash(senha, 10);
  const cpfHash = hashCpf(cpf);

  try {
    await prisma.user.create({
      data: { name: nome, email, cpfHash, senhaHash, papel: "CIDADAO" },
    });
  } catch (erro) {
    if (
      erro instanceof Prisma.PrismaClientKnownRequestError &&
      erro.code === "P2002"
    ) {
      // No MySQL, `meta.target` vem como o nome do índice (string), não
      // como array de colunas (isso muda por provider no Prisma) — por
      // isso a checagem cobre os dois formatos.
      const alvo = erro.meta?.target;
      const colidiuComCpf = Array.isArray(alvo)
        ? alvo.includes("cpfHash")
        : typeof alvo === "string" && alvo.toLowerCase().includes("cpf");

      if (colidiuComCpf) {
        return { erros: { cpf: ["Já existe uma conta com este CPF."] } };
      }
      return { erros: { email: ["Já existe uma conta com este e-mail."] } };
    }
    throw erro;
  }

  const token = await criarTokenVerificacao(email);
  await enviarEmailVerificacao({ email, token });

  try {
    await signIn("credentials", {
      identificador: email,
      senha,
      redirectTo: "/painel",
    });
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
