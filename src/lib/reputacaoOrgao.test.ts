import { describe, expect, it } from "vitest";

import { classificarIndice } from "./reputacaoOrgao";

describe("classificarIndice", () => {
  it("marca como 'Poucos dados ainda' quando não há índice", () => {
    expect(classificarIndice(null, 0)).toEqual(
      expect.objectContaining({ label: "Poucos dados ainda" })
    );
  });

  it("marca como 'Poucos dados ainda' com amostra pequena, mesmo com índice alto", () => {
    expect(classificarIndice(100, 1)).toEqual(
      expect.objectContaining({ label: "Poucos dados ainda" })
    );
  });

  it("classifica 80% ou mais como Ótimo", () => {
    expect(classificarIndice(80, 10)).toEqual(expect.objectContaining({ label: "Ótimo" }));
    expect(classificarIndice(100, 10)).toEqual(expect.objectContaining({ label: "Ótimo" }));
  });

  it("classifica entre 60% e 79% como Bom", () => {
    expect(classificarIndice(60, 10)).toEqual(expect.objectContaining({ label: "Bom" }));
    expect(classificarIndice(79, 10)).toEqual(expect.objectContaining({ label: "Bom" }));
  });

  it("classifica entre 40% e 59% como Regular", () => {
    expect(classificarIndice(40, 10)).toEqual(expect.objectContaining({ label: "Regular" }));
    expect(classificarIndice(59, 10)).toEqual(expect.objectContaining({ label: "Regular" }));
  });

  it("classifica abaixo de 40% como Ruim", () => {
    expect(classificarIndice(0, 10)).toEqual(expect.objectContaining({ label: "Ruim" }));
    expect(classificarIndice(39, 10)).toEqual(expect.objectContaining({ label: "Ruim" }));
  });
});
