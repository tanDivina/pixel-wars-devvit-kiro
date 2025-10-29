import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RateLimiter, createPixelRateLimiter, createGeneralRateLimiter } from './rateLimiter';
import type { RedisClient } from '@devvit/web/server';

// Mock Redis client
const createMockRedis = (): RedisClient => {
  const sortedSets = new Map<string, Array<{ member: string; score: number }>>();

  return {
    zRemRangeByScore: vi.fn(async (key: string, min: number, max: number) => {
      const set = sortedSets.get(key) || [];
      const filtered = set.filter((item) => item.score < min || item.score > max);
      sortedSets.set(key, filtered);
      return filtered.length;
    }),
    zCard: vi.fn(async (key: string) => {
      const set = sortedSets.get(key) || [];
      return set.length;
    }),
    zRange: vi.fn(async (key: string, start: number, stop: number) => {
      const set = sortedSets.get(key) || [];
      const sorted = [...set].sort((a, b) => a.score - b.score);
      return sorted.slice(start, stop === -1 ? undefined : stop + 1);
    }),
    zAdd: vi.fn(async (key: string, items: { member: string; score: number } | Array<{ member: string; score: number }>) => {
      const set = sortedSets.get(key) || [];
      const itemsArray = Array.isArray(items) ? items : [items];
      set.push(...itemsArray);
      sortedSets.set(key, set);
      return itemsArray.length;
    }),
    expire: vi.fn(async () => true),
  } as any;
};

describe('RateLimiter', () => {
  let redis: RedisClient;
  let rateLimiter: RateLimiter;

  beforeEach(() => {
    redis = createMockRedis();
    rateLimiter = new RateLimiter(redis, {
      maxRequests: 5,
      windowMs: 60000,
      keyPrefix: 'test',
    });
  });

  describe('checkLimit', () => {
    it('should allow requests under the limit', async () => {
      const result = await rateLimiter.checkLimit('user1');
      expect(result.allowed).toBe(true);
      expect(result.retryAfter).toBeUndefined();
    });

    it('should block requests over the limit', async () => {
      // Make 5 requests (at the limit)
      for (let i = 0; i < 5; i++) {
        await rateLimiter.checkLimit('user1');
      }

      // 6th request should be blocked
      const result = await rateLimiter.checkLimit('user1');
      expect(result.allowed).toBe(false);
      expect(result.retryAfter).toBeDefined();
    });

    it('should track different users separately', async () => {
      // User1 makes 5 requests
      for (let i = 0; i < 5; i++) {
        await rateLimiter.checkLimit('user1');
      }

      // User2 should still be allowed
      const result = await rateLimiter.checkLimit('user2');
      expect(result.allowed).toBe(true);
    });

    it('should clean up old entries', async () => {
      const mockRedis = redis as any;
      
      // Verify zRemRangeByScore is called
      await rateLimiter.checkLimit('user1');
      expect(mockRedis.zRemRangeByScore).toHaveBeenCalled();
    });

    it('should set expiry on rate limit keys', async () => {
      const mockRedis = redis as any;
      
      await rateLimiter.checkLimit('user1');
      expect(mockRedis.expire).toHaveBeenCalledWith('test:user1', 60);
    });

    it('should fail open on Redis errors', async () => {
      const errorRedis = {
        zRemRangeByScore: vi.fn().mockRejectedValue(new Error('Redis error')),
      } as any;

      const errorLimiter = new RateLimiter(errorRedis, {
        maxRequests: 5,
        windowMs: 60000,
      });

      const result = await errorLimiter.checkLimit('user1');
      expect(result.allowed).toBe(true);
    });
  });

  describe('middleware', () => {
    it('should call next() when under limit', async () => {
      const middleware = rateLimiter.middleware();
      const req = { username: 'user1' } as any;
      const res = {} as any;
      const next = vi.fn();

      await middleware(req, res, next);
      expect(next).toHaveBeenCalled();
    });

    it('should return 429 when over limit', async () => {
      // Fill up the limit
      for (let i = 0; i < 5; i++) {
        await rateLimiter.checkLimit('user1');
      }

      const middleware = rateLimiter.middleware();
      const req = { username: 'user1' } as any;
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      } as any;
      const next = vi.fn();

      await middleware(req, res, next);
      expect(res.status).toHaveBeenCalledWith(429);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
          message: 'Too many requests',
        })
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle anonymous users', async () => {
      const middleware = rateLimiter.middleware();
      const req = {} as any;
      const res = {} as any;
      const next = vi.fn();

      await middleware(req, res, next);
      expect(next).toHaveBeenCalled();
    });
  });
});

describe('Rate limiter factories', () => {
  it('should create pixel rate limiter with correct config', () => {
    const redis = createMockRedis();
    const limiter = createPixelRateLimiter(redis);
    expect(limiter).toBeInstanceOf(RateLimiter);
  });

  it('should create general rate limiter with correct config', () => {
    const redis = createMockRedis();
    const limiter = createGeneralRateLimiter(redis);
    expect(limiter).toBeInstanceOf(RateLimiter);
  });
});
