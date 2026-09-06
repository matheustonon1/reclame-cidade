import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8">
      <h1 className="text-4xl font-bold">Reclame Cidade</h1>
      <p className="text-gray-500">Ambiente configurado com sucesso.</p>
      <Link href="/login" className="underline">
        Entrar
      </Link>
    </main>
  );
}