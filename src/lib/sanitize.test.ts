import { describe, expect, it } from "vitest";
import { sanitizeImageUrl, sanitizeUrl } from "./sanitize";

describe("sanitizeUrl", () => {
  it("allows https URLs", () => {
    expect(sanitizeUrl("https://example.com")).toBe("https://example.com/");
  });

  it("allows http URLs with paths", () => {
    expect(sanitizeUrl("http://example.com/path")).toBe("http://example.com/path");
  });

  it("allows mailto URLs", () => {
    expect(sanitizeUrl("mailto:foo@bar.com")).toBe("mailto:foo@bar.com");
  });

  it("rejects javascript: URLs", () => {
    expect(sanitizeUrl("javascript:alert(1)")).toBeUndefined();
  });

  it("rejects data: URLs", () => {
    expect(sanitizeUrl("data:text/html,<script>alert(1)</script>")).toBeUndefined();
  });

  it("rejects vbscript: URLs", () => {
    expect(sanitizeUrl("vbscript:msgbox(1)")).toBeUndefined();
  });

  it("allows root-relative URLs", () => {
    expect(sanitizeUrl("/blog/post")).toBe("/blog/post");
  });

  it("allows hash anchors", () => {
    expect(sanitizeUrl("#anchor")).toBe("#anchor");
  });

  it("allows ./relative paths", () => {
    expect(sanitizeUrl("./relative")).toBe("./relative");
  });

  it("returns undefined for undefined input", () => {
    expect(sanitizeUrl(undefined)).toBeUndefined();
  });

  it("returns undefined for empty string", () => {
    expect(sanitizeUrl("")).toBeUndefined();
  });

  it("returns undefined for whitespace-only string", () => {
    expect(sanitizeUrl("   ")).toBeUndefined();
  });

  it("rejects javascript: URLs with leading whitespace", () => {
    expect(sanitizeUrl("   javascript:alert(1)")).toBeUndefined();
  });

  it("allows ../relative paths", () => {
    expect(sanitizeUrl("../relative")).toBe("../relative");
  });
});

describe("sanitizeImageUrl", () => {
  it("allows https image URLs", () => {
    expect(sanitizeImageUrl("https://example.com/img.png")).toBe("https://example.com/img.png");
  });

  it("rejects javascript: URLs", () => {
    expect(sanitizeImageUrl("javascript:alert(1)")).toBeUndefined();
  });

  it("rejects data: image URLs", () => {
    expect(sanitizeImageUrl("data:image/png;base64,iVBOR")).toBeUndefined();
  });

  it("allows root-relative image paths", () => {
    expect(sanitizeImageUrl("/images/photo.jpg")).toBe("/images/photo.jpg");
  });
});
