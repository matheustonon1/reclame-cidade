import { describe, expect, it } from "vitest";

import { distanciaHamming } from "./imagem";

describe("distanciaHamming", () => {
  it("é zero para hashes idênticos", () => {
    expect(distanciaHamming("ff00", "ff00")).toBe(0);
  });

  it("conta os bits diferentes corretamente", () => {
    // 0xf = 1111, 0x0 = 0000 -> 4 bits diferentes
    expect(distanciaHamming("f", "0")).toBe(4);
    // 0xf = 1111, 0x7 = 0111 -> 1 bit diferente
    expect(distanciaHamming("f", "7")).toBe(1);
  });

  it("retorna um valor grande quando os hashes têm tamanhos diferentes", () => {
    expect(distanciaHamming("ff", "ffff")).toBeGreaterThan(1000);
  });
});
