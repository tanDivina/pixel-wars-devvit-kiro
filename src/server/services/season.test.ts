/**
 * Season Service Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { RedisClient } from '@devvit/public-api';
import { SeasonService } from './season.js';
import type { SeasonMetadata, SeasonSettings } from '../../shared/types/season.js';

// Mock Redis client
const createMockRedis = (): RedisClient => {
  const store = new Map<string, string>();
  const hashes = new Map<string, Record<string, string>>();
  const zsets = new Map<string, Array<{ member: string; score: number }>>();

  return {
    get: vi.fn(async (key: string) => store.get(key) ?? null),
    set: vi.fn(async (key: string, value: string, options?: any) => {
      // Handle SET NX (set if not exists) for locking
      if (options?.nx) {
        if (store.has(key)) {
          return null; // Key exists, lock not acquired
        }
      }
      store.set(key, value);
      return 'OK';
    }),
    del: vi.fn(async (key: string | string[]) => {
      const keys = Array.isArray(key) ? key : [key];
      let deleted = 0;
      for (const k of keys) {
        if (store.delete(k)) deleted++;
        if (hashes.delete(k)) deleted++;
        if (zsets.delete(k)) deleted++;
      }
      return deleted;
    }),
    hSet: vi.fn(async (key: string, data: Record<string, string>) => {
      if (!hashes.has(key)) {
        hashes.set(key, {});
      }
      const hash = hashes.get(key)!;
      Object.assign(hash, data);
      return Object.keys(data).length;
    }),
    hGetAll: vi.fn(async (key: string) => {
      return hashes.get(key) || {};
    }),
    zAdd: vi.fn(async (key: string, ...items: Array<{ member: string; score: number }>) => {
      if (!zsets.has(key)) {
        zsets.set(key, []);
      }
      const zset = zsets.get(key)!;
      for (const item of items) {
        const existing = zset.findIndex(z => z.member === item.member);
        if (existing >= 0) {
          zset[existing] = item;
        } else {
          zset.push(item);
        }
      }
      return items.length;
    }),
    zRange: vi.fn(async (key: string, start: number, stop: number, options?: any) => {
      const zset = zsets.get(key) || [];
      // Sort by score
      const sorted = [...zset].sort((a, b) => a.score - b.score);
      // Handle reverse option
      const ordered = options?.reverse ? sorted.reverse() : sorted;
      // Handle slice
      const end = stop === -1 ? ordered.length : stop + 1;
      const sliced = ordered.slice(start, end);
      return sliced.map(item => ({ member: item.member, score: item.score }));
    }),
    zCard: vi.fn(async (key: string) => {
      return zsets.get(key)?.length ?? 0;
    }),
    zRemRangeByRank: vi.fn(async (key: string, start: number, stop: number) => {
      const zset = zsets.get(key);
      if (!zset) return 0;
      // Sort by score (ascending)
      const sorted = [...zset].sort((a, b) => a.score - b.score);
      // Remove items in range
      const toRemove = sorted.slice(start, stop + 1);
      const removed = toRemove.length;
      // Update zset
      zsets.set(key, zset.filter(item => !toRemove.some(r => r.member === item.member)));
      return removed;
    }),
  } as unknown as RedisClient;
};

describe('SeasonService', () => {
  let redis: RedisClient;
  let service: SeasonService;

  beforeEach(() => {
    redis = createMockRedis();
    service = new SeasonService(redis);
    vi.clearAllMocks();
  });

  describe('initialize', () => {
    it('should create Season 1 when no season exists', async () => {
      await service.initialize();

      const season = await service.getCurrentSeason();
      expect(season.seasonNumber).toBe(1);
      expect(season.status).toBe('active');
      expect(season.startTime).toBeLessThanOrEqual(Date.now());
      expect(season.endTime).toBeGreaterThan(season.startTime);
    });

    it('should not create new season if one already exists', async () => {
      // Create initial season
      await service.initialize();
      const firstSeason = await service.getCurrentSeason();

      // Initialize again
      await service.initialize();
      const secondSeason = await service.getCurrentSeason();

      expect(secondSeason.seasonNumber).toBe(firstSeason.seasonNumber);
      expect(secondSeason.startTime).toBe(firstSeason.startTime);
    });

    it('should log initialization message', async () => {
      const consoleSpy = vi.spyOn(console, 'log');
      await service.initialize();

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('No existing season found')
      );
    });

    it('should load and log settings on initialization', async () => {
      const consoleSpy = vi.spyOn(console, 'log');
      await service.initialize();

      expect(consoleSpy).toHaveBeenCalledWith(
        'Season settings loaded:',
        expect.objectContaining({
          durationMs: expect.any(Number),
          enableAutoPosts: expect.any(Boolean),
        })
      );
    });

    it('should log time remaining for existing season', async () => {
      // Create a season first
      await service.initialize();
      
      const consoleSpy = vi.spyOn(console, 'log');
      
      // Initialize again with existing season
      await service.initialize();

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Time remaining in season')
      );
    });

    it('should use default settings on first initialization', async () => {
      await service.initialize();
      
      const settings = await service.getSettings();
      expect(settings.durationMs).toBe(7 * 24 * 60 * 60 * 1000); // 7 days
      expect(settings.enableAutoPosts).toBe(true);
      expect(settings.enable24hWarning).toBe(true);
      expect(settings.enable1hWarning).toBe(true);
    });

    it('should handle initialization errors gracefully', async () => {
      // Mock Redis to fail on getCurrentSeason call (after settings load)
      let callCount = 0;
      vi.spyOn(redis, 'get').mockImplementation(async () => {
        callCount++;
        if (callCount > 1) {
          throw new Error('Redis connection failed');
        }
        return null; // Return null for settings call
      });

      await expect(service.initialize()).rejects.toThrow('Season system initialization failed');
    });
  });

  describe('getCurrentSeason', () => {
    it('should return current season metadata', async () => {
      await service.initialize();

      const season = await service.getCurrentSeason();
      expect(season).toMatchObject({
        seasonNumber: expect.any(Number),
        startTime: expect.any(Number),
        endTime: expect.any(Number),
        duration: expect.any(Number),
        status: 'active',
      });
    });

    it('should throw error when no season exists', async () => {
      await expect(service.getCurrentSeason()).rejects.toThrow('No active season found');
    });

    it('should handle Redis errors gracefully', async () => {
      vi.spyOn(redis, 'get').mockRejectedValueOnce(new Error('Redis error'));

      await expect(service.getCurrentSeason()).rejects.toThrow();
    });
  });

  describe('getTimeRemaining', () => {
    it('should calculate correct time remaining', async () => {
      await service.initialize();
      const season = await service.getCurrentSeason();

      const timeRemaining = await service.getTimeRemaining();
      const expected = season.endTime - Date.now();

      // Allow 100ms tolerance for execution time
      expect(timeRemaining).toBeGreaterThanOrEqual(expected - 100);
      expect(timeRemaining).toBeLessThanOrEqual(expected + 100);
    });

    it('should return 0 when season has ended', async () => {
      // Create a season that ended in the past
      const pastSeason: SeasonMetadata = {
        seasonNumber: 1,
        startTime: Date.now() - 10000,
        endTime: Date.now() - 5000,
        duration: 5000,
        status: 'active',
      };

      await redis.set('season:current', JSON.stringify(pastSeason));

      const timeRemaining = await service.getTimeRemaining();
      expect(timeRemaining).toBe(0);
    });

    it('should throw error when no season exists', async () => {
      await expect(service.getTimeRemaining()).rejects.toThrow();
    });
  });

  describe('getSettings', () => {
    it('should return default settings when none exist', async () => {
      const settings = await service.getSettings();

      expect(settings).toMatchObject({
        durationMs: 7 * 24 * 60 * 60 * 1000, // 7 days
        enableAutoPosts: true,
        enable24hWarning: true,
        enable1hWarning: true,
      });
    });

    it('should return saved settings', async () => {
      const customSettings: SeasonSettings = {
        durationMs: 24 * 60 * 60 * 1000, // 1 day
        enableAutoPosts: false,
        enable24hWarning: false,
        enable1hWarning: true,
      };

      await service.updateSettings(customSettings);
      const settings = await service.getSettings();

      expect(settings).toEqual(customSettings);
    });

    it('should return defaults on Redis error', async () => {
      vi.spyOn(redis, 'get').mockRejectedValueOnce(new Error('Redis error'));

      const settings = await service.getSettings();
      expect(settings.durationMs).toBe(7 * 24 * 60 * 60 * 1000);
    });
  });

  describe('updateSettings', () => {
    it('should update settings successfully', async () => {
      const newSettings: Partial<SeasonSettings> = {
        durationMs: 3 * 24 * 60 * 60 * 1000, // 3 days
        enableAutoPosts: false,
      };

      await service.updateSettings(newSettings);
      const settings = await service.getSettings();

      expect(settings.durationMs).toBe(3 * 24 * 60 * 60 * 1000);
      expect(settings.enableAutoPosts).toBe(false);
      // Other settings should remain default
      expect(settings.enable24hWarning).toBe(true);
      expect(settings.enable1hWarning).toBe(true);
    });

    it('should merge with existing settings', async () => {
      // Set initial settings
      await service.updateSettings({
        durationMs: 24 * 60 * 60 * 1000,
        enableAutoPosts: false,
      });

      // Update only one field
      await service.updateSettings({
        enable24hWarning: false,
      });

      const settings = await service.getSettings();
      expect(settings.durationMs).toBe(24 * 60 * 60 * 1000);
      expect(settings.enableAutoPosts).toBe(false);
      expect(settings.enable24hWarning).toBe(false);
    });

    it('should reject negative duration', async () => {
      await expect(
        service.updateSettings({ durationMs: -1000 })
      ).rejects.toThrow('Season duration must be positive');
    });

    it('should reject zero duration', async () => {
      await expect(
        service.updateSettings({ durationMs: 0 })
      ).rejects.toThrow('Season duration must be positive');
    });

    it('should log settings update', async () => {
      const consoleSpy = vi.spyOn(console, 'log');
      await service.updateSettings({ durationMs: 1000 });

      expect(consoleSpy).toHaveBeenCalledWith(
        'Season settings updated:',
        expect.any(Object)
      );
    });
  });

  describe('startNewSeason', () => {
    it('should create Season 1 when no previous season', async () => {
      const season = await service.startNewSeason();

      expect(season.seasonNumber).toBe(1);
      expect(season.status).toBe('active');
      expect(season.startTime).toBeLessThanOrEqual(Date.now());
      expect(season.endTime).toBeGreaterThan(season.startTime);
      expect(season.duration).toBe(7 * 24 * 60 * 60 * 1000); // Default 7 days
    });

    it('should increment season number', async () => {
      const season1 = await service.startNewSeason();
      expect(season1.seasonNumber).toBe(1);

      const season2 = await service.startNewSeason();
      expect(season2.seasonNumber).toBe(2);

      const season3 = await service.startNewSeason();
      expect(season3.seasonNumber).toBe(3);
    });

    it('should use configured duration', async () => {
      const customDuration = 3 * 24 * 60 * 60 * 1000; // 3 days
      await service.updateSettings({ durationMs: customDuration });

      const season = await service.startNewSeason();
      expect(season.duration).toBe(customDuration);
      expect(season.endTime - season.startTime).toBe(customDuration);
    });

    it('should set correct end time', async () => {
      const season = await service.startNewSeason();
      const expectedEndTime = season.startTime + season.duration;

      expect(season.endTime).toBe(expectedEndTime);
    });

    it('should log season start', async () => {
      const consoleSpy = vi.spyOn(console, 'log');
      await service.startNewSeason();

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Season 1 started')
      );
    });

    it('should handle Redis errors', async () => {
      vi.spyOn(redis, 'set').mockRejectedValueOnce(new Error('Redis error'));

      await expect(service.startNewSeason()).rejects.toThrow('Failed to start new season');
    });
  });

  describe('calculateWinner', () => {
    const testPostId = 'test-post-winner';
    const testConfig = {
      teams: [
        { id: 'red', name: 'Red Team', color: '#FF0000' },
        { id: 'blue', name: 'Blue Team', color: '#0000FF' },
        { id: 'green', name: 'Green Team', color: '#00FF00' },
      ],
    };

    beforeEach(async () => {
      // Set up test data for winner calculation
      // Canvas: red=5, blue=3, green=2
      await redis.hSet(`post:${testPostId}:canvas`, {
        '0:0': 'red',
        '1:0': 'red',
        '2:0': 'red',
        '0:1': 'blue',
        '1:1': 'blue',
        '2:1': 'green',
        '0:2': 'red',
        '1:2': 'blue',
        '2:2': 'green',
        '3:3': 'red',
      });

      // Zones: red=2, blue=1, green=0
      await redis.hSet(`post:${testPostId}:zones`, {
        '0:0': 'red',
        '1:0': 'red',
        '0:1': 'blue',
      });

      // Player scores
      await redis.zAdd(`post:${testPostId}:leaderboard:players`, 
        { member: 'player1', score: 15 },
        { member: 'player2', score: 10 },
        { member: 'player3', score: 5 }
      );

      // Team assignments
      await redis.hSet(`post:${testPostId}:teams`, {
        'player1': 'red',
        'player2': 'blue',
        'player3': 'green',
        'player4': 'red',
      });
    });

    it('should calculate winning team correctly', async () => {
      const result = await service.calculateWinner(testPostId, testConfig);

      expect(result.winningTeam.id).toBe('red');
      expect(result.winningTeam.name).toBe('Red Team');
      expect(result.winningTeam.color).toBe('#FF0000');
    });

    it('should calculate team scores (zones * 100 + pixels)', async () => {
      const result = await service.calculateWinner(testPostId, testConfig);

      // Red: 2 zones * 100 + 5 pixels = 205
      const redStanding = result.finalStandings.find(s => s.teamId === 'red');
      expect(redStanding?.score).toBe(205);

      // Blue: 1 zone * 100 + 3 pixels = 103
      const blueStanding = result.finalStandings.find(s => s.teamId === 'blue');
      expect(blueStanding?.score).toBe(103);

      // Green: 0 zones * 100 + 2 pixels = 2
      const greenStanding = result.finalStandings.find(s => s.teamId === 'green');
      expect(greenStanding?.score).toBe(2);
    });

    it('should sort final standings by score descending', async () => {
      const result = await service.calculateWinner(testPostId, testConfig);

      expect(result.finalStandings[0]?.teamId).toBe('red');
      expect(result.finalStandings[1]?.teamId).toBe('blue');
      expect(result.finalStandings[2]?.teamId).toBe('green');
    });

    it('should include zones controlled in standings', async () => {
      const result = await service.calculateWinner(testPostId, testConfig);

      const redStanding = result.finalStandings.find(s => s.teamId === 'red');
      expect(redStanding?.zonesControlled).toBe(2);

      const blueStanding = result.finalStandings.find(s => s.teamId === 'blue');
      expect(blueStanding?.zonesControlled).toBe(1);
    });

    it('should include player counts in standings', async () => {
      const result = await service.calculateWinner(testPostId, testConfig);

      const redStanding = result.finalStandings.find(s => s.teamId === 'red');
      expect(redStanding?.playerCount).toBe(2); // player1, player4

      const blueStanding = result.finalStandings.find(s => s.teamId === 'blue');
      expect(blueStanding?.playerCount).toBe(1); // player2

      const greenStanding = result.finalStandings.find(s => s.teamId === 'green');
      expect(greenStanding?.playerCount).toBe(1); // player3
    });

    it('should calculate total pixels placed', async () => {
      const result = await service.calculateWinner(testPostId, testConfig);

      expect(result.statistics.totalPixelsPlaced).toBe(10);
    });

    it('should calculate total players', async () => {
      const result = await service.calculateWinner(testPostId, testConfig);

      expect(result.statistics.totalPlayers).toBe(4);
    });

    it('should identify top player', async () => {
      const result = await service.calculateWinner(testPostId, testConfig);

      expect(result.statistics.topPlayer.username).toBe('player1');
      expect(result.statistics.topPlayer.pixelsPlaced).toBe(15);
      expect(result.statistics.topPlayer.teamId).toBe('red');
    });

    it('should handle empty game state', async () => {
      const emptyPostId = 'empty-post';
      const result = await service.calculateWinner(emptyPostId, testConfig);

      expect(result.winningTeam.id).toBe('red'); // First team wins by default
      expect(result.winningTeam.finalScore).toBe(0);
      expect(result.statistics.totalPixelsPlaced).toBe(0);
      expect(result.statistics.totalPlayers).toBe(0);
    });

    it('should handle no player scores', async () => {
      const noScoresPostId = 'no-scores-post';
      await redis.hSet(`post:${noScoresPostId}:canvas`, { '0:0': 'red' });

      const result = await service.calculateWinner(noScoresPostId, testConfig);

      expect(result.statistics.topPlayer.username).toBe('Unknown');
      expect(result.statistics.topPlayer.pixelsPlaced).toBe(0);
    });

    it('should throw error if no teams in config', async () => {
      const emptyConfig = { teams: [] };

      await expect(
        service.calculateWinner(testPostId, emptyConfig)
      ).rejects.toThrow('Failed to calculate winner');
    });

    it('should log winner calculation', async () => {
      const consoleSpy = vi.spyOn(console, 'log');
      await service.calculateWinner(testPostId, testConfig);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Calculating winner')
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Winner calculated: Red Team')
      );
    });

    it('should handle Redis errors gracefully', async () => {
      vi.spyOn(redis, 'hGetAll').mockRejectedValueOnce(new Error('Redis error'));

      await expect(
        service.calculateWinner(testPostId, testConfig)
      ).rejects.toThrow('Failed to calculate winner');
    });

    it('should handle tie scenarios (same score)', async () => {
      const tiePostId = 'tie-post';
      
      // Both teams have same score: 1 zone * 100 + 0 pixels = 100
      await redis.hSet(`post:${tiePostId}:zones`, {
        '0:0': 'red',
        '1:0': 'blue',
      });

      const result = await service.calculateWinner(tiePostId, testConfig);

      // First team in standings wins in case of tie
      expect(result.winningTeam.finalScore).toBe(100);
      expect(result.finalStandings[0]?.score).toBe(100);
      expect(result.finalStandings[1]?.score).toBe(100);
    });
  });

  describe('resetGameState', () => {
    const testPostId = 'test-post-123';

    beforeEach(async () => {
      // Set up some test data
      await redis.hSet(`post:${testPostId}:canvas`, { '0:0': 'red', '1:1': 'blue' });
      await redis.zAdd(`post:${testPostId}:canvas:updates`, { member: '0:0:red', score: Date.now() });
      await redis.zAdd(`post:${testPostId}:leaderboard:players`, { member: 'user1', score: 10 });
      await redis.hSet(`post:${testPostId}:zones`, { '0:0': 'red' });
      await redis.hSet(`post:${testPostId}:teams`, { 'user1': 'red', 'user2': 'blue' });
    });

    it('should clear canvas pixels', async () => {
      await service.resetGameState(testPostId);

      const canvas = await redis.hGetAll(`post:${testPostId}:canvas`);
      expect(Object.keys(canvas).length).toBe(0);
    });

    it('should clear canvas updates log', async () => {
      await service.resetGameState(testPostId);

      const updates = await redis.zRange(`post:${testPostId}:canvas:updates`, 0, -1, { by: 'rank' });
      expect(updates.length).toBe(0);
    });

    it('should clear player leaderboard', async () => {
      await service.resetGameState(testPostId);

      const leaderboard = await redis.zRange(`post:${testPostId}:leaderboard:players`, 0, -1, { by: 'rank' });
      expect(leaderboard.length).toBe(0);
    });

    it('should clear zone control', async () => {
      await service.resetGameState(testPostId);

      const zones = await redis.hGetAll(`post:${testPostId}:zones`);
      expect(Object.keys(zones).length).toBe(0);
    });

    it('should preserve team assignments', async () => {
      await service.resetGameState(testPostId);

      const teams = await redis.hGetAll(`post:${testPostId}:teams`);
      expect(teams['user1']).toBe('red');
      expect(teams['user2']).toBe('blue');
    });

    it('should log reset operations', async () => {
      const consoleSpy = vi.spyOn(console, 'log');
      await service.resetGameState(testPostId);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Resetting game state')
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Game state reset complete')
      );
    });

    it('should handle Redis errors gracefully', async () => {
      vi.spyOn(redis, 'del').mockRejectedValueOnce(new Error('Redis error'));

      await expect(service.resetGameState(testPostId)).rejects.toThrow('Failed to reset game state');
    });

    it('should reset multiple data types in parallel', async () => {
      const startTime = Date.now();
      await service.resetGameState(testPostId);
      const duration = Date.now() - startTime;

      // Should complete quickly (parallel operations)
      expect(duration).toBeLessThan(1000);
    });
  });

  describe('saveHistory', () => {
    const testHistory: SeasonHistory = {
      seasonNumber: 1,
      startTime: Date.now() - 7 * 24 * 60 * 60 * 1000,
      endTime: Date.now(),
      duration: 7 * 24 * 60 * 60 * 1000,
      winningTeam: {
        id: 'red',
        name: 'Red Team',
        color: '#FF0000',
        finalScore: 250,
      },
      finalStandings: [
        { teamId: 'red', teamName: 'Red Team', score: 250, zonesControlled: 2, playerCount: 5 },
        { teamId: 'blue', teamName: 'Blue Team', score: 150, zonesControlled: 1, playerCount: 3 },
      ],
      statistics: {
        totalPixelsPlaced: 100,
        totalPlayers: 8,
        topPlayer: { username: 'player1', teamId: 'red', pixelsPlaced: 25 },
        closestZone: { x: 0, y: 0, marginPixels: 5 },
      },
    };

    it('should save season history successfully', async () => {
      await service.saveHistory(testHistory);

      // Verify it was saved by retrieving it
      const retrieved = await service.getSeasonHistory(1);
      expect(retrieved).not.toBeNull();
      expect(retrieved?.seasonNumber).toBe(1);
    });

    it('should log save operation', async () => {
      const consoleSpy = vi.spyOn(console, 'log');
      await service.saveHistory(testHistory);

      expect(consoleSpy).toHaveBeenCalledWith('Saving history for season 1...');
      expect(consoleSpy).toHaveBeenCalledWith('Season 1 history saved successfully');
    });

    it('should handle save errors gracefully', async () => {
      const invalidHistory = { ...testHistory, seasonNumber: -1 };

      await expect(service.saveHistory(invalidHistory)).rejects.toThrow(
        'Failed to save season history'
      );
    });
  });

  describe('getSeasonHistory', () => {
    beforeEach(async () => {
      // Save a test history
      const testHistory: SeasonHistory = {
        seasonNumber: 5,
        startTime: Date.now() - 7 * 24 * 60 * 60 * 1000,
        endTime: Date.now(),
        duration: 7 * 24 * 60 * 60 * 1000,
        winningTeam: {
          id: 'blue',
          name: 'Blue Team',
          color: '#0000FF',
          finalScore: 300,
        },
        finalStandings: [],
        statistics: {
          totalPixelsPlaced: 50,
          totalPlayers: 4,
          topPlayer: { username: 'player2', teamId: 'blue', pixelsPlaced: 15 },
          closestZone: { x: 1, y: 1, marginPixels: 3 },
        },
      };
      await service.saveHistory(testHistory);
    });

    it('should retrieve season history by number', async () => {
      const history = await service.getSeasonHistory(5);

      expect(history).not.toBeNull();
      expect(history?.seasonNumber).toBe(5);
      expect(history?.winningTeam.name).toBe('Blue Team');
    });

    it('should return null for non-existent season', async () => {
      const history = await service.getSeasonHistory(999);

      expect(history).toBeNull();
    });

    it('should return null on errors', async () => {
      const history = await service.getSeasonHistory(-1);

      expect(history).toBeNull();
    });
  });

  describe('getAllSeasonHistory', () => {
    beforeEach(async () => {
      // Save multiple season histories
      for (let i = 1; i <= 3; i++) {
        const history: SeasonHistory = {
          seasonNumber: i,
          startTime: Date.now() - (8 - i) * 24 * 60 * 60 * 1000,
          endTime: Date.now() - (7 - i) * 24 * 60 * 60 * 1000,
          duration: 24 * 60 * 60 * 1000,
          winningTeam: {
            id: 'red',
            name: 'Red Team',
            color: '#FF0000',
            finalScore: 100 * i,
          },
          finalStandings: [],
          statistics: {
            totalPixelsPlaced: 10 * i,
            totalPlayers: i,
            topPlayer: { username: `player${i}`, teamId: 'red', pixelsPlaced: 5 * i },
            closestZone: { x: 0, y: 0, marginPixels: i },
          },
        };
        await service.saveHistory(history);
      }
    });

    it('should retrieve all season histories', async () => {
      const histories = await service.getAllSeasonHistory();

      expect(histories.length).toBe(3);
    });

    it('should return histories sorted by season number descending', async () => {
      const histories = await service.getAllSeasonHistory();

      expect(histories[0]?.seasonNumber).toBe(3);
      expect(histories[1]?.seasonNumber).toBe(2);
      expect(histories[2]?.seasonNumber).toBe(1);
    });

    it('should return empty array when no histories exist', async () => {
      // Create a new service instance with fresh Redis
      const freshRedis = createMockRedis();
      const freshService = new SeasonService(freshRedis);

      const histories = await freshService.getAllSeasonHistory();

      expect(histories).toEqual([]);
    });

    it('should return empty array on errors', async () => {
      vi.spyOn(redis, 'zRange').mockRejectedValueOnce(new Error('Redis error'));

      const histories = await service.getAllSeasonHistory();

      expect(histories).toEqual([]);
    });

    it('should limit to last 10 seasons', async () => {
      // Save 12 seasons
      for (let i = 4; i <= 12; i++) {
        const history: SeasonHistory = {
          seasonNumber: i,
          startTime: Date.now(),
          endTime: Date.now(),
          duration: 1000,
          winningTeam: {
            id: 'red',
            name: 'Red Team',
            color: '#FF0000',
            finalScore: 100,
          },
          finalStandings: [],
          statistics: {
            totalPixelsPlaced: 10,
            totalPlayers: 1,
            topPlayer: { username: 'player', teamId: 'red', pixelsPlaced: 5 },
            closestZone: { x: 0, y: 0, marginPixels: 1 },
          },
        };
        await service.saveHistory(history);
      }

      const histories = await service.getAllSeasonHistory();

      // Should have at most 10 (the limit)
      expect(histories.length).toBeLessThanOrEqual(10);
    });
  });

  describe('endSeason', () => {
    const testPostId = 'test-post-end';
    const testConfig = {
      teams: [
        { id: 'red', name: 'Red Team', color: '#FF0000' },
        { id: 'blue', name: 'Blue Team', color: '#0000FF' },
      ],
    };

    beforeEach(async () => {
      // Initialize a season first
      await service.initialize();

      // Set up game state
      await redis.hSet(`post:${testPostId}:canvas`, {
        '0:0': 'red',
        '1:0': 'red',
        '2:0': 'blue',
      });
      await redis.hSet(`post:${testPostId}:zones`, {
        '0:0': 'red',
      });
      await redis.zAdd(`post:${testPostId}:leaderboard:players`, { member: 'player1', score: 10 });
      await redis.hSet(`post:${testPostId}:teams`, { 'player1': 'red' });
    });

    it('should complete full season transition', async () => {
      const history = await service.endSeason(testPostId, testConfig);

      // Verify history was returned
      expect(history.seasonNumber).toBe(1);
      expect(history.winningTeam).toBeDefined();
      expect(history.finalStandings.length).toBeGreaterThan(0);

      // Verify new season was started
      const newSeason = await service.getCurrentSeason();
      expect(newSeason.seasonNumber).toBe(2);
    });

    it('should acquire and release lock', async () => {
      const lockSpy = vi.spyOn(service['storage'], 'acquireLock');
      const releaseSpy = vi.spyOn(service['storage'], 'releaseLock');

      await service.endSeason(testPostId, testConfig);

      expect(lockSpy).toHaveBeenCalledWith('season:lock', 60000);
      expect(releaseSpy).toHaveBeenCalledWith('season:lock');
    });

    it('should throw error if lock cannot be acquired', async () => {
      // Mock lock acquisition to fail
      vi.spyOn(service['storage'], 'acquireLock').mockResolvedValueOnce(false);

      await expect(service.endSeason(testPostId, testConfig)).rejects.toThrow(
        'Season end already in progress'
      );
    });

    it('should release lock even if error occurs', async () => {
      const releaseSpy = vi.spyOn(service['storage'], 'releaseLock');

      // Mock calculateWinner to fail
      vi.spyOn(service, 'calculateWinner').mockRejectedValueOnce(new Error('Calculation failed'));

      await expect(service.endSeason(testPostId, testConfig)).rejects.toThrow();

      // Lock should still be released
      expect(releaseSpy).toHaveBeenCalledWith('season:lock');
    });

    it('should calculate winner correctly', async () => {
      const history = await service.endSeason(testPostId, testConfig);

      expect(history.winningTeam.id).toBe('red');
      expect(history.winningTeam.name).toBe('Red Team');
      expect(history.finalStandings).toHaveLength(2);
    });

    it('should save season history', async () => {
      await service.endSeason(testPostId, testConfig);

      // Verify history was saved
      const savedHistory = await service.getSeasonHistory(1);
      expect(savedHistory).not.toBeNull();
      expect(savedHistory?.seasonNumber).toBe(1);
    });

    it('should continue if history save fails', async () => {
      // Mock saveHistory to fail
      const saveSpy = vi.spyOn(service, 'saveHistory').mockRejectedValueOnce(new Error('Save failed'));
      const consoleSpy = vi.spyOn(console, 'error');

      // Should not throw
      const history = await service.endSeason(testPostId, testConfig);

      expect(history).toBeDefined();
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to save season history'),
        expect.any(Error)
      );
      expect(saveSpy).toHaveBeenCalled();
    });

    it('should reset game state', async () => {
      await service.endSeason(testPostId, testConfig);

      // Verify canvas was cleared
      const canvas = await redis.hGetAll(`post:${testPostId}:canvas`);
      expect(Object.keys(canvas).length).toBe(0);

      // Verify zones were cleared
      const zones = await redis.hGetAll(`post:${testPostId}:zones`);
      expect(Object.keys(zones).length).toBe(0);

      // Verify leaderboard was cleared
      const leaderboard = await redis.zRange(`post:${testPostId}:leaderboard:players`, 0, -1, { by: 'rank' });
      expect(leaderboard.length).toBe(0);
    });

    it('should preserve team assignments', async () => {
      await service.endSeason(testPostId, testConfig);

      // Verify teams were preserved
      const teams = await redis.hGetAll(`post:${testPostId}:teams`);
      expect(teams['player1']).toBe('red');
    });

    it('should start new season with incremented number', async () => {
      const oldSeason = await service.getCurrentSeason();
      await service.endSeason(testPostId, testConfig);
      const newSeason = await service.getCurrentSeason();

      expect(newSeason.seasonNumber).toBe(oldSeason.seasonNumber + 1);
      expect(newSeason.status).toBe('active');
    });

    it('should log all steps', async () => {
      const consoleSpy = vi.spyOn(console, 'log');

      await service.endSeason(testPostId, testConfig);

      expect(consoleSpy).toHaveBeenCalledWith('Starting season end process...');
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Ending season'));
      expect(consoleSpy).toHaveBeenCalledWith('Step 1/4: Calculating winner...');
      expect(consoleSpy).toHaveBeenCalledWith('Step 2/4: Saving season history...');
      expect(consoleSpy).toHaveBeenCalledWith('Step 3/4: Resetting game state...');
      expect(consoleSpy).toHaveBeenCalledWith('Step 4/4: Starting new season...');
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Season transition complete'));
    });

    it('should include season metadata in history', async () => {
      const currentSeason = await service.getCurrentSeason();
      const history = await service.endSeason(testPostId, testConfig);

      expect(history.seasonNumber).toBe(currentSeason.seasonNumber);
      expect(history.startTime).toBe(currentSeason.startTime);
      expect(history.endTime).toBe(currentSeason.endTime);
      expect(history.duration).toBe(currentSeason.duration);
    });

    it('should handle multiple season transitions', async () => {
      // End season 1
      const history1 = await service.endSeason(testPostId, testConfig);
      expect(history1.seasonNumber).toBe(1);

      // Set up game state for season 2
      await redis.hSet(`post:${testPostId}:canvas`, { '0:0': 'blue' });
      await redis.hSet(`post:${testPostId}:zones`, { '0:0': 'blue' });

      // End season 2
      const history2 = await service.endSeason(testPostId, testConfig);
      expect(history2.seasonNumber).toBe(2);

      // Verify season 3 started
      const currentSeason = await service.getCurrentSeason();
      expect(currentSeason.seasonNumber).toBe(3);
    });

    it('should store failed history save for manual retry', async () => {
      // Mock saveHistory to fail
      vi.spyOn(service, 'saveHistory').mockRejectedValueOnce(new Error('Redis connection lost'));
      const addFailedPostSpy = vi.spyOn(service['storage'], 'addFailedPost');

      await service.endSeason(testPostId, testConfig);

      expect(addFailedPostSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          title: expect.stringContaining('Season 1 History Save Failed'),
          error: 'Redis connection lost',
        })
      );
    });

    it('should throw error if calculateWinner fails', async () => {
      vi.spyOn(service, 'calculateWinner').mockRejectedValueOnce(new Error('No teams found'));

      await expect(service.endSeason(testPostId, testConfig)).rejects.toThrow();
    });

    it('should throw error if resetGameState fails', async () => {
      vi.spyOn(service, 'resetGameState').mockRejectedValueOnce(new Error('Redis error'));

      await expect(service.endSeason(testPostId, testConfig)).rejects.toThrow();
    });

    it('should throw error if startNewSeason fails', async () => {
      vi.spyOn(service, 'startNewSeason').mockRejectedValueOnce(new Error('Redis error'));

      await expect(service.endSeason(testPostId, testConfig)).rejects.toThrow();
    });

    it('should handle concurrent season end attempts', async () => {
      // First call should succeed
      const promise1 = service.endSeason(testPostId, testConfig);

      // Second call should fail (lock already acquired)
      const promise2 = service.endSeason(testPostId, testConfig);

      await expect(promise1).resolves.toBeDefined();
      await expect(promise2).rejects.toThrow('Season end already in progress');
    });
  });

  describe('integration scenarios', () => {
    it('should handle complete initialization flow', async () => {
      // Initialize system
      await service.initialize();

      // Verify season was created
      const season = await service.getCurrentSeason();
      expect(season.seasonNumber).toBe(1);

      // Verify time remaining is calculated
      const timeRemaining = await service.getTimeRemaining();
      expect(timeRemaining).toBeGreaterThan(0);

      // Verify settings are accessible
      const settings = await service.getSettings();
      expect(settings.durationMs).toBeGreaterThan(0);
    });

    it('should handle settings update and new season creation', async () => {
      // Update settings
      const newDuration = 24 * 60 * 60 * 1000; // 1 day
      await service.updateSettings({ durationMs: newDuration });

      // Start new season
      const season = await service.startNewSeason();

      // Verify new season uses updated settings
      expect(season.duration).toBe(newDuration);
    });

    it('should maintain season continuity across operations', async () => {
      // Create first season
      const season1 = await service.startNewSeason();

      // Get current season multiple times
      const retrieved1 = await service.getCurrentSeason();
      const retrieved2 = await service.getCurrentSeason();

      // All should be the same
      expect(retrieved1.seasonNumber).toBe(season1.seasonNumber);
      expect(retrieved2.seasonNumber).toBe(season1.seasonNumber);
      expect(retrieved1.startTime).toBe(season1.startTime);
    });

    it('should handle season reset and new season flow', async () => {
      const testPostId = 'test-post-456';

      // Set up game state
      await redis.hSet(`post:${testPostId}:canvas`, { '0:0': 'red' });
      await redis.hSet(`post:${testPostId}:teams`, { 'user1': 'red' });

      // Reset game state
      await service.resetGameState(testPostId);

      // Verify canvas cleared but teams preserved
      const canvas = await redis.hGetAll(`post:${testPostId}:canvas`);
      const teams = await redis.hGetAll(`post:${testPostId}:teams`);

      expect(Object.keys(canvas).length).toBe(0);
      expect(teams['user1']).toBe('red');
    });

    it('should handle complete season lifecycle', async () => {
      const testPostId = 'test-post-lifecycle';
      const testConfig = {
        teams: [
          { id: 'red', name: 'Red Team', color: '#FF0000' },
          { id: 'blue', name: 'Blue Team', color: '#0000FF' },
        ],
      };

      // Initialize
      await service.initialize();
      const season1 = await service.getCurrentSeason();
      expect(season1.seasonNumber).toBe(1);

      // Play some game
      await redis.hSet(`post:${testPostId}:canvas`, { '0:0': 'red', '1:0': 'blue' });
      await redis.hSet(`post:${testPostId}:zones`, { '0:0': 'red' });
      await redis.hSet(`post:${testPostId}:teams`, { 'player1': 'red' });

      // End season
      const history = await service.endSeason(testPostId, testConfig);
      expect(history.seasonNumber).toBe(1);
      expect(history.winningTeam.id).toBe('red');

      // Verify new season started
      const season2 = await service.getCurrentSeason();
      expect(season2.seasonNumber).toBe(2);

      // Verify game state reset
      const canvas = await redis.hGetAll(`post:${testPostId}:canvas`);
      expect(Object.keys(canvas).length).toBe(0);

      // Verify teams preserved
      const teams = await redis.hGetAll(`post:${testPostId}:teams`);
      expect(teams['player1']).toBe('red');

      // Verify history saved
      const savedHistory = await service.getSeasonHistory(1);
      expect(savedHistory).not.toBeNull();
      expect(savedHistory?.winningTeam.id).toBe('red');
    });
  });
});
