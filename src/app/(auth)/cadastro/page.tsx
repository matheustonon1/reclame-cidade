import { CadastroTipoSwitch } from "@/components/cadastro-tipo-switch";

export default async function CadastroPage({
  searchParams,
}: PageProps<"/cadastro">) {
  const { tipo } = await searchParams;
  const tipoInicial = tipo === "orgao" ? "orgao" : "pessoa";

  return (
    <main className="animate-fade-in flex flex-1 flex-col items-center justify-center gap-6 p-8">
      <CadastroTipoSwitch tipoInicial={tipoInicial} />
    </main>
  );
}
