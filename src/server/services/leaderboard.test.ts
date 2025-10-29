import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LeaderboardService } from './leaderboard';

const createMockRedis = () => ({
  zAdd: vi.fn(),
  zIncrBy: vi.fn(),
  zRange: vi.fn(),
  zRevRank: vi.fn(),
  zScore: vi.fn(),
  hGet: vi.fn(),
  hGetAll: vi.fn(),
  del: vi.fn(),
});

describe('LeaderboardService', () => {
  let mockRedis: ReturnType<typeof createMockRedis>;
  let service: LeaderboardService;
  const postId = 'test-post';

  beforeEach(() => {
    mockRedis = createMockRedis();
    service = new LeaderboardService(mockRedis as any);
    vi.clearAllMocks();
  });

  describe('updatePlayerScore', () => {
    it('should update player score in leaderboard', async () => {
      await service.updatePlayerScore(postId, 'user1', 42);
      
      expect(mockRedis.zAdd).toHaveBeenCalledWith(
        'post:test-post:leaderboard:players',
        { member: 'user1', score: 42 }
      );
    });
  });

  describe('incrementPlayerScore', () => {
    it('should increment player score by 1', async () => {
      mockRedis.zIncrBy.mockResolvedValue(43);
      
      const result = await service.incrementPlayerScore(postId, 'user1');
      
      expect(result).toBe(43);
      expect(mockRedis.zIncrBy).toHaveBeenCalledWith(
        'post:test-post:leaderboard:players',
        'user1',
        1
      );
    });
  });

  describe('getTopPlayers', () => {
    it('should return top players with rankings', async () => {
      mockRedis.zRange.mockResolvedValue([
        { member: 'user1', score: 100 },
        { member: 'user2', score: 80 },
        { member: 'user3', score: 60 },
      ]);
      mockRedis.hGet
        .mockResolvedValueOnce('red')
        .mockResolvedValueOnce('blue')
        .mockResolvedValueOnce('red');
      
      const result = await service.getTopPlayers(postId, 10);
      
      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({
        username: 'user1',
        pixelsPlaced: 100,
        rank: 1,
        team: 'red',
      });
      expect(result[1]).toEqual({
        username: 'user2',
        pixelsPlaced: 80,
        rank: 2,
        team: 'blue',
      });
      expect(mockRedis.zRange).toHaveBeenCalledWith(
        'post:test-post:leaderboard:players',
        0,
        9,
        { by: 'rank', reverse: true }
      );
    });

    it('should handle empty leaderboard', async () => {
      mockRedis.zRange.mockResolvedValue([]);
      
      const result = await service.getTopPlayers(postId, 10);
      
      expect(result).toEqual([]);
    });
  });

  describe('getPlayerRank', () => {
    it('should return player rank and score', async () => {
      mockRedis.zRevRank.mockResolvedValue(5); // 0-based rank
      mockRedis.zScore.mockResolvedValue(42);
      
      const result = await service.getPlayerRank(postId, 'user1');
      
      expect(result).toEqual({
        rank: 6, // 1-based rank
        score: 42,
      });
    });

    it('should return 0 for unranked player', async () => {
      mockRedis.zRevRank.mockResolvedValue(null);
      mockRedis.zScore.mockResolvedValue(null);
      
      const result = await service.getPlayerRank(postId, 'newuser');
      
      expect(result).toEqual({
        rank: 0,
        score: 0,
      });
    });
  });

  describe('calculateTeamRankings', () => {
    it('should calculate and sort team rankings', async () => {
      const teamZoneCounts = {
        red: 10,
        blue: 15,
        green: 8,
      };
      const teamPixelCounts = {
        red: 100,
        blue: 120,
        green: 80,
      };
      
      const result = await service.calculateTeamRankings(postId, teamZoneCounts, teamPixelCounts);
      
      expect(result).toHaveLength(3);
      expect(result[0]).toMatchObject({
        teamId: 'blue',
        zonesControlled: 15,
        totalPixels: 120,
        rank: 1,
      });
      expect(result[1]).toMatchObject({
        teamId: 'red',
        zonesControlled: 10,
        totalPixels: 100,
        rank: 2,
      });
      expect(result[2]).toMatchObject({
        teamId: 'green',
        zonesControlled: 8,
        totalPixels: 80,
        rank: 3,
      });
    });

    it('should use total pixels as tiebreaker', async () => {
      const teamZoneCounts = {
        red: 10,
        blue: 10,
      };
      const teamPixelCounts = {
        red: 100,
        blue: 120,
      };
      
      const result = await service.calculateTeamRankings(postId, teamZoneCounts, teamPixelCounts);
      
      expect(result[0].teamId).toBe('blue'); // Higher pixels
      expect(result[1].teamId).toBe('red');
    });
  });

  describe('getTeamPlayerScores', () => {
    it('should sum scores for team players', async () => {
      mockRedis.zRange.mockResolvedValue([
        { member: 'user1', score: 50 },
        { member: 'user2', score: 30 },
        { member: 'user3', score: 20 },
      ]);
      mockRedis.hGet
        .mockResolvedValueOnce('red')
        .mockResolvedValueOnce('red')
        .mockResolvedValueOnce('blue');
      
      const result = await service.getTeamPlayerScores(postId, 'red');
      
      expect(result).toBe(80); // 50 + 30
    });
  });

  describe('getTeamPlayerCount', () => {
    it('should count players in team', async () => {
      mockRedis.hGetAll.mockResolvedValue({
        user1: 'red',
        user2: 'red',
        user3: 'blue',
        user4: 'red',
      });
      
      const result = await service.getTeamPlayerCount(postId, 'red');
      
      expect(result).toBe(3);
    });
  });

  describe('clearLeaderboard', () => {
    it('should delete leaderboard', async () => {
      await service.clearLeaderboard(postId);
      
      expect(mockRedis.del).toHaveBeenCalledWith('post:test-post:leaderboard:players');
    });
  });
});
