/**
 * Season Storage Service Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SeasonStorageService, DEFAULT_SEASON_SETTINGS, MAX_SEASON_HISTORY } from './seasonStorage.js';
import type { SeasonMetadata, SeasonSettings, SeasonHistory } from '../../shared/types/season.js';
import { SEASON_KEYS, getSeasonHistoryKey, getSeasonJobsKey } from '../utils/season-redis-keys.js';

// Mock Redis client
const createMockRedis = () => ({
  get: vi.fn(),
  set: vi.fn(),
  del: vi.fn(),
  zAdd: vi.fn(),
  zRange: vi.fn(),
  zCard: vi.fn(),
  zRemRangeByRank: vi.fn(),
});

describe('SeasonStorageService', () => {
  let redis: ReturnType<typeof createMockRedis>;
  let service: SeasonStorageService;

  beforeEach(() => {
    redis = createMockRedis();
    service = new SeasonStorageService(redis as any);
  });

  describe('getCurrentSeason', () => {
    it('should return season metadata when exists', async () => {
      const season: SeasonMetadata = {
        seasonNumber: 1,
        startTime: Date.now(),
        endTime: Date.now() + 86400000,
        duration: 86400000,
        status: 'active',
      };
      redis.get.mockResolvedValue(JSON.stringify(season));

      const result = await service.getCurrentSeason();

      expect(redis.get).toHaveBeenCalledWith(SEASON_KEYS.CURRENT);
      expect(result).toEqual(season);
    });

    it('should return null when no season exists', async () => {
      redis.get.mockResolvedValue(null);

      const result = await service.getCurrentSeason();

      expect(result).toBeNull();
    });

    it('should throw error on Redis failure', async () => {
      redis.get.mockRejectedValue(new Error('Redis error'));

      await expect(service.getCurrentSeason()).rejects.toThrow('Failed to retrieve current season data');
    });
  });

  describe('setCurrentSeason', () => {
    it('should save season metadata', async () => {
      const season: SeasonMetadata = {
        seasonNumber: 1,
        startTime: Date.now(),
        endTime: Date.now() + 86400000,
        duration: 86400000,
        status: 'active',
      };
      redis.set.mockResolvedValue(undefined);

      await service.setCurrentSeason(season);

      expect(redis.set).toHaveBeenCalledWith(SEASON_KEYS.CURRENT, JSON.stringify(season));
    });

    it('should throw error for invalid season number', async () => {
      const season: SeasonMetadata = {
        seasonNumber: 0,
        startTime: Date.now(),
        endTime: Date.now() + 86400000,
        duration: 86400000,
        status: 'active',
      };

      await expect(service.setCurrentSeason(season)).rejects.toThrow('Invalid season number');
    });

    it('should throw error on Redis failure', async () => {
      const season: SeasonMetadata = {
        seasonNumber: 1,
        startTime: Date.now(),
        endTime: Date.now() + 86400000,
        duration: 86400000,
        status: 'active',
      };
      redis.set.mockRejectedValue(new Error('Redis error'));

      await expect(service.setCurrentSeason(season)).rejects.toThrow('Failed to save current season data');
    });
  });

  describe('getSettings', () => {
    it('should return settings when exists', async () => {
      const settings: SeasonSettings = {
        durationMs: 604800000,
        enableAutoPosts: true,
        enable24hWarning: true,
        enable1hWarning: false,
      };
      redis.get.mockResolvedValue(JSON.stringify(settings));

      const result = await service.getSettings();

      expect(redis.get).toHaveBeenCalledWith(SEASON_KEYS.SETTINGS);
      expect(result).toEqual(settings);
    });

    it('should return default settings when not exists', async () => {
      redis.get.mockResolvedValue(null);

      const result = await service.getSettings();

      expect(result).toEqual(DEFAULT_SEASON_SETTINGS);
    });

    it('should return default settings on error', async () => {
      redis.get.mockRejectedValue(new Error('Redis error'));

      const result = await service.getSettings();

      expect(result).toEqual(DEFAULT_SEASON_SETTINGS);
    });
  });

  describe('setSettings', () => {
    it('should save settings', async () => {
      const settings: SeasonSettings = {
        durationMs: 604800000,
        enableAutoPosts: false,
        enable24hWarning: true,
        enable1hWarning: true,
      };
      redis.set.mockResolvedValue(undefined);

      await service.setSettings(settings);

      expect(redis.set).toHaveBeenCalledWith(SEASON_KEYS.SETTINGS, JSON.stringify(settings));
    });

    it('should throw error for invalid duration', async () => {
      const settings: SeasonSettings = {
        durationMs: -1000,
        enableAutoPosts: true,
        enable24hWarning: true,
        enable1hWarning: true,
      };

      await expect(service.setSettings(settings)).rejects.toThrow('Duration must be positive');
    });

    it('should throw error on Redis failure', async () => {
      const settings: SeasonSettings = {
        durationMs: 604800000,
        enableAutoPosts: true,
        enable24hWarning: true,
        enable1hWarning: true,
      };
      redis.set.mockRejectedValue(new Error('Redis error'));

      await expect(service.setSettings(settings)).rejects.toThrow('Failed to save season settings');
    });
  });

  describe('getSeasonHistory', () => {
    it('should return history when exists', async () => {
      const history: SeasonHistory = {
        seasonNumber: 1,
        startTime: Date.now() - 86400000,
        endTime: Date.now(),
        duration: 86400000,
        winningTeam: {
          id: 'team1',
          name: 'Red Team',
          color: '#FF0000',
          finalScore: 1000,
        },
        finalStandings: [],
        statistics: {
          totalPixelsPlaced: 5000,
          totalPlayers: 50,
          topPlayer: {
            username: 'player1',
            teamId: 'team1',
            pixelsPlaced: 200,
          },
          closestZone: {
            x: 10,
            y: 10,
            marginPixels: 5,
          },
        },
      };
      redis.get.mockResolvedValue(JSON.stringify(history));

      const result = await service.getSeasonHistory(1);

      expect(redis.get).toHaveBeenCalledWith(getSeasonHistoryKey(1));
      expect(result).toEqual(history);
    });

    it('should return null when not exists', async () => {
      redis.get.mockResolvedValue(null);

      const result = await service.getSeasonHistory(1);

      expect(result).toBeNull();
    });

    it('should throw error for invalid season number', async () => {
      await expect(service.getSeasonHistory(0)).rejects.toThrow('Invalid season number');
    });
  });

  describe('saveSeasonHistory', () => {
    it('should save history and update index', async () => {
      const history: SeasonHistory = {
        seasonNumber: 1,
        startTime: Date.now() - 86400000,
        endTime: Date.now(),
        duration: 86400000,
        winningTeam: {
          id: 'team1',
          name: 'Red Team',
          color: '#FF0000',
          finalScore: 1000,
        },
        finalStandings: [],
        statistics: {
          totalPixelsPlaced: 5000,
          totalPlayers: 50,
          topPlayer: {
            username: 'player1',
            teamId: 'team1',
            pixelsPlaced: 200,
          },
          closestZone: {
            x: 10,
            y: 10,
            marginPixels: 5,
          },
        },
      };
      redis.set.mockResolvedValue(undefined);
      redis.zAdd.mockResolvedValue(1);
      redis.zCard.mockResolvedValue(1);

      await service.saveSeasonHistory(history);

      expect(redis.set).toHaveBeenCalledWith(getSeasonHistoryKey(1), JSON.stringify(history));
      expect(redis.zAdd).toHaveBeenCalledWith(SEASON_KEYS.HISTORY_INDEX, {
        member: '1',
        score: 1,
      });
    });

    it('should trim history when exceeds max', async () => {
      const history: SeasonHistory = {
        seasonNumber: 11,
        startTime: Date.now() - 86400000,
        endTime: Date.now(),
        duration: 86400000,
        winningTeam: {
          id: 'team1',
          name: 'Red Team',
          color: '#FF0000',
          finalScore: 1000,
        },
        finalStandings: [],
        statistics: {
          totalPixelsPlaced: 5000,
          totalPlayers: 50,
          topPlayer: {
            username: 'player1',
            teamId: 'team1',
            pixelsPlaced: 200,
          },
          closestZone: {
            x: 10,
            y: 10,
            marginPixels: 5,
          },
        },
      };
      redis.set.mockResolvedValue(undefined);
      redis.zAdd.mockResolvedValue(1);
      redis.zCard.mockResolvedValue(MAX_SEASON_HISTORY + 1);
      redis.zRemRangeByRank.mockResolvedValue(1);

      await service.saveSeasonHistory(history);

      expect(redis.zRemRangeByRank).toHaveBeenCalledWith(SEASON_KEYS.HISTORY_INDEX, 0, 0);
    });
  });

  describe('getAllSeasonHistory', () => {
    it('should return all history records', async () => {
      redis.zRange.mockResolvedValue([
        { member: '2', score: 2 },
        { member: '1', score: 1 },
      ]);
      
      const history1: SeasonHistory = {
        seasonNumber: 1,
        startTime: Date.now() - 172800000,
        endTime: Date.now() - 86400000,
        duration: 86400000,
        winningTeam: {
          id: 'team1',
          name: 'Red Team',
          color: '#FF0000',
          finalScore: 1000,
        },
        finalStandings: [],
        statistics: {
          totalPixelsPlaced: 5000,
          totalPlayers: 50,
          topPlayer: {
            username: 'player1',
            teamId: 'team1',
            pixelsPlaced: 200,
          },
          closestZone: {
            x: 10,
            y: 10,
            marginPixels: 5,
          },
        },
      };

      const history2: SeasonHistory = {
        ...history1,
        seasonNumber: 2,
        startTime: Date.now() - 86400000,
        endTime: Date.now(),
      };

      redis.get
        .mockResolvedValueOnce(JSON.stringify(history2))
        .mockResolvedValueOnce(JSON.stringify(history1));

      const result = await service.getAllSeasonHistory();

      expect(result).toHaveLength(2);
      expect(result[0].seasonNumber).toBe(2);
      expect(result[1].seasonNumber).toBe(1);
    });

    it('should return empty array when no history', async () => {
      redis.zRange.mockResolvedValue([]);

      const result = await service.getAllSeasonHistory();

      expect(result).toEqual([]);
    });
  });

  describe('acquireLock', () => {
    it('should acquire lock successfully', async () => {
      redis.set.mockResolvedValue('OK');

      const result = await service.acquireLock('test:lock');

      expect(result).toBe(true);
      expect(redis.set).toHaveBeenCalledWith('test:lock', 'locked', expect.objectContaining({
        nx: true,
      }));
    });

    it('should fail to acquire lock when already locked', async () => {
      redis.set.mockResolvedValue(null);

      const result = await service.acquireLock('test:lock');

      expect(result).toBe(false);
    });

    it('should return false on error', async () => {
      redis.set.mockRejectedValue(new Error('Redis error'));

      const result = await service.acquireLock('test:lock');

      expect(result).toBe(false);
    });
  });

  describe('releaseLock', () => {
    it('should release lock', async () => {
      redis.del.mockResolvedValue(1);

      await service.releaseLock('test:lock');

      expect(redis.del).toHaveBeenCalledWith('test:lock');
    });

    it('should not throw on error', async () => {
      redis.del.mockRejectedValue(new Error('Redis error'));

      await expect(service.releaseLock('test:lock')).resolves.toBeUndefined();
    });
  });

  describe('failed posts', () => {
    it('should add failed post', async () => {
      const post = {
        title: 'Test Post',
        body: 'Test body',
        timestamp: Date.now(),
        error: 'API error',
      };
      redis.zAdd.mockResolvedValue(1);

      await service.addFailedPost(post);

      expect(redis.zAdd).toHaveBeenCalledWith(SEASON_KEYS.FAILED_POSTS, {
        member: JSON.stringify(post),
        score: post.timestamp,
      });
    });

    it('should get failed posts', async () => {
      const posts = [
        {
          title: 'Test Post 1',
          body: 'Test body 1',
          timestamp: Date.now(),
          error: 'API error 1',
        },
        {
          title: 'Test Post 2',
          body: 'Test body 2',
          timestamp: Date.now(),
          error: 'API error 2',
        },
      ];
      redis.zRange.mockResolvedValue(posts.map(p => ({ member: JSON.stringify(p), score: p.timestamp })));

      const result = await service.getFailedPosts();

      expect(result).toEqual(posts);
    });

    it('should clear failed posts', async () => {
      redis.del.mockResolvedValue(1);

      await service.clearFailedPosts();

      expect(redis.del).toHaveBeenCalledWith(SEASON_KEYS.FAILED_POSTS);
    });
  });
});
