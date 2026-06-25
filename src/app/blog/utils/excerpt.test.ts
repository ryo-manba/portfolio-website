import { describe, expect, it } from "vitest";
import { excerpt } from "./excerpt";

describe("excerpt", () => {
  it("returns a plain paragraph as-is when within the limit", () => {
    expect(excerpt("これはテスト用の本文です。")).toBe("これはテスト用の本文です。");
  });

  it("keeps link text and drops the URL", () => {
    expect(excerpt("最近読んだ[本](https://example.com/very-long-url)が面白かった。")).toBe(
      "最近読んだ本が面白かった。",
    );
  });

  it("strips markdown emphasis and heading markers", () => {
    expect(excerpt("**太字**と普通の文。")).toBe("太字と普通の文。");
  });

  it("separates headings from body text with a full-width space", () => {
    expect(excerpt("導入の段落。\n\n## 見出し\n\n本文の段落。")).toBe(
      "導入の段落。　見出し　本文の段落。",
    );
  });

  it("uses a full-width space before a leading heading", () => {
    expect(excerpt("## 見出し\n\n本文の段落。")).toBe("見出し　本文の段落。");
  });

  it("excludes fenced code blocks", () => {
    const md = "導入の段落。\n\n```python\nprint('hello')\n```\n\n次の段落。";
    expect(excerpt(md)).toBe("導入の段落。 次の段落。");
  });

  it("separates block-level elements with a single space", () => {
    expect(excerpt("段落1。\n\n段落2。")).toBe("段落1。 段落2。");
  });

  it("does not insert spaces around inline elements within a paragraph", () => {
    expect(excerpt("これは**太字**を含む文。")).toBe("これは太字を含む文。");
  });

  it("truncates with an ellipsis when exceeding maxLength", () => {
    expect(excerpt("0123456789abcdefghij", 10)).toBe("0123456789…");
  });

  it("does not append an ellipsis when exactly at maxLength", () => {
    expect(excerpt("0123456789", 10)).toBe("0123456789");
  });

  it("returns an empty string for content with no text", () => {
    expect(excerpt("```\ncode only\n```")).toBe("");
  });
});
