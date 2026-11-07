import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { evalScript, increment, get } = vi.hoisted(() => ({
  evalScript: vi.fn(),
  increment: vi.fn(),
  get: vi.fn(),
}));

vi.mock("@/lib/redis", () => ({ redis: { eval: evalScript, incr: increment, get } }));
vi.mock("@/app/blog/utils/getBlogPosts", () => ({
  getBlogPosts: () => [{ slug: "test-post" }],
}));

import { GET, POST } from "./route";

const params = { params: Promise.resolve({ slug: "test-post" }) };
const request = () => new NextRequest("https://example.com/api/likes/test-post", {
  method: "POST",
  headers: { "x-forwarded-for": "203.0.113.1" },
});

describe("likes API rate limiting", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    increment.mockResolvedValue(42);
  });

  it("checks the limit with one server-side script before writing a like", async () => {
    evalScript.mockResolvedValue([1, 60]);
    const response = await POST(request(), params);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ count: 42 });
    expect(evalScript).toHaveBeenCalledExactlyOnceWith(
      expect.any(String), ["ratelimit:likes:203.0.113.1"], [60],
    );
    expect(increment).toHaveBeenCalledExactlyOnceWith("likes:test-post");
  });

  it("allows the last request in the window", async () => {
    evalScript.mockResolvedValue([30, 15]);
    expect((await POST(request(), params)).status).toBe(200);
  });

  it("rejects excess requests without incrementing likes", async () => {
    evalScript.mockResolvedValue([31, 15]);
    const response = await POST(request(), params);
    expect(response.status).toBe(429);
    expect(Number(response.headers.get("Retry-After"))).toBeGreaterThan(0);
    expect(increment).not.toHaveBeenCalled();
  });

  it("fails closed during a Redis outage", async () => {
    evalScript.mockRejectedValue(new Error("network unavailable"));
    const response = await POST(request(), params);
    expect(response.status).toBe(503);
    expect(response.headers.get("Retry-After")).toBe("60");
    expect(increment).not.toHaveBeenCalled();
  });

  it.each([
    { result: null },
    { result: [1, -1] },
    { result: [0, 60] },
    { result: [1] },
    { result: ["1", 60] },
  ])(
    "fails closed for malformed limiter result $result",
    async ({ result }) => {
      evalScript.mockResolvedValue(result);
      expect((await POST(request(), params)).status).toBe(503);
      expect(increment).not.toHaveBeenCalled();
    },
  );

  it("rejects unpublished slugs before contacting Redis", async () => {
    const invalidParams = { params: Promise.resolve({ slug: "unpublished" }) };
    expect((await POST(request(), invalidParams)).status).toBe(400);
    expect((await GET(request(), invalidParams)).status).toBe(400);
    expect(evalScript).not.toHaveBeenCalled();
    expect(increment).not.toHaveBeenCalled();
    expect(get).not.toHaveBeenCalled();
  });
});
