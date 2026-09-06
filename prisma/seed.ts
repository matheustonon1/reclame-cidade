// ---------------------------------------------------------------------------
// Seed do banco: estados e municípios (API do IBGE), categorias e admin.
// Idempotente — usa upsert/skipDuplicates, pode rodar quantas vezes quiser.
// ---------------------------------------------------------------------------

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const IBGE_BASE = "https://servicodados.ibge.gov.br/api/v1/localidades";
const LOTE = 500;

interface EstadoIbge {
  id: number;
  sigla: string;
  nome: string;
}

interface MunicipioIbge {
  id: number;
  nome: string;
}

function slugify(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function emLotes<T>(itens: T[], tamanho: number): T[][] {
  const lotes: T[][] = [];
  for (let i = 0; i < itens.length; i += tamanho) {
    lotes.push(itens.slice(i, i + tamanho));
  }
  return lotes;
}

async function buscarJson<T>(url: string): Promise<T> {
  const resposta = await fetch(url);
  if (!resposta.ok) {
    throw new Error(`Falha ao buscar ${url}: ${resposta.status}`);
  }
  return resposta.json() as Promise<T>;
}

async function seedGeografia() {
  const estados = await buscarJson<EstadoIbge[]>(
    `${IBGE_BASE}/estados?orderBy=nome`
  );

  const estadoIdPorUf = new Map<string, string>();

  for (const estado of estados) {
    const registro = await prisma.estado.upsert({
      where: { uf: estado.sigla },
      update: { nome: estado.nome },
      create: { nome: estado.nome, uf: estado.sigla },
    });
    estadoIdPorUf.set(estado.sigla, registro.id);
  }

  console.log(`Estados: ${estados.length} carregados.`);

  let totalCidades = 0;

  for (const estado of estados) {
    const municipios = await buscarJson<MunicipioIbge[]>(
      `${IBGE_BASE}/estados/${estado.sigla}/municipios?orderBy=nome`
    );

    const estadoId = estadoIdPorUf.get(estado.sigla);
    if (!estadoId) continue;

    const dados = municipios.map((municipio) => ({
      nome: municipio.nome,
      slug: `${slugify(municipio.nome)}-${estado.sigla.toLowerCase()}`,
      codigoIbge: String(municipio.id),
      estadoId,
    }));

    for (const lote of emLotes(dados, LOTE)) {
      await prisma.cidade.createMany({ data: lote, skipDuplicates: true });
    }

    totalCidades += municipios.length;
  }

  console.log(`Cidades: ${totalCidades} carregadas.`);
}

const CATEGORIAS = [
  { nome: "Iluminação pública", icone: "lightbulb" },
  { nome: "Buracos e pavimentação", icone: "road" },
  { nome: "Coleta de lixo", icone: "trash-2" },
  { nome: "Saneamento e esgoto", icone: "droplet" },
  { nome: "Sinalização de trânsito", icone: "traffic-cone" },
  { nome: "Praças e áreas verdes", icone: "trees" },
  { nome: "Poluição sonora", icone: "volume-2" },
  { nome: "Poluição e queimadas", icone: "cloud" },
  { nome: "Transporte público", icone: "bus" },
  { nome: "Obras irregulares", icone: "hard-hat" },
  { nome: "Animais e zoonoses", icone: "dog" },
  { nome: "Segurança pública", icone: "shield" },
  { nome: "Acessibilidade", icone: "accessibility" },
  { nome: "Saúde pública", icone: "heart-pulse" },
  { nome: "Outros", icone: "more-horizontal" },
] as const;

async function seedCategorias() {
  for (const [ordem, categoria] of CATEGORIAS.entries()) {
    await prisma.categoria.upsert({
      where: { nome: categoria.nome },
      update: { icone: categoria.icone, ordem },
      create: {
        nome: categoria.nome,
        slug: slugify(categoria.nome),
        icone: categoria.icone,
        ordem,
      },
    });
  }

  console.log(`Categorias: ${CATEGORIAS.length} carregadas.`);
}

async function seedAdmin() {
  const email = process.env.SEED_ADMIN_EMAIL ?? "admin@reclamecidade.local";
  const senha = process.env.SEED_ADMIN_SENHA ?? "admin123";
  const senhaHash = await bcrypt.hash(senha, 10);

  await prisma.user.upsert({
    where: { email },
    update: { senhaHash, papel: "ADMIN" },
    create: {
      email,
      name: "Administrador",
      senhaHash,
      papel: "ADMIN",
      nivelVerificacao: "EMAIL",
    },
  });

  console.log(`Admin: ${email} pronto.`);
}

async function main() {
  await seedGeografia();
  await seedCategorias();
  await seedAdmin();
}

main()
  .catch((erro) => {
    console.error(erro);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
