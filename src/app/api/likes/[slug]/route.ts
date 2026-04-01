import { redis } from "@/lib/redis";
import { NextRequest, NextResponse } from "next/server";

type Params = { params: { slug: string } };

export async function GET(_request: NextRequest, { params }: Params) {
  const { slug } = params;
  const count = (await redis.get<number>(`likes:${slug}`)) ?? 0;
  return NextResponse.json({ count });
}

export async function POST(_request: NextRequest, { params }: Params) {
  const { slug } = params;
  const count = await redis.incr(`likes:${slug}`);
  return NextResponse.json({ count });
}
