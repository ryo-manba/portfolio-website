const SAFE_URL_SCHEMES = ["http:", "https:", "mailto:"];

/**
 * Validate a URL for use in href/src attributes.
 *
 * - Returns relative URLs (starting with `/`, `./`, `../`, or `#`) as-is.
 * - Returns absolute URLs (parseable by `new URL`) only if their scheme is one
 *   of the allowed schemes (`http:`, `https:`, `mailto:`).
 * - Returns `undefined` for unsafe schemes (e.g., `javascript:`, `data:`,
 *   `vbscript:`) and for empty/undefined input.
 */
export function sanitizeUrl(url: string | undefined): string | undefined {
  if (!url) return undefined;
  const trimmed = url.trim();
  if (!trimmed) return undefined;

  // Relative URLs are allowed as-is.
  if (
    trimmed.startsWith("/") ||
    trimmed.startsWith("#") ||
    trimmed.startsWith("./") ||
    trimmed.startsWith("../")
  ) {
    return trimmed;
  }

  // Try to parse as an absolute URL and validate the scheme.
  try {
    const parsed = new URL(trimmed);
    if (SAFE_URL_SCHEMES.includes(parsed.protocol)) {
      return parsed.toString();
    }
    return undefined;
  } catch {
    // Parse failed. If the input contains a colon, treat it as a malformed
    // URL with a scheme and reject; otherwise treat as a relative path.
    return trimmed.includes(":") ? undefined : trimmed;
  }
}

/**
 * Validate a URL for use in `<img src>`. Currently delegates to `sanitizeUrl`
 * to reject `data:`/`javascript:`/`vbscript:` URLs.
 */
export function sanitizeImageUrl(url: string | undefined): string | undefined {
  return sanitizeUrl(url);
}
