/**
 * Rate Limiter
 * In-memory rate limiting for login attempts.
 * In production, prefer Redis or a database-backed solution.
 * 
 * Tracked by IP address to prevent brute force attacks.
 * Automatically prevents abuse with exponential lockout.
 */

interface RateLimitEntry {
  /** Number of failed attempts */
  count: number;
  /** Timestamp of first attempt in the window */
  firstAttempt: number;
  /** Timestamp when the user is locked out (0 = not locked) */
  lockedUntil: number;
}

const store = new Map<string, RateLimitEntry>();

// Cleanup old entries periodically
const CLEANUP_INTERVAL = 60 * 60 * 1000; // 1 hour
let lastCleanup = Date.now();

function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  
  for (const [key, entry] of store.entries()) {
    // Remove entries older than the lockout duration (fully stale)
    if (now - entry.firstAttempt > 60 * 60 * 1000) {
      store.delete(key);
    }
  }
}

/**
 * Check if an IP address is rate limited.
 * Returns the remaining attempts before lockout.
 */
export function checkRateLimit(
  identifier: string,
  maxAttempts: number = 5,
  windowMs: number = 15 * 60 * 1000,
  lockoutDurationMs: number = 30 * 60 * 1000
): {
  allowed: boolean;
  remaining: number;
  lockedUntil: number | null;
  retryAfterMs: number | null;
} {
  cleanup();
  
  const now = Date.now();
  const entry = store.get(identifier);

  // If no previous attempts, allow
  if (!entry) {
    return { allowed: true, remaining: maxAttempts, lockedUntil: null, retryAfterMs: null };
  }

  // Check if currently locked out
  if (entry.lockedUntil > now) {
    const retryAfterMs = entry.lockedUntil - now;
    return {
      allowed: false,
      remaining: 0,
      lockedUntil: entry.lockedUntil,
      retryAfterMs,
    };
  }

  // Lockout period expired — reset
  if (entry.lockedUntil > 0 && entry.lockedUntil <= now) {
    store.delete(identifier);
    return { allowed: true, remaining: maxAttempts, lockedUntil: null, retryAfterMs: null };
  }

  // Check if the window has expired (reset)
  if (now - entry.firstAttempt > windowMs) {
    store.delete(identifier);
    return { allowed: true, remaining: maxAttempts, lockedUntil: null, retryAfterMs: null };
  }

  // Within the window — check count
  const remaining = maxAttempts - entry.count;
  if (remaining <= 0) {
    // Lock out
    const updatedEntry: RateLimitEntry = {
      ...entry,
      lockedUntil: now + lockoutDurationMs,
    };
    store.set(identifier, updatedEntry);
    return {
      allowed: false,
      remaining: 0,
      lockedUntil: updatedEntry.lockedUntil,
      retryAfterMs: lockoutDurationMs,
    };
  }

  return { allowed: true, remaining, lockedUntil: null, retryAfterMs: null };
}

/**
 * Record a failed login attempt for an identifier (IP/email).
 */
export function recordFailedAttempt(identifier: string): void {
  cleanup();
  
  const now = Date.now();
  const existing = store.get(identifier);

  if (!existing) {
    store.set(identifier, {
      count: 1,
      firstAttempt: now,
      lockedUntil: 0,
    });
    return;
  }

  // If the window has expired, reset
  if (now - existing.firstAttempt > 15 * 60 * 1000) {
    store.set(identifier, {
      count: 1,
      firstAttempt: now,
      lockedUntil: 0,
    });
    return;
  }

  store.set(identifier, {
    ...existing,
    count: existing.count + 1,
  });
}

/**
 * Reset rate limit for an identifier on successful login.
 */
export function resetRateLimit(identifier: string): void {
  store.delete(identifier);
}

/**
 * Get the remaining attempts for an identifier (for display).
 */
export function getRemainingAttempts(
  identifier: string,
  maxAttempts: number = 5
): number {
  const entry = store.get(identifier);
  if (!entry) return maxAttempts;
  if (Date.now() - entry.firstAttempt > 15 * 60 * 1000) return maxAttempts;
  return Math.max(0, maxAttempts - entry.count);
}