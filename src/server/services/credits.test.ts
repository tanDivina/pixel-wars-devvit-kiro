import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CreditsService } from './credits';
import type { GameConfig } from '../../shared/types/game';

const createMockRedis = () => ({
  hGetAll: vi.fn(),
  hSet: vi.fn(),
  exists: vi.fn(),
});

const mockConfig: GameConfig = {
  canvasWidth: 100,
  canvasHeight: 100,
  creditCooldown: 120,
  maxCredits: 10,
  initialCredits: 5,
  zoneSize: 10,
  teams: [],
};

describe('CreditsService', () => {
  let mockRedis: ReturnType<typeof createMockRedis>;
  let service: CreditsService;
  const postId = 'test-post';
  const username = 'testuser';

  beforeEach(() => {
    mockRedis = createMockRedis();
    service = new CreditsService(mockRedis as any);
    vi.clearAllMocks();
  });

  describe('getUserCredits', () => {
    it('should return initial credits for new user', async () => {
      mockRedis.hGetAll.mockResolvedValue({});
      
      const result = await service.getUserCredits(postId, username, mockConfig);
      
      expect(result).toEqual({
        credits: 5,
        nextCreditTime: 0,
      });
    });

    it('should return stored credits', async () => {
      mockRedis.hGetAll.mockResolvedValue({
        credits: '3',
        nextCreditTime: '1000',
      });
      
      const result = await service.getUserCredits(postId, username, mockConfig);
      
      expect(result).toEqual({
        credits: 3,
        nextCreditTime: 1000,
      });
    });

    it('should regenerate credits if cooldown expired', async () => {
      const now = Date.now();
      const pastTime = now - 130000; // 130 seconds ago (> 120 second cooldown)
      
      vi.spyOn(Date, 'now').mockReturnValue(now);
      mockRedis.hGetAll.mockResolvedValue({
        credits: '3',
        nextCreditTime: pastTime.toString(),
      });
      
      const result = await service.getUserCredits(postId, username, mockConfig);
      
      expect(result.credits).toBe(4); // Should have regenerated 1 credit
      expect(mockRedis.hSet).toHaveBeenCalled();
    });
  });

  describe('setUserCredits', () => {
    it('should set credits and cooldown time', async () => {
      await service.setUserCredits(postId, username, 5, 1000);
      
      expect(mockRedis.hSet).toHaveBeenCalledWith(
        'post:test-post:user:testuser:credits',
        'credits',
        '5'
      );
      expect(mockRedis.hSet).toHaveBeenCalledWith(
        'post:test-post:user:testuser:credits',
        'nextCreditTime',
        '1000'
      );
    });
  });

  describe('deductCredit', () => {
    it('should deduct credit and start cooldown', async () => {
      const now = Date.now();
      vi.spyOn(Date, 'now').mockReturnValue(now);
      
      mockRedis.hGetAll.mockResolvedValue({
        credits: '5',
        nextCreditTime: '0',
      });
      
      const result = await service.deductCredit(postId, username, mockConfig);
      
      expect(result.credits).toBe(4);
      expect(result.nextCreditTime).toBe(now + 120000);
      expect(mockRedis.hSet).toHaveBeenCalled();
    });

    it('should throw error when no credits available', async () => {
      mockRedis.hGetAll.mockResolvedValue({
        credits: '0',
        nextCreditTime: '1000',
      });
      
      await expect(service.deductCredit(postId, username, mockConfig)).rejects.toThrow(
        'No credits available'
      );
    });

    it('should maintain existing cooldown when deducting', async () => {
      const existingCooldown = 5000;
      mockRedis.hGetAll.mockResolvedValue({
        credits: '3',
        nextCreditTime: existingCooldown.toString(),
      });
      
      const result = await service.deductCredit(postId, username, mockConfig);
      
      expect(result.credits).toBe(2);
      expect(result.nextCreditTime).toBe(existingCooldown);
    });
  });

  describe('initializeUser', () => {
    it('should initialize new user with default credits', async () => {
      mockRedis.exists.mockResolvedValue(false);
      
      await service.initializeUser(postId, username, mockConfig);
      
      expect(mockRedis.hSet).toHaveBeenCalledWith(
        'post:test-post:user:testuser:credits',
        'credits',
        '5'
      );
    });

    it('should not reinitialize existing user', async () => {
      mockRedis.exists.mockResolvedValue(true);
      
      await service.initializeUser(postId, username, mockConfig);
      
      expect(mockRedis.hSet).not.toHaveBeenCalled();
    });
  });

  describe('hasCredits', () => {
    it('should return true when user has credits', async () => {
      mockRedis.hGetAll.mockResolvedValue({
        credits: '3',
        nextCreditTime: '0',
      });
      
      const result = await service.hasCredits(postId, username, mockConfig);
      
      expect(result).toBe(true);
    });

    it('should return false when user has no credits', async () => {
      mockRedis.hGetAll.mockResolvedValue({
        credits: '0',
        nextCreditTime: '1000',
      });
      
      const result = await service.hasCredits(postId, username, mockConfig);
      
      expect(result).toBe(false);
    });
  });

  describe('getTimeUntilNextCredit', () => {
    it('should return 0 when at max credits', async () => {
      mockRedis.hGetAll.mockResolvedValue({
        credits: '10',
        nextCreditTime: '0',
      });
      
      const result = await service.getTimeUntilNextCredit(postId, username, mockConfig);
      
      expect(result).toBe(0);
    });

    it('should return time remaining', async () => {
      const now = Date.now();
      const futureTime = now + 60000; // 60 seconds from now
      
      vi.spyOn(Date, 'now').mockReturnValue(now);
      mockRedis.hGetAll.mockResolvedValue({
        credits: '3',
        nextCreditTime: futureTime.toString(),
      });
      
      const result = await service.getTimeUntilNextCredit(postId, username, mockConfig);
      
      expect(result).toBe(60000);
    });

    it('should return 0 when cooldown has passed', async () => {
      const now = Date.now();
      const pastTime = now - 10000;
      
      vi.spyOn(Date, 'now').mockReturnValue(now);
      mockRedis.hGetAll.mockResolvedValue({
        credits: '3',
        nextCreditTime: pastTime.toString(),
      });
      
      const result = await service.getTimeUntilNextCredit(postId, username, mockConfig);
      
      expect(result).toBe(0);
    });
  });
});
