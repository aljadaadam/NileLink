const windowMs = 15 * 60 * 1000; // 15 minutes

const hits = new Map<string, { count: number; resetAt: number }>();

// Cleanup expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, val] of hits) {
    if (now > val.resetAt) hits.delete(key);
  }
}, 5 * 60 * 1000);

export function rateLimit(
  key: string,
  maxAttempts: number
): { limited: boolean; remaining: number } {
  const now = Date.now();
  const entry = hits.get(key);

  if (!entry || now > entry.resetAt) {
    hits.set(key, { count: 1, resetAt: now + windowMs });
    return { limited: false, remaining: maxAttempts - 1 };
  }

  entry.count++;
  if (entry.count > maxAttempts) {
    return { limited: true, remaining: 0 };
  }

  return { limited: false, remaining: maxAttempts - entry.count };
}
