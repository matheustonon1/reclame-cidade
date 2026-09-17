import { describe, expect, it } from "vitest";
import { generate } from "otplib";

import {
  cifrarSegredoTotp,
  codigoTotpValido,
  decifrarSegredoTotp,
  gerarCodigosBackup,
  gerarSegredoTotp,
  gerarUriTotp,
} from "./totp";

describe("cifrarSegredoTotp / decifrarSegredoTotp", () => {
  it("recupera o segredo original depois de cifrar", () => {
    const segredo = gerarSegredoTotp();
    expect(decifrarSegredoTotp(cifrarSegredoTotp(segredo))).toBe(segredo);
  });

  it("gera saídas diferentes pro mesmo segredo (IV aleatório)", () => {
    const segredo = gerarSegredoTotp();
    expect(cifrarSegredoTotp(segredo)).not.toBe(cifrarSegredoTotp(segredo));
  });
});

describe("gerarUriTotp", () => {
  it("inclui o e-mail e o emissor na URI", () => {
    const uri = gerarUriTotp("usuario@example.com", "SEGREDO123");
    expect(uri).toMatch(/^otpauth:\/\/totp\//);
    expect(uri).toContain(encodeURIComponent("usuario@example.com"));
    expect(uri).toContain("Urban%20Grid");
  });
});

describe("codigoTotpValido", () => {
  it("aceita um código gerado com o segredo correto", async () => {
    const segredo = gerarSegredoTotp();
    const codigo = await generate({ secret: segredo });
    expect(await codigoTotpValido(segredo, codigo)).toBe(true);
  });

  it("rejeita um código incorreto", async () => {
    const segredo = gerarSegredoTotp();
    const codigoValido = await generate({ secret: segredo });
    const codigoErrado = ((Number(codigoValido) + 1) % 1_000_000)
      .toString()
      .padStart(6, "0");

    expect(await codigoTotpValido(segredo, codigoErrado)).toBe(false);
  });

  it("rejeita um código gerado com outro segredo", async () => {
    const segredoA = gerarSegredoTotp();
    const segredoB = gerarSegredoTotp();
    const codigoDeB = await generate({ secret: segredoB });

    expect(await codigoTotpValido(segredoA, codigoDeB)).toBe(false);
  });
});

describe("gerarCodigosBackup", () => {
  it("gera 8 códigos únicos", () => {
    const codigos = gerarCodigosBackup();
    expect(codigos).toHaveLength(8);
    expect(new Set(codigos).size).toBe(8);
  });
});
