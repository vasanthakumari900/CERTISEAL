interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();

/**
 * In-memory sliding window rate limiter for API endpoints.
 * @param key Identifier (e.g. IP or IP + endpoint)
 * @param maxHits Maximum permitted requests in window
 * @param windowMs Time window in milliseconds
 */
export function checkRateLimit(key: string, maxHits: number = 60, windowMs: number = 60000): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const record = rateLimitMap.get(key);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: maxHits - 1 };
  }

  if (record.count >= maxHits) {
    return { allowed: false, remaining: 0 };
  }

  record.count += 1;
  return { allowed: true, remaining: maxHits - record.count };
}
