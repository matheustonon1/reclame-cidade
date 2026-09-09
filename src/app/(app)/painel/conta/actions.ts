"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

import { PerfilSchema, SenhaSchema, type PerfilFormState, type SenhaFormState } from "./definitions";

export async function atualizarPerfil(
  _state: PerfilFormState,
  formData: FormData
): Promise<PerfilFormState> {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const validado = PerfilSchema.safeParse({
    nome: formData.get("nome"),
    telefone: formData.get("telefone"),
  });
  if (!validado.success) {
    return { erros: validado.error.flatten().fieldErrors };
  }

  const { nome, telefone } = validado.data;

  await prisma.user.update({
    where: { id: session.user.id },
    data: { name: nome, telefone: telefone || null },
  });

  revalidatePath("/painel/conta");
  revalidatePath("/painel");

  return { mensagem: "Dados atualizados." };
}

export async function alterarSenha(
  _state: SenhaFormState,
  formData: FormData
): Promise<SenhaFormState> {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const validado = SenhaSchema.safeParse({
    senhaAtual: formData.get("senhaAtual"),
    novaSenha: formData.get("novaSenha"),
    confirmarNovaSenha: formData.get("confirmarNovaSenha"),
  });
  if (!validado.success) {
    return { erros: validado.error.flatten().fieldErrors };
  }

  const usuario = await prisma.user.findUnique({
    where: { id: session.user.id },
  });
  if (!usuario?.senhaHash) {
    return { mensagem: "Não foi possível alterar a senha." };
  }

  const senhaAtualValida = await bcrypt.compare(
    validado.data.senhaAtual,
    usuario.senhaHash
  );
  if (!senhaAtualValida) {
    return { erros: { senhaAtual: ["Senha atual incorreta."] } };
  }

  const novaSenhaHash = await bcrypt.hash(validado.data.novaSenha, 10);
  await prisma.user.update({
    where: { id: session.user.id },
    data: { senhaHash: novaSenhaHash },
  });

  return { mensagem: "Senha alterada com sucesso." };
}
