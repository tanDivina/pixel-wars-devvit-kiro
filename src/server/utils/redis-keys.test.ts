import { describe, it, expect } from 'vitest';
import {
  RedisKeys,
  validateKey,
  formatPixelKey,
  parsePixelKey,
  formatPixelUpdate,
  parsePixelUpdate,
} from './redis-keys';

describe('RedisKeys', () => {
  const postId = 'test-post-123';
  const username = 'testuser';

  it('should generate canvas key', () => {
    expect(RedisKeys.canvas(postId)).toBe('post:test-post-123:canvas');
  });

  it('should generate canvas updates key', () => {
    expect(RedisKeys.canvasUpdates(postId)).toBe('post:test-post-123:canvas:updates');
  });

  it('should generate user credits key', () => {
    expect(RedisKeys.userCredits(postId, username)).toBe('post:test-post-123:user:testuser:credits');
  });

  it('should generate user stats key', () => {
    expect(RedisKeys.userStats(postId, username)).toBe('post:test-post-123:user:testuser:stats');
  });

  it('should generate player leaderboard key', () => {
    expect(RedisKeys.playerLeaderboard(postId)).toBe('post:test-post-123:leaderboard:players');
  });

  it('should generate team assignments key', () => {
    expect(RedisKeys.teamAssignments(postId)).toBe('post:test-post-123:teams');
  });

  it('should generate zone control key', () => {
    expect(RedisKeys.zoneControl(postId)).toBe('post:test-post-123:zones');
  });

  it('should generate active players key', () => {
    expect(RedisKeys.activePlayers(postId)).toBe('post:test-post-123:active');
  });

  it('should generate config key', () => {
    expect(RedisKeys.config(postId)).toBe('post:test-post-123:config');
  });

  it('should generate rate limit key', () => {
    expect(RedisKeys.rateLimit(username)).toBe('ratelimit:testuser');
  });
});

describe('validateKey', () => {
  it('should validate keys starting with post:', () => {
    expect(validateKey('post:123:canvas')).toBe(true);
  });

  it('should validate keys starting with ratelimit:', () => {
    expect(validateKey('ratelimit:user')).toBe(true);
  });

  it('should reject invalid keys', () => {
    expect(validateKey('invalid:key')).toBe(false);
    expect(validateKey('random')).toBe(false);
  });
});

describe('formatPixelKey', () => {
  it('should format pixel coordinates', () => {
    expect(formatPixelKey(5, 10)).toBe('5:10');
    expect(formatPixelKey(0, 0)).toBe('0:0');
    expect(formatPixelKey(99, 99)).toBe('99:99');
  });
});

describe('parsePixelKey', () => {
  it('should parse pixel coordinates', () => {
    expect(parsePixelKey('5:10')).toEqual({ x: 5, y: 10 });
    expect(parsePixelKey('0:0')).toEqual({ x: 0, y: 0 });
    expect(parsePixelKey('99:99')).toEqual({ x: 99, y: 99 });
  });
});

describe('formatPixelUpdate', () => {
  it('should format pixel update with team', () => {
    expect(formatPixelUpdate(5, 10, 'red')).toBe('5:10:red');
    expect(formatPixelUpdate(0, 0, 'blue')).toBe('0:0:blue');
  });
});

describe('parsePixelUpdate', () => {
  it('should parse pixel update', () => {
    expect(parsePixelUpdate('5:10:red')).toEqual({ x: 5, y: 10, teamId: 'red' });
    expect(parsePixelUpdate('0:0:blue')).toEqual({ x: 0, y: 0, teamId: 'blue' });
  });
});
