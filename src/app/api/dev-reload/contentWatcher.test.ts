import { describe, expect, it } from "vitest";
import { isRelevantContentFile } from "./contentWatcher";

describe("isRelevantContentFile", () => {
  it("returns true for a .mdx filename", () => {
    expect(isRelevantContentFile("my-post.mdx")).toBe(true);
  });

  it("returns true for a .mdx file in a nested path", () => {
    expect(isRelevantContentFile("nested/my-post.mdx")).toBe(true);
  });

  it("returns false for non-mdx files", () => {
    expect(isRelevantContentFile("notes.txt")).toBe(false);
    expect(isRelevantContentFile("image.png")).toBe(false);
  });

  it("returns false for null (fs.watch may pass null filename)", () => {
    expect(isRelevantContentFile(null)).toBe(false);
  });
});
