import { redirect } from "next/navigation";

import { auth } from "@/auth";

import { sair } from "./actions";

export default async function PainelPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
      <h1 className="text-2xl font-bold">Painel</h1>
      <p>
        Logado como <strong>{session.user.email}</strong> (
        {session.user.papel})
      </p>
      <form action={sair}>
        <button type="submit" className="rounded bg-black px-3 py-2 text-white">
          Sair
        </button>
      </form>
    </main>
  );
}
