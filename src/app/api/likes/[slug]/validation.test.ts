import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock getBlogPosts so tests don't depend on the real filesystem layout.
vi.mock("@/app/blog/utils/getBlogPosts", () => ({
  getBlogPosts: () => [
    { slug: "webnn-image-classification", title: "t", date: "2026-01-01", description: "", tags: [] },
    { slug: "n8n-ollama-news-digest", title: "t", date: "2026-01-01", description: "", tags: [] },
  ],
}));

import {
  RATE_LIMIT_MAX_REQUESTS,
  __resetValidSlugsCacheForTesting,
  evaluateRateLimit,
  extractClientIp,
  isSlugFormatValid,
  isValidSlug,
} from "./validation";

describe("isSlugFormatValid", () => {
  it("accepts a typical kebab-case slug", () => {
    expect(isSlugFormatValid("webnn-image-classification")).toBe(true);
  });

  it("accepts digits", () => {
    expect(isSlugFormatValid("post-2026")).toBe(true);
  });

  it("rejects path traversal", () => {
    expect(isSlugFormatValid("../../etc/passwd")).toBe(false);
  });

  it("rejects uppercase letters", () => {
    expect(isSlugFormatValid("Foo")).toBe(false);
  });

  it("rejects empty string", () => {
    expect(isSlugFormatValid("")).toBe(false);
  });

  it("rejects whitespace", () => {
    expect(isSlugFormatValid("foo bar")).toBe(false);
  });

  it("rejects forward slash", () => {
    expect(isSlugFormatValid("foo/bar")).toBe(false);
  });

  it("rejects underscores", () => {
    expect(isSlugFormatValid("foo_bar")).toBe(false);
  });

  it("rejects dots", () => {
    expect(isSlugFormatValid("foo.bar")).toBe(false);
  });
});

describe("isValidSlug (format + whitelist)", () => {
  beforeEach(() => {
    __resetValidSlugsCacheForTesting();
  });

  it("accepts a slug that exists in published posts", () => {
    expect(isValidSlug("webnn-image-classification")).toBe(true);
  });

  it("rejects a format-valid slug that is not published", () => {
    expect(isValidSlug("nonexistent-post")).toBe(false);
  });

  it("rejects format-invalid slugs even if they would otherwise look familiar", () => {
    expect(isValidSlug("Webnn-image-classification")).toBe(false);
    expect(isValidSlug("../webnn-image-classification")).toBe(false);
  });
});

describe("evaluateRateLimit", () => {
  it("allows requests up to the limit", () => {
    const r = evaluateRateLimit(RATE_LIMIT_MAX_REQUESTS, 30, 1_000_000);
    expect(r.allowed).toBe(true);
    expect(r.resetAt).toBe(1_000_000 + 30_000);
  });

  it("denies once the count exceeds the limit", () => {
    const r = evaluateRateLimit(RATE_LIMIT_MAX_REQUESTS + 1, 15, 2_000_000);
    expect(r.allowed).toBe(false);
    expect(r.resetAt).toBe(2_000_000 + 15_000);
  });

  it("clamps negative ttl to 0 in the resetAt calculation", () => {
    const r = evaluateRateLimit(1, -5, 5_000_000);
    expect(r.allowed).toBe(true);
    expect(r.resetAt).toBe(5_000_000);
  });
});

describe("extractClientIp", () => {
  it("returns 'unknown' when header is missing", () => {
    expect(extractClientIp(null)).toBe("unknown");
    expect(extractClientIp(undefined)).toBe("unknown");
    expect(extractClientIp("")).toBe("unknown");
  });

  it("returns the first IP when comma-separated", () => {
    expect(extractClientIp("203.0.113.1, 70.41.3.18, 150.172.238.178")).toBe("203.0.113.1");
  });

  it("trims whitespace", () => {
    expect(extractClientIp("  203.0.113.1  ")).toBe("203.0.113.1");
  });

  it("returns 'unknown' for whitespace-only first segment", () => {
    expect(extractClientIp(" , 70.41.3.18")).toBe("unknown");
  });
});

describe("constants", () => {
  it("exposes the rate-limit max requests constant", () => {
    expect(RATE_LIMIT_MAX_REQUESTS).toBe(30);
  });
});

describe("module isolation", () => {
  // Ensure mock leakage doesn't affect later imports.
  afterEach(() => {
    vi.resetModules();
  });

  it("memoizes the slug set after first call", async () => {
    const mod = await import("./validation");
    mod.__resetValidSlugsCacheForTesting();
    const a = mod.getValidSlugs();
    const b = mod.getValidSlugs();
    expect(a).toBe(b);
  });
});
