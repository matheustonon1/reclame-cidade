import { redirect } from "next/navigation";

export default function SolicitarOrgaoPage() {
  redirect("/cadastro?tipo=orgao");
}
