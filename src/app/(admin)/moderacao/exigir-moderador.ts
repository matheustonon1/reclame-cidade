import { redirect } from "next/navigation";

import { auth } from "@/auth";

export async function exigirModerador() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.papel !== "MODERADOR" && session.user.papel !== "ADMIN") {
    redirect("/painel");
  }

  return session;
}
