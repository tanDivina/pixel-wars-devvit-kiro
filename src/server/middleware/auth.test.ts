import { describe, it, expect, vi } from 'vitest';
import { authenticateUser, validatePostId } from './auth';
import type { RedditClient } from '@devvit/web/server';

describe('authenticateUser middleware', () => {
  it('should authenticate valid user', async () => {
    const reddit = {
      getCurrentUsername: vi.fn().mockResolvedValue('testuser'),
    } as any as RedditClient;

    const middleware = authenticateUser(reddit);
    const req = {} as any;
    const res = {} as any;
    const next = vi.fn();

    await middleware(req, res, next);
    expect(req.username).toBe('testuser');
    expect(next).toHaveBeenCalled();
  });

  it('should reject unauthenticated user', async () => {
    const reddit = {
      getCurrentUsername: vi.fn().mockResolvedValue(null),
    } as any as RedditClient;

    const middleware = authenticateUser(reddit);
    const req = {} as any;
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as any;
    const next = vi.fn();

    await middleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'error',
        message: 'User not authenticated',
      })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('should handle authentication errors', async () => {
    const reddit = {
      getCurrentUsername: vi.fn().mockRejectedValue(new Error('Auth error')),
    } as any as RedditClient;

    const middleware = authenticateUser(reddit);
    const req = {} as any;
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as any;
    const next = vi.fn();

    await middleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'error',
        message: 'Authentication failed',
      })
    );
    expect(next).not.toHaveBeenCalled();
  });
});

describe('validatePostId middleware', () => {
  it('should validate existing postId', () => {
    const context = { postId: 't3_test123' as `t3_${string}` };
    const middleware = validatePostId(context);
    const req = {} as any;
    const res = {} as any;
    const next = vi.fn();

    middleware(req, res, next);
    expect(req.postId).toBe('t3_test123');
    expect(next).toHaveBeenCalled();
  });

  it('should reject missing postId', () => {
    const context = { postId: undefined };
    const middleware = validatePostId(context);
    const req = {} as any;
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as any;
    const next = vi.fn();

    middleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'error',
        message: 'postId is required but missing from context',
      })
    );
    expect(next).not.toHaveBeenCalled();
  });
});
