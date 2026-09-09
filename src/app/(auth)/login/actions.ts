"use server";

import { AuthError } from "next-auth";
import { redirect } from "next/navigation";

import { signIn } from "@/auth";
import { buscarUsuarioPorIdentificador } from "@/lib/identificador";

export async function login(formData: FormData) {
  const identificador = formData.get("identificador");

  if (typeof identificador === "string") {
    const usuario = await buscarUsuarioPorIdentificador(identificador);
    if (usuario?.banidoAte && usuario.banidoAte > new Date()) {
      redirect("/login?erro=banido");
    }
  }

  try {
    await signIn("credentials", {
      identificador,
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
