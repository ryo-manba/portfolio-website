import { describe, expect, it } from "vitest";
import { resolveDescription } from "./resolveDescription";

describe("resolveDescription", () => {
  it("uses the frontmatter description when provided", () => {
    expect(resolveDescription("手書きの説明文。", "本文の冒頭テキスト。")).toBe("手書きの説明文。");
  });

  it("falls back to a content excerpt when description is missing", () => {
    expect(resolveDescription(undefined, "本文の冒頭テキスト。")).toBe("本文の冒頭テキスト。");
  });

  it("falls back to a content excerpt when description is blank", () => {
    expect(resolveDescription("   ", "本文の冒頭テキスト。")).toBe("本文の冒頭テキスト。");
  });
});
