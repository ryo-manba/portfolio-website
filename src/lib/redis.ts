import { Redis } from "@upstash/redis";

function createNoopRedis(): Redis {
  return new Proxy({} as Redis, {
    get(_target, prop) {
      return async (...args: unknown[]) => {
        console.debug(`[redis:noop] ${String(prop)}`, ...args);
        return null;
      };
    },
  });
}

const hasUpstashCredentials =
  Boolean(process.env.UPSTASH_REDIS_REST_URL) && Boolean(process.env.UPSTASH_REDIS_REST_TOKEN);

export const redis = hasUpstashCredentials
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL as string,
      token: process.env.UPSTASH_REDIS_REST_TOKEN as string,
    })
  : createNoopRedis();
