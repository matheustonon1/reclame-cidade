"use client";

import { useState } from "react";

interface Estado {
  id: string;
  nome: string;
  uf: string;
}

interface Cidade {
  id: string;
  nome: string;
}

export function SeletorCidade({ estados }: { estados: Estado[] }) {
  const [estadoId, setEstadoId] = useState("");
  const [cidades, setCidades] = useState<Cidade[]>([]);
  const [carregando, setCarregando] = useState(false);

  async function handleEstadoChange(id: string) {
    setEstadoId(id);
    setCidades([]);

    if (!id) return;

    setCarregando(true);
    const resposta = await fetch(`/api/cidades?estadoId=${id}`);
    const dados: Cidade[] = await resposta.json();
    setCidades(dados);
    setCarregando(false);
  }

  return (
    <div className="flex gap-3">
      <select
        value={estadoId}
        onChange={(evento) => handleEstadoChange(evento.target.value)}
        className="rounded border px-3 py-2"
      >
        <option value="">Estado</option>
        {estados.map((estado) => (
          <option key={estado.id} value={estado.id}>
            {estado.uf}
          </option>
        ))}
      </select>

      <select
        name="cidadeId"
        required
        disabled={!estadoId || carregando}
        defaultValue=""
        className="flex-1 rounded border px-3 py-2"
      >
        <option value="" disabled>
          {carregando ? "Carregando..." : "Cidade"}
        </option>
        {cidades.map((cidade) => (
          <option key={cidade.id} value={cidade.id}>
            {cidade.nome}
          </option>
        ))}
      </select>
    </div>
  );
}
