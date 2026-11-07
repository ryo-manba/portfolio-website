import { redis } from "@/lib/redis";
import { RATE_LIMIT_WINDOW_SECONDS, evaluateRateLimit } from "./validation";

// Run increment and expiry together so a lost connection cannot leave a
// permanent counter. Also repair counters left without an expiry by old code.
export const RATE_LIMIT_SCRIPT = `
local count = redis.call("INCR", KEYS[1])
local ttl = redis.call("TTL", KEYS[1])
if ttl < 0 then
  redis.call("EXPIRE", KEYS[1], ARGV[1])
  ttl = tonumber(ARGV[1])
end
return {count, ttl}
`;

export async function checkRateLimit(ip: string): Promise<{ allowed: boolean; resetAt: number }> {
  const result = await redis.eval<[number], [number, number]>(
    RATE_LIMIT_SCRIPT,
    [`ratelimit:likes:${ip}`],
    [RATE_LIMIT_WINDOW_SECONDS],
  );

  if (
    !Array.isArray(result) ||
    result.length !== 2 ||
    !Number.isSafeInteger(result[0]) ||
    result[0] < 1 ||
    !Number.isSafeInteger(result[1]) ||
    result[1] < 0
  ) {
    throw new Error("Invalid rate limit response");
  }

  return evaluateRateLimit(result[0], result[1]);
}
