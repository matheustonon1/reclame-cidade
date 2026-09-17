import { TermosConteudo } from "@/components/termos-conteudo";
import { containerPagina } from "@/lib/estilos";

export default function TermosPage() {
  return (
    <main className={`${containerPagina} max-w-2xl`}>
      <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
        Termos de Uso e Política de Privacidade
      </h1>

      <TermosConteudo />
    </main>
  );
}
