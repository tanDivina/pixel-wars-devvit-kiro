import type { Request, Response, NextFunction } from 'express';
import type { RedisClient } from '@devvit/web/server';

export interface RateLimiterConfig {
  maxRequests: number;
  windowMs: number;
  keyPrefix?: string;
}

export class RateLimiter {
  private redis: RedisClient;
  private config: RateLimiterConfig;

  constructor(redis: RedisClient, config: RateLimiterConfig) {
    this.redis = redis;
    this.config = {
      keyPrefix: 'ratelimit',
      ...config,
    };
  }

  /**
   * Check if a user has exceeded the rate limit
   */
  async checkLimit(username: string): Promise<{ allowed: boolean; retryAfter?: number }> {
    const key = `${this.config.keyPrefix}:${username}`;
    const now = Date.now();
    const windowStart = now - this.config.windowMs;

    try {
      // Remove old entries outside the time window
      await this.redis.zRemRangeByScore(key, 0, windowStart);

      // Count requests in current window
      const count = await this.redis.zCard(key);

      if (count >= this.config.maxRequests) {
        // Get the oldest request in the window
        const oldest = await this.redis.zRange(key, 0, 0, { by: 'rank' });
        if (oldest.length > 0 && oldest[0]) {
          const retryAfter = Math.ceil((oldest[0].score + this.config.windowMs - now) / 1000);
          return { allowed: false, retryAfter };
        }
        return { allowed: false };
      }

      // Add current request
      await this.redis.zAdd(key, { member: `${now}`, score: now });

      // Set expiry on the key
      await this.redis.expire(key, Math.ceil(this.config.windowMs / 1000));

      return { allowed: true };
    } catch (error) {
      console.error('Rate limiter error:', error);
      // On error, allow the request (fail open)
      return { allowed: true };
    }
  }

  /**
   * Express middleware for rate limiting
   */
  middleware() {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        // Get username from request context
        const username = (req as any).username || 'anonymous';

        const result = await this.checkLimit(username);

        if (!result.allowed) {
          res.status(429).json({
            status: 'error',
            message: 'Too many requests',
            retryAfter: result.retryAfter,
          });
          return;
        }

        next();
      } catch (error) {
        console.error('Rate limiter middleware error:', error);
        // On error, allow the request
        next();
      }
    };
  }
}

/**
 * Create a rate limiter for pixel placement (stricter limits)
 */
export const createPixelRateLimiter = (redis: RedisClient): RateLimiter => {
  return new RateLimiter(redis, {
    maxRequests: 10,
    windowMs: 60000, // 1 minute
    keyPrefix: 'ratelimit:pixel',
  });
};

/**
 * Create a rate limiter for general API endpoints
 */
export const createGeneralRateLimiter = (redis: RedisClient): RateLimiter => {
  return new RateLimiter(redis, {
    maxRequests: 100,
    windowMs: 60000, // 1 minute
    keyPrefix: 'ratelimit:api',
  });
};
