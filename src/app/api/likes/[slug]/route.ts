import { redis } from "@/lib/redis";
import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "./rateLimit";
import {
  RATE_LIMIT_WINDOW_SECONDS,
  extractClientIp,
  isValidSlug,
} from "./validation";

type Params = { params: Promise<{ slug: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  const { slug } = await params;
  if (!isValidSlug(slug)) {
    return NextResponse.json({ error: "invalid slug" }, { status: 400 });
  }
  const count = (await redis.get<number>(`likes:${slug}`)) ?? 0;
  return NextResponse.json({ count });
}

export async function POST(request: NextRequest, { params }: Params) {
  const { slug } = await params;

  if (!isValidSlug(slug)) {
    return NextResponse.json({ error: "invalid slug" }, { status: 400 });
  }

  const ip = extractClientIp(request.headers.get("x-forwarded-for"));

  let rateLimit: { allowed: boolean; resetAt: number };
  try {
    rateLimit = await checkRateLimit(ip);
  } catch {
    return NextResponse.json(
      { error: "likes temporarily unavailable" },
      { status: 503, headers: { "Retry-After": String(RATE_LIMIT_WINDOW_SECONDS) } },
    );
  }
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
