import { redirect } from "next/navigation";

import { auth } from "@/auth";

export async function exigirOrgao() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.papel !== "ORGAO" || !session.user.orgaoId) {
    redirect("/painel");
  }

  return session;
}
