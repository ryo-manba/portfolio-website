import { redis } from "@/lib/redis";
import { NextRequest, NextResponse } from "next/server";
import {
  RATE_LIMIT_WINDOW_SECONDS,
  evaluateRateLimit,
  extractClientIp,
  isValidSlug,
} from "./validation";

type Params = { params: { slug: string } };

async function checkRateLimit(ip: string): Promise<{ allowed: boolean; resetAt: number }> {
  const key = `ratelimit:likes:${ip}`;
  const count = await redis.incr(key);
  if (count === 1) {
    await redis.expire(key, RATE_LIMIT_WINDOW_SECONDS);
  }
  const ttl = await redis.ttl(key);
  return evaluateRateLimit(count, ttl);
}

export async function GET(_request: NextRequest, { params }: Params) {
  const { slug } = params;
  if (!isValidSlug(slug)) {
    return NextResponse.json({ error: "invalid slug" }, { status: 400 });
  }
  const count = (await redis.get<number>(`likes:${slug}`)) ?? 0;
  return NextResponse.json({ count });
}

export async function POST(request: NextRequest, { params }: Params) {
  const { slug } = params;

  if (!isValidSlug(slug)) {
    return NextResponse.json({ error: "invalid slug" }, { status: 400 });
  }

  const ip = extractClientIp(request.headers.get("x-forwarded-for"));

  const rateLimit = await checkRateLimit(ip);
  if (!rateLimit.allowed) {
    const retryAfter = Math.max(1, Math.ceil((rateLimit.resetAt - Date.now()) / 1000));
    return NextResponse.json(
      { error: "rate limit exceeded" },
      { status: 429, headers: { "Retry-After": String(retryAfter) } },
    );
  }

  const count = await redis.incr(`likes:${slug}`);
  return NextResponse.json({ count });
}
