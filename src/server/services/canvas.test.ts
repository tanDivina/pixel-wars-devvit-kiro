import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CanvasService } from './canvas';

// Mock Redis client
const createMockRedis = () => ({
  hGet: vi.fn(),
  hSet: vi.fn(),
  hGetAll: vi.fn(),
  hLen: vi.fn(),
  zAdd: vi.fn(),
  zRangeByScore: vi.fn(),
  zScore: vi.fn(),
  zRemRangeByScore: vi.fn(),
});

describe('CanvasService', () => {
  let mockRedis: ReturnType<typeof createMockRedis>;
  let service: CanvasService;
  const postId = 'test-post';

  beforeEach(() => {
    mockRedis = createMockRedis();
    service = new CanvasService(mockRedis as any);
  });

  describe('getPixel', () => {
    it('should get a pixel from the canvas', async () => {
      mockRedis.hGet.mockResolvedValue('red');
      
      const result = await service.getPixel(postId, 5, 10);
      
      expect(result).toBe('red');
      expect(mockRedis.hGet).toHaveBeenCalledWith('post:test-post:canvas', '5:10');
    });

    it('should return null for empty pixel', async () => {
      mockRedis.hGet.mockResolvedValue(null);
      
      const result = await service.getPixel(postId, 5, 10);
      
      expect(result).toBeNull();
    });
  });

  describe('setPixel', () => {
    it('should set a pixel and log the update', async () => {
      await service.setPixel(postId, 5, 10, 'red');
      
      expect(mockRedis.hSet).toHaveBeenCalledWith('post:test-post:canvas', '5:10', 'red');
      expect(mockRedis.zAdd).toHaveBeenCalledWith(
        'post:test-post:canvas:updates',
        expect.objectContaining({
          member: '5:10:red',
          score: expect.any(Number),
        })
      );
    });
  });

  describe('getAllPixels', () => {
    it('should return all pixels from canvas', async () => {
      mockRedis.hGetAll.mockResolvedValue({
        '0:0': 'red',
        '1:1': 'blue',
        '5:10': 'green',
      });
      
      const result = await service.getAllPixels(postId);
      
      expect(result).toHaveLength(3);
      expect(result).toContainEqual({ x: 0, y: 0, teamId: 'red', timestamp: 0 });
      expect(result).toContainEqual({ x: 1, y: 1, teamId: 'blue', timestamp: 0 });
      expect(result).toContainEqual({ x: 5, y: 10, teamId: 'green', timestamp: 0 });
    });

    it('should return empty array for empty canvas', async () => {
      mockRedis.hGetAll.mockResolvedValue({});
      
      const result = await service.getAllPixels(postId);
      
      expect(result).toEqual([]);
    });
  });

  describe('getUpdatesSince', () => {
    it('should return updates since timestamp', async () => {
      const since = 1000;
      mockRedis.zRangeByScore.mockResolvedValue([
        { member: '5:10:red', score: 1500 },
        { member: '6:11:blue', score: 2000 },
      ]);
      mockRedis.zScore.mockResolvedValueOnce(1500).mockResolvedValueOnce(2000);
      
      const result = await service.getUpdatesSince(postId, since);
      
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ x: 5, y: 10, teamId: 'red', timestamp: 1500 });
      expect(result[1]).toEqual({ x: 6, y: 11, teamId: 'blue', timestamp: 2000 });
      expect(mockRedis.zRangeByScore).toHaveBeenCalledWith(
        'post:test-post:canvas:updates',
        since,
        '+inf',
        { by: 'score' }
      );
    });
  });

  describe('getPixelCount', () => {
    it('should return total pixel count', async () => {
      mockRedis.hLen.mockResolvedValue(42);
      
      const result = await service.getPixelCount(postId);
      
      expect(result).toBe(42);
      expect(mockRedis.hLen).toHaveBeenCalledWith('post:test-post:canvas');
    });
  });

  describe('getPixelCountByTeam', () => {
    it('should count pixels by team', async () => {
      mockRedis.hGetAll.mockResolvedValue({
        '0:0': 'red',
        '1:1': 'red',
        '2:2': 'blue',
        '3:3': 'red',
      });
      
      const result = await service.getPixelCountByTeam(postId);
      
      expect(result).toEqual({
        red: 3,
        blue: 1,
      });
    });
  });

  describe('pruneOldUpdates', () => {
    it('should remove old updates', async () => {
      const now = Date.now();
      vi.spyOn(Date, 'now').mockReturnValue(now);
      
      await service.pruneOldUpdates(postId, 86400000);
      
      expect(mockRedis.zRemRangeByScore).toHaveBeenCalledWith(
        'post:test-post:canvas:updates',
        '-inf',
        now - 86400000
      );
    });
  });
});
