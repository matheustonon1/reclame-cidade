"use server";

import { AuthError } from "next-auth";
import { redirect } from "next/navigation";

import { signIn } from "@/auth";

export async function login(formData: FormData) {
  try {
    await signIn("credentials", {
      identificador: formData.get("identificador"),
      senha: formData.get("senha"),
      redirectTo: "/painel",
    });
  } catch (erro) {
    if (erro instanceof AuthError) {
      redirect("/login?erro=credenciais");
    }
    throw erro;
  }
}
