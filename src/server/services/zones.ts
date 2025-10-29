import type { RedisClient } from '@devvit/web/server';
import type { ZoneData, GameConfig, PixelData } from '../../shared/types/game';
import { RedisKeys, formatPixelKey } from '../utils/redis-keys';

/**
 * Zone control calculation service
 */
export class ZonesService {
  constructor(private redis: RedisClient) {}

  /**
   * Calculate which team controls a specific zone
   */
  calculateZoneControl(
    zoneX: number,
    zoneY: number,
    pixels: PixelData[],
    config: GameConfig
  ): ZoneData {
    const zoneSize = config.zoneSize;
    const pixelCount: Record<string, number> = {};
    
    // Count pixels in this zone by team
    for (const pixel of pixels) {
      const pixelZoneX = Math.floor(pixel.x / zoneSize);
      const pixelZoneY = Math.floor(pixel.y / zoneSize);
      
      if (pixelZoneX === zoneX && pixelZoneY === zoneY) {
        pixelCount[pixel.teamId] = (pixelCount[pixel.teamId] || 0) + 1;
      }
    }
    
    // Determine controlling team (team with most pixels)
    let controllingTeam: string | null = null;
    let maxCount = 0;
    
    for (const [teamId, count] of Object.entries(pixelCount)) {
      if (count > maxCount) {
        controllingTeam = teamId;
        maxCount = count;
      }
    }
    
    return {
      x: zoneX,
      y: zoneY,
      controllingTeam,
      pixelCount,
    };
  }

  /**
   * Calculate all zone controls for the canvas
   */
  calculateAllZones(pixels: PixelData[], config: GameConfig): ZoneData[] {
    const zoneSize = config.zoneSize;
    const zonesX = Math.ceil(config.canvasWidth / zoneSize);
    const zonesY = Math.ceil(config.canvasHeight / zoneSize);
    
    const zones: ZoneData[] = [];
    
    for (let zx = 0; zx < zonesX; zx++) {
      for (let zy = 0; zy < zonesY; zy++) {
        const zone = this.calculateZoneControl(zx, zy, pixels, config);
        zones.push(zone);
      }
    }
    
    return zones;
  }

  /**
   * Store zone control state in Redis
   */
  async storeZoneControl(postId: string, zones: ZoneData[]): Promise<void> {
    const key = RedisKeys.zoneControl(postId);
    
    // Clear existing zones
    await this.redis.del(key);
    
    // Store new zone data
    const zoneData: Record<string, string> = {};
    for (const zone of zones) {
      if (zone.controllingTeam) {
        const zoneKey = formatPixelKey(zone.x, zone.y);
        zoneData[zoneKey] = zone.controllingTeam;
      }
    }
    
    if (Object.keys(zoneData).length > 0) {
      await this.redis.hSet(key, zoneData);
    }
  }

  /**
   * Get stored zone control state
   */
  async getZoneControl(postId: string, config: GameConfig): Promise<ZoneData[]> {
    const key = RedisKeys.zoneControl(postId);
    const data = await this.redis.hGetAll(key);
    
    const zoneSize = config.zoneSize;
    const zonesX = Math.ceil(config.canvasWidth / zoneSize);
    const zonesY = Math.ceil(config.canvasHeight / zoneSize);
    
    const zones: ZoneData[] = [];
    
    for (let zx = 0; zx < zonesX; zx++) {
      for (let zy = 0; zy < zonesY; zy++) {
        const zoneKey = formatPixelKey(zx, zy);
        const controllingTeam = data[zoneKey] || null;
        
        zones.push({
          x: zx,
          y: zy,
          controllingTeam,
          pixelCount: {}, // Not stored, would need recalculation
        });
      }
    }
    
    return zones;
  }

  /**
   * Count zones controlled by each team
   */
  countZonesByTeam(zones: ZoneData[]): Record<string, number> {
    const counts: Record<string, number> = {};
    
    for (const zone of zones) {
      if (zone.controllingTeam) {
        counts[zone.controllingTeam] = (counts[zone.controllingTeam] || 0) + 1;
      }
    }
    
    return counts;
  }

  /**
   * Get zone coordinates for a pixel
   */
  getZoneForPixel(x: number, y: number, zoneSize: number): { zoneX: number; zoneY: number } {
    return {
      zoneX: Math.floor(x / zoneSize),
      zoneY: Math.floor(y / zoneSize),
    };
  }

  /**
   * Check if a pixel placement affects zone control
   */
  async updateZoneForPixel(
    postId: string,
    x: number,
    y: number,
    pixels: PixelData[],
    config: GameConfig
  ): Promise<ZoneData> {
    const { zoneX, zoneY } = this.getZoneForPixel(x, y, config.zoneSize);
    const zone = this.calculateZoneControl(zoneX, zoneY, pixels, config);
    
    // Update just this zone in Redis
    const key = RedisKeys.zoneControl(postId);
    const zoneKey = formatPixelKey(zoneX, zoneY);
    
    if (zone.controllingTeam) {
      await this.redis.hSet(key, { [zoneKey]: zone.controllingTeam });
    } else {
      await this.redis.hDel(key, [zoneKey]);
    }
    
    return zone;
  }

  /**
   * Get total number of zones
   */
  getTotalZones(config: GameConfig): number {
    const zonesX = Math.ceil(config.canvasWidth / config.zoneSize);
    const zonesY = Math.ceil(config.canvasHeight / config.zoneSize);
    return zonesX * zonesY;
  }
}
