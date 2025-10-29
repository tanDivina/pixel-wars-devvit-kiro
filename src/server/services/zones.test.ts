import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ZonesService } from './zones';
import type { GameConfig, PixelData } from '../../shared/types/game';

const createMockRedis = () => ({
  hSet: vi.fn(),
  hGetAll: vi.fn(),
  hDel: vi.fn(),
  del: vi.fn(),
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
  ],
};

describe('ZonesService', () => {
  let mockRedis: ReturnType<typeof createMockRedis>;
  let service: ZonesService;
  const postId = 'test-post';

  beforeEach(() => {
    mockRedis = createMockRedis();
    service = new ZonesService(mockRedis as any);
    vi.clearAllMocks();
  });

  describe('calculateZoneControl', () => {
    it('should determine controlling team by majority', () => {
      const pixels: PixelData[] = [
        { x: 5, y: 5, teamId: 'red', timestamp: 1000 },
        { x: 6, y: 6, teamId: 'red', timestamp: 1001 },
        { x: 7, y: 7, teamId: 'blue', timestamp: 1002 },
      ];
      
      const result = service.calculateZoneControl(0, 0, pixels, mockConfig);
      
      expect(result).toEqual({
        x: 0,
        y: 0,
        controllingTeam: 'red',
        pixelCount: {
          red: 2,
          blue: 1,
        },
      });
    });

    it('should return null for empty zone', () => {
      const pixels: PixelData[] = [];
      
      const result = service.calculateZoneControl(0, 0, pixels, mockConfig);
      
      expect(result).toEqual({
        x: 0,
        y: 0,
        controllingTeam: null,
        pixelCount: {},
      });
    });

    it('should only count pixels in the specified zone', () => {
      const pixels: PixelData[] = [
        { x: 5, y: 5, teamId: 'red', timestamp: 1000 }, // Zone 0,0
        { x: 15, y: 15, teamId: 'blue', timestamp: 1001 }, // Zone 1,1
        { x: 6, y: 6, teamId: 'red', timestamp: 1002 }, // Zone 0,0
      ];
      
      const result = service.calculateZoneControl(0, 0, pixels, mockConfig);
      
      expect(result.pixelCount).toEqual({
        red: 2,
      });
      expect(result.controllingTeam).toBe('red');
    });
  });

  describe('calculateAllZones', () => {
    it('should calculate all zones for canvas', () => {
      const pixels: PixelData[] = [
        { x: 5, y: 5, teamId: 'red', timestamp: 1000 },
        { x: 15, y: 15, teamId: 'blue', timestamp: 1001 },
      ];
      
      const result = service.calculateAllZones(pixels, mockConfig);
      
      // 100x100 canvas with 10x10 zones = 10x10 = 100 zones
      expect(result).toHaveLength(100);
      
      // Check specific zones
      const zone00 = result.find((z) => z.x === 0 && z.y === 0);
      expect(zone00?.controllingTeam).toBe('red');
      
      const zone11 = result.find((z) => z.x === 1 && z.y === 1);
      expect(zone11?.controllingTeam).toBe('blue');
    });
  });

  describe('storeZoneControl', () => {
    it('should store zone control in Redis', async () => {
      const zones = [
        { x: 0, y: 0, controllingTeam: 'red', pixelCount: { red: 5 } },
        { x: 1, y: 1, controllingTeam: 'blue', pixelCount: { blue: 3 } },
        { x: 2, y: 2, controllingTeam: null, pixelCount: {} },
      ];
      
      await service.storeZoneControl(postId, zones);
      
      expect(mockRedis.del).toHaveBeenCalledWith('post:test-post:zones');
      expect(mockRedis.hSet).toHaveBeenCalledWith('post:test-post:zones', '0:0', 'red');
      expect(mockRedis.hSet).toHaveBeenCalledWith('post:test-post:zones', '1:1', 'blue');
      expect(mockRedis.hSet).toHaveBeenCalledTimes(2); // Only controlled zones
    });
  });

  describe('getZoneControl', () => {
    it('should retrieve zone control from Redis', async () => {
      mockRedis.hGetAll.mockResolvedValue({
        '0:0': 'red',
        '1:1': 'blue',
      });
      
      const result = await service.getZoneControl(postId, mockConfig);
      
      expect(result).toHaveLength(100); // All zones
      
      const zone00 = result.find((z) => z.x === 0 && z.y === 0);
      expect(zone00?.controllingTeam).toBe('red');
      
      const zone11 = result.find((z) => z.x === 1 && z.y === 1);
      expect(zone11?.controllingTeam).toBe('blue');
      
      const zone22 = result.find((z) => z.x === 2 && z.y === 2);
      expect(zone22?.controllingTeam).toBeNull();
    });
  });

  describe('countZonesByTeam', () => {
    it('should count zones by controlling team', () => {
      const zones = [
        { x: 0, y: 0, controllingTeam: 'red', pixelCount: {} },
        { x: 1, y: 1, controllingTeam: 'red', pixelCount: {} },
        { x: 2, y: 2, controllingTeam: 'blue', pixelCount: {} },
        { x: 3, y: 3, controllingTeam: null, pixelCount: {} },
      ];
      
      const result = service.countZonesByTeam(zones);
      
      expect(result).toEqual({
        red: 2,
        blue: 1,
      });
    });
  });

  describe('getZoneForPixel', () => {
    it('should calculate zone coordinates for pixel', () => {
      expect(service.getZoneForPixel(5, 5, 10)).toEqual({ zoneX: 0, zoneY: 0 });
      expect(service.getZoneForPixel(15, 25, 10)).toEqual({ zoneX: 1, zoneY: 2 });
      expect(service.getZoneForPixel(99, 99, 10)).toEqual({ zoneX: 9, zoneY: 9 });
    });
  });

  describe('updateZoneForPixel', () => {
    it('should update zone control for affected zone', async () => {
      const pixels: PixelData[] = [
        { x: 5, y: 5, teamId: 'red', timestamp: 1000 },
        { x: 6, y: 6, teamId: 'red', timestamp: 1001 },
      ];
      
      const result = await service.updateZoneForPixel(postId, 5, 5, pixels, mockConfig);
      
      expect(result.x).toBe(0);
      expect(result.y).toBe(0);
      expect(result.controllingTeam).toBe('red');
      expect(mockRedis.hSet).toHaveBeenCalledWith('post:test-post:zones', '0:0', 'red');
    });

    it('should remove zone control if no team has majority', async () => {
      const pixels: PixelData[] = [];
      
      await service.updateZoneForPixel(postId, 5, 5, pixels, mockConfig);
      
      expect(mockRedis.hDel).toHaveBeenCalledWith('post:test-post:zones', '0:0');
    });
  });

  describe('getTotalZones', () => {
    it('should calculate total number of zones', () => {
      const result = service.getTotalZones(mockConfig);
      
      expect(result).toBe(100); // 10x10 zones
    });

    it('should handle non-divisible canvas sizes', () => {
      const config = { ...mockConfig, canvasWidth: 95, canvasHeight: 105 };
      const result = service.getTotalZones(config);
      
      expect(result).toBe(110); // 10 x 11 zones (rounded up)
    });
  });
});
