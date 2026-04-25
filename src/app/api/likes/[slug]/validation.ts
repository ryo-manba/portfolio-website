import { getBlogPosts } from "@/app/blog/utils/getBlogPosts";

export const SLUG_PATTERN = /^[a-z0-9-]+$/;

export function isSlugFormatValid(slug: string): boolean {
  return SLUG_PATTERN.test(slug);
}

let validSlugsCache: Set<string> | null = null;

export function getValidSlugs(): Set<string> {
  if (!validSlugsCache) {
    validSlugsCache = new Set(getBlogPosts().map((p) => p.slug));
  }
  return validSlugsCache;
}

export function __resetValidSlugsCacheForTesting(): void {
  validSlugsCache = null;
}

export function isValidSlug(slug: string): boolean {
  return isSlugFormatValid(slug) && getValidSlugs().has(slug);
}

export const RATE_LIMIT_WINDOW_SECONDS = 60;
export const RATE_LIMIT_MAX_REQUESTS = 30;

export function evaluateRateLimit(
  count: number,
  ttlSeconds: number,
  now: number = Date.now(),
): { allowed: boolean; resetAt: number } {
  return {
    allowed: count <= RATE_LIMIT_MAX_REQUESTS,
    resetAt: now + Math.max(ttlSeconds, 0) * 1000,
  };
}

export function extractClientIp(forwardedFor: string | null | undefined): string {
  if (!forwardedFor) return "unknown";
  const first = forwardedFor.split(",")[0]?.trim();
  return first && first.length > 0 ? first : "unknown";
}
