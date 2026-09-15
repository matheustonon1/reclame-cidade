import { describe, expect, it } from "vitest";

import { decidir } from "./index";

describe("decidir", () => {
  it("aprova score baixo", () => {
    expect(decidir(0)).toBe("APROVAR");
    expect(decidir(0.39)).toBe("APROVAR");
  });

  it("encaminha para revisão na faixa intermediária", () => {
    expect(decidir(0.4)).toBe("ENCAMINHAR_REVISAO");
    expect(decidir(0.74)).toBe("ENCAMINHAR_REVISAO");
  });

  it("reprova score alto", () => {
    expect(decidir(0.75)).toBe("REPROVAR");
    expect(decidir(1)).toBe("REPROVAR");
  });
});
