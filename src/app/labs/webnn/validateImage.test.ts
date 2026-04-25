import { describe, expect, it } from "vitest";
import { IMAGE_VALIDATION_LIMITS, validateImageFile } from "./validateImage";

const PNG_MAGIC = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
const JPEG_MAGIC = [0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01];
const GIF_MAGIC = [0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x01, 0x00, 0x01, 0x00, 0x00, 0x00];
// "RIFF" + 4 bytes file size + "WEBP"
const WEBP_MAGIC = [0x52, 0x49, 0x46, 0x46, 0x24, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50];

function makeFile(bytes: number[], name: string, type: string): File {
  return new File([new Uint8Array(bytes)], name, { type });
}

describe("validateImageFile", () => {
  it("accepts a valid PNG", async () => {
    const file = makeFile(PNG_MAGIC, "test.png", "image/png");
    const result = await validateImageFile(file);
    expect(result).toEqual({ ok: true });
  });

  it("accepts a valid JPEG", async () => {
    const file = makeFile(JPEG_MAGIC, "test.jpg", "image/jpeg");
    const result = await validateImageFile(file);
    expect(result).toEqual({ ok: true });
  });

  it("accepts a valid GIF", async () => {
    const file = makeFile(GIF_MAGIC, "test.gif", "image/gif");
    const result = await validateImageFile(file);
    expect(result).toEqual({ ok: true });
  });

  it("accepts a valid WebP", async () => {
    const file = makeFile(WEBP_MAGIC, "test.webp", "image/webp");
    const result = await validateImageFile(file);
    expect(result).toEqual({ ok: true });
  });

  it("rejects SVG with text/xml as unsupported MIME", async () => {
    const svgBytes = Array.from(new TextEncoder().encode("<svg xmlns='...'></svg>"));
    const file = makeFile(svgBytes, "evil.svg", "text/xml");
    const result = await validateImageFile(file);
    expect(result).toEqual({ ok: false, error: "unsupported-mime" });
  });

  it("rejects image/svg+xml as unsupported MIME", async () => {
    const svgBytes = Array.from(new TextEncoder().encode("<svg xmlns='...'></svg>"));
    const file = makeFile(svgBytes, "evil.svg", "image/svg+xml");
    const result = await validateImageFile(file);
    expect(result).toEqual({ ok: false, error: "unsupported-mime" });
  });

  it("rejects PNG MIME but plain text body as magic-byte-mismatch", async () => {
    const textBytes = Array.from(new TextEncoder().encode("not a real png file body"));
    const file = makeFile(textBytes, "fake.png", "image/png");
    const result = await validateImageFile(file);
    expect(result).toEqual({ ok: false, error: "magic-byte-mismatch" });
  });

  it("rejects files larger than 10MB as too-large", async () => {
    const oversize = IMAGE_VALIDATION_LIMITS.maxFileSize + 1;
    // Build a sparse file efficiently: just allocate one big Uint8Array
    const big = new Uint8Array(oversize);
    big[0] = 0x89;
    big[1] = 0x50;
    big[2] = 0x4e;
    big[3] = 0x47;
    const file = new File([big], "big.png", { type: "image/png" });
    const result = await validateImageFile(file);
    expect(result).toEqual({ ok: false, error: "too-large" });
  });

  it("rejects application/octet-stream as unsupported MIME", async () => {
    const file = makeFile(PNG_MAGIC, "blob.bin", "application/octet-stream");
    const result = await validateImageFile(file);
    expect(result).toEqual({ ok: false, error: "unsupported-mime" });
  });
});
