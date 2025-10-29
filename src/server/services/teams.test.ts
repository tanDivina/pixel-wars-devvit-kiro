import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TeamsService } from './teams';
import type { GameConfig } from '../../shared/types/game';

const createMockRedis = () => ({
  hGet: vi.fn(),
  hSet: vi.fn(),
  hGetAll: vi.fn(),
});

const mockConfig: GameConfig = {
  canvasWidth: 100,
  canvasHeight: 100,
  creditCooldown: 120,
  maxCredits: 10,
  initialCredits: 5,
  zoneSize: 10,
  teams: [
    { id: 'red', name: 'Red Team', color: '#FF0000' },
    { id: 'blue', name: 'Blue Team', color: '#0000FF' },
    { id: 'green', name: 'Green Team', color: '#00FF00' },
  ],
};

describe('TeamsService', () => {
  let mockRedis: ReturnType<typeof createMockRedis>;
  let service: TeamsService;
  const postId = 'test-post';

  beforeEach(() => {
    mockRedis = createMockRedis();
    service = new TeamsService(mockRedis as any);
    vi.clearAllMocks();
  });

  describe('getUserTeam', () => {
    it('should return existing team for user', async () => {
      mockRedis.hGet.mockResolvedValue('red');
      
      const result = await service.getUserTeam(postId, 'user1', mockConfig);
      
      expect(result).toEqual({
        id: 'red',
        name: 'Red Team',
        color: '#FF0000',
      });
      expect(mockRedis.hGet).toHaveBeenCalledWith('post:test-post:teams', 'user1');
    });

    it('should assign team for new user', async () => {
      mockRedis.hGet.mockResolvedValue(null);
      mockRedis.hGetAll.mockResolvedValue({
        user2: 'red',
        user3: 'red',
        user4: 'blue',
      });
      
      const result = await service.getUserTeam(postId, 'user1', mockConfig);
      
      // Should assign to green (smallest team with 0 members)
      expect(result.id).toBe('green');
      expect(mockRedis.hSet).toHaveBeenCalledWith('post:test-post:teams', { 'user1': 'green' });
    });
  });

  describe('assignTeam', () => {
    it('should assign team based on user hint matching team name', async () => {
      mockRedis.hGetAll.mockResolvedValue({});
      
      const teamId = await service.assignTeam(postId, 'user1', mockConfig, 'Red Team');
      
      expect(teamId).toBe('red');
      expect(mockRedis.hSet).toHaveBeenCalledWith('post:test-post:teams', { 'user1': 'red' });
    });

    it('should assign team based on user hint matching team ID', async () => {
      mockRedis.hGetAll.mockResolvedValue({});
      
      const teamId = await service.assignTeam(postId, 'user1', mockConfig, 'blue');
      
      expect(teamId).toBe('blue');
      expect(mockRedis.hSet).toHaveBeenCalledWith('post:test-post:teams', { 'user1': 'blue' });
    });

    it('should assign team based on partial hint match', async () => {
      mockRedis.hGetAll.mockResolvedValue({});
      
      const teamId = await service.assignTeam(postId, 'user1', mockConfig, 'green');
      
      expect(teamId).toBe('green');
      expect(mockRedis.hSet).toHaveBeenCalledWith('post:test-post:teams', { 'user1': 'green' });
    });

    it('should fall back to balanced assignment when hint does not match', async () => {
      mockRedis.hGetAll.mockResolvedValue({
        user2: 'red',
        user3: 'red',
        user4: 'blue',
      });
      
      const teamId = await service.assignTeam(postId, 'user1', mockConfig, 'invalid-hint');
      
      // Should assign to green (smallest team with 0 members)
      expect(teamId).toBe('green');
      expect(mockRedis.hSet).toHaveBeenCalledWith('post:test-post:teams', { 'user1': 'green' });
    });

    it('should use balanced assignment when no hint provided', async () => {
      mockRedis.hGetAll.mockResolvedValue({
        user2: 'red',
        user3: 'blue',
        user4: 'blue',
      });
      
      const teamId = await service.assignTeam(postId, 'user1', mockConfig);
      
      // Should assign to green (smallest team with 0 members)
      expect(teamId).toBe('green');
      expect(mockRedis.hSet).toHaveBeenCalledWith('post:test-post:teams', { 'user1': 'green' });
    });

    it('should balance teams evenly', async () => {
      mockRedis.hGetAll.mockResolvedValue({
        user2: 'red',
        user3: 'blue',
        user4: 'green',
      });
      
      const teamId = await service.assignTeam(postId, 'user1', mockConfig);
      
      // All teams have 1 member, should assign to first team (red)
      expect(teamId).toBe('red');
    });
  });

  describe('setUserTeam', () => {
    it('should set user team', async () => {
      await service.setUserTeam(postId, 'user1', 'red');
      
      expect(mockRedis.hSet).toHaveBeenCalledWith('post:test-post:teams', { 'user1': 'red' });
    });
  });

  describe('getTeamSizes', () => {
    it('should return team sizes', async () => {
      mockRedis.hGetAll.mockResolvedValue({
        user1: 'red',
        user2: 'red',
        user3: 'blue',
        user4: 'red',
        user5: 'green',
      });
      
      const result = await service.getTeamSizes(postId, mockConfig);
      
      expect(result).toEqual({
        red: 3,
        blue: 1,
        green: 1,
      });
    });

    it('should return 0 for teams with no members', async () => {
      mockRedis.hGetAll.mockResolvedValue({});
      
      const result = await service.getTeamSizes(postId, mockConfig);
      
      expect(result).toEqual({
        red: 0,
        blue: 0,
        green: 0,
      });
    });
  });

  describe('getTeamById', () => {
    it('should return team by ID', () => {
      const result = service.getTeamById('blue', mockConfig);
      
      expect(result).toEqual({
        id: 'blue',
        name: 'Blue Team',
        color: '#0000FF',
      });
    });

    it('should return first team if ID not found', () => {
      const result = service.getTeamById('invalid', mockConfig);
      
      expect(result).toEqual({
        id: 'red',
        name: 'Red Team',
        color: '#FF0000',
      });
    });
  });

  describe('getAllTeamAssignments', () => {
    it('should return all assignments', async () => {
      const assignments = {
        user1: 'red',
        user2: 'blue',
        user3: 'green',
      };
      mockRedis.hGetAll.mockResolvedValue(assignments);
      
      const result = await service.getAllTeamAssignments(postId);
      
      expect(result).toEqual(assignments);
    });
  });

  describe('getTeamMembers', () => {
    it('should return members of a team', async () => {
      mockRedis.hGetAll.mockResolvedValue({
        user1: 'red',
        user2: 'blue',
        user3: 'red',
        user4: 'green',
        user5: 'red',
      });
      
      const result = await service.getTeamMembers(postId, 'red');
      
      expect(result).toEqual(['user1', 'user3', 'user5']);
    });

    it('should return empty array for team with no members', async () => {
      mockRedis.hGetAll.mockResolvedValue({
        user1: 'red',
        user2: 'blue',
      });
      
      const result = await service.getTeamMembers(postId, 'green');
      
      expect(result).toEqual([]);
    });
  });

  describe('isUserOnTeam', () => {
    it('should return true if user is on team', async () => {
      mockRedis.hGet.mockResolvedValue('red');
      
      const result = await service.isUserOnTeam(postId, 'user1', 'red');
      
      expect(result).toBe(true);
    });

    it('should return false if user is on different team', async () => {
      mockRedis.hGet.mockResolvedValue('blue');
      
      const result = await service.isUserOnTeam(postId, 'user1', 'red');
      
      expect(result).toBe(false);
    });

    it('should return false if user has no team', async () => {
      mockRedis.hGet.mockResolvedValue(null);
      
      const result = await service.isUserOnTeam(postId, 'user1', 'red');
      
      expect(result).toBe(false);
    });
  });

  describe('getTeamStats', () => {
    it('should return stats for all teams', async () => {
      mockRedis.hGetAll.mockResolvedValue({
        user1: 'red',
        user2: 'red',
        user3: 'blue',
      });
      
      const result = await service.getTeamStats(postId, mockConfig);
      
      expect(result).toEqual({
        red: {
          size: 2,
          team: { id: 'red', name: 'Red Team', color: '#FF0000' },
        },
        blue: {
          size: 1,
          team: { id: 'blue', name: 'Blue Team', color: '#0000FF' },
        },
        green: {
          size: 0,
          team: { id: 'green', name: 'Green Team', color: '#00FF00' },
        },
      });
    });
  });

  describe('Team Assignment Integration', () => {
    it('should assign teams to multiple users with balancing', async () => {
      mockRedis.hGet.mockResolvedValue(null);
      mockRedis.hGetAll
        .mockResolvedValueOnce({}) // First user
        .mockResolvedValueOnce({ user1: 'red' }) // Second user
        .mockResolvedValueOnce({ user1: 'red', user2: 'blue' }); // Third user
      
      const team1 = await service.getUserTeam(postId, 'user1', mockConfig);
      const team2 = await service.getUserTeam(postId, 'user2', mockConfig);
      const team3 = await service.getUserTeam(postId, 'user3', mockConfig);
      
      // Should distribute across teams
      expect([team1.id, team2.id, team3.id]).toContain('red');
      expect([team1.id, team2.id, team3.id]).toContain('blue');
      expect([team1.id, team2.id, team3.id]).toContain('green');
    });

    it('should maintain team assignment across multiple calls', async () => {
      mockRedis.hGet.mockResolvedValue('red');
      
      const team1 = await service.getUserTeam(postId, 'user1', mockConfig);
      const team2 = await service.getUserTeam(postId, 'user1', mockConfig);
      
      expect(team1.id).toBe('red');
      expect(team2.id).toBe('red');
      expect(mockRedis.hSet).not.toHaveBeenCalled();
    });

    it('should support different team configurations per post', async () => {
      const postId1 = 'post1';
      const postId2 = 'post2';
      
      mockRedis.hGet.mockResolvedValue(null);
      mockRedis.hGetAll.mockResolvedValue({});
      
      await service.getUserTeam(postId1, 'user1', mockConfig);
      await service.getUserTeam(postId2, 'user1', mockConfig);
      
      expect(mockRedis.hGet).toHaveBeenCalledWith('post:post1:teams', 'user1');
      expect(mockRedis.hGet).toHaveBeenCalledWith('post:post2:teams', 'user1');
    });
  });
});
