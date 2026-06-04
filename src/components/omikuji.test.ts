import { describe, expect, it } from "vitest";
import { OMIKUJI_CARDS, pickRandomOmikuji } from "./omikuji-utils";

describe("OMIKUJI_CARDS", () => {
  it("contains exactly 6 cards", () => {
    expect(OMIKUJI_CARDS).toHaveLength(6);
  });

  it("weights sum to 1.0", () => {
    const total = OMIKUJI_CARDS.reduce((sum, c) => sum + c.weight, 0);
    expect(total).toBeCloseTo(1.0, 10);
  });

  it("has unique keys", () => {
    const keys = OMIKUJI_CARDS.map((c) => c.key);
    expect(new Set(keys).size).toBe(6);
  });

  it("each card has a label, src, and positive weight", () => {
    for (const card of OMIKUJI_CARDS) {
      expect(card.label.length).toBeGreaterThan(0);
      expect(card.src).toMatch(/^\/assets\/omikuji\/.+\.png$/);
      expect(card.weight).toBeGreaterThan(0);
    }
  });
});

describe("pickRandomOmikuji", () => {
  it("returns daikichi for random 0.0", () => {
    expect(pickRandomOmikuji(() => 0.0).key).toBe("daikichi");
  });

  it("returns daikichi for random just under 0.3", () => {
    expect(pickRandomOmikuji(() => 0.29999).key).toBe("daikichi");
  });

  it("returns chu-kichi for random 0.3", () => {
    expect(pickRandomOmikuji(() => 0.3).key).toBe("chu-kichi");
  });

  it("returns sho-kichi for random 0.5", () => {
    expect(pickRandomOmikuji(() => 0.5).key).toBe("sho-kichi");
  });

  it("returns kichi for random 0.7", () => {
    expect(pickRandomOmikuji(() => 0.7).key).toBe("kichi");
  });

  it("returns kyo for random 0.85", () => {
    expect(pickRandomOmikuji(() => 0.85).key).toBe("kyo");
  });

  it("returns daikyo for random 0.95", () => {
    expect(pickRandomOmikuji(() => 0.95).key).toBe("daikyo");
  });

  it("returns daikyo for random just under 1.0 (floating point safety)", () => {
    expect(pickRandomOmikuji(() => 0.999999).key).toBe("daikyo");
  });

  it("uses Math.random by default and returns one of the defined cards", () => {
    const result = pickRandomOmikuji();
    expect(OMIKUJI_CARDS).toContainEqual(result);
  });
});
