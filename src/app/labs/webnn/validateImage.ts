const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export type ImageValidationError = "too-large" | "unsupported-mime" | "magic-byte-mismatch";

export type ImageValidationResult = { ok: true } | { ok: false; error: ImageValidationError };

export async function validateImageFile(file: File): Promise<ImageValidationResult> {
  if (file.size > MAX_FILE_SIZE) {
    return { ok: false, error: "too-large" };
  }
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return { ok: false, error: "unsupported-mime" };
  }
  // マジックバイトを読んで MIME と整合するか確認
  const header = await readFirstBytes(file, 12);
  if (!matchesMagicBytes(header, file.type)) {
    return { ok: false, error: "magic-byte-mismatch" };
  }
  return { ok: true };
}

async function readFirstBytes(file: File, n: number): Promise<Uint8Array> {
  const slice = file.slice(0, n);
  const buf = await slice.arrayBuffer();
  return new Uint8Array(buf);
}

function matchesMagicBytes(header: Uint8Array, mime: string): boolean {
  switch (mime) {
    case "image/jpeg":
      return header[0] === 0xff && header[1] === 0xd8 && header[2] === 0xff;
    case "image/png":
      return (
        header[0] === 0x89 &&
        header[1] === 0x50 &&
        header[2] === 0x4e &&
        header[3] === 0x47 &&
        header[4] === 0x0d &&
        header[5] === 0x0a &&
        header[6] === 0x1a &&
        header[7] === 0x0a
      );
    case "image/gif":
      // "GIF8" — covers GIF87a and GIF89a
      return header[0] === 0x47 && header[1] === 0x49 && header[2] === 0x46 && header[3] === 0x38;
    case "image/webp":
      // RIFF....WEBP
      return (
        header[0] === 0x52 &&
        header[1] === 0x49 &&
        header[2] === 0x46 &&
        header[3] === 0x46 &&
        header[8] === 0x57 &&
        header[9] === 0x45 &&
        header[10] === 0x42 &&
        header[11] === 0x50
      );
    default:
      return false;
  }
}

export const IMAGE_VALIDATION_LIMITS = {
  maxFileSize: MAX_FILE_SIZE,
  allowedMimeTypes: Array.from(ALLOWED_MIME_TYPES),
};
