import { put } from "@vercel/blob";

export async function uploadImagem(
  buffer: Buffer,
  {
    reclamacaoId,
    nomeArquivo,
    mimeType,
  }: { reclamacaoId: string; nomeArquivo: string; mimeType: string }
): Promise<string> {
  const blob = await put(`reclamacoes/${reclamacaoId}/${nomeArquivo}`, buffer, {
    access: "public",
    contentType: mimeType,
    addRandomSuffix: true,
  });

  return blob.url;
}
