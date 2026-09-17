"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";

import { exigirAdmin } from "../solicitacoes-orgao/exigir-admin";

export async function atualizarCategoriasOrgao(orgaoId: string, formData: FormData) {
  await exigirAdmin();

  const categoriaIds = formData.getAll("categoriaIds").filter((v): v is string => typeof v === "string");

  const orgao = await prisma.orgao.findUnique({ where: { id: orgaoId } });
  if (!orgao) return;

  await prisma.orgao.update({
    where: { id: orgaoId },
    data: { categorias: { set: categoriaIds.map((id) => ({ id })) } },
  });

  revalidatePath("/orgaos-categorias");
}
