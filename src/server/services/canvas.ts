import type { RedisClient } from '@devvit/web/server';
import type { PixelData } from '../../shared/types/game';
import { RedisKeys, formatPixelKey, formatPixelUpdate, parsePixelUpdate } from '../utils/redis-keys';

/**
 * Canvas state management service
 */
export class CanvasService {
  constructor(private redis: RedisClient) {}

  /**
   * Get a single pixel from the canvas
   */
  async getPixel(postId: string, x: number, y: number): Promise<string | null> {
    const key = RedisKeys.canvas(postId);
    const pixelKey = formatPixelKey(x, y);
    return await this.redis.hGet(key, pixelKey);
  }

  /**
   * Set a pixel on the canvas
   */
  async setPixel(postId: string, x: number, y: number, teamId: string): Promise<void> {
    const timestamp = Date.now();
    const canvasKey = RedisKeys.canvas(postId);
    const updatesKey = RedisKeys.canvasUpdates(postId);
    const pixelKey = formatPixelKey(x, y);
    const updateValue = formatPixelUpdate(x, y, teamId);

    // Update canvas state and log the change
    await this.redis.hSet(canvasKey, { [pixelKey]: teamId });
    await this.redis.zAdd(updatesKey, { member: updateValue, score: timestamp });
  }

  /**
   * Get all pixels on the canvas
   */
  async getAllPixels(postId: string): Promise<PixelData[]> {
    const key = RedisKeys.canvas(postId);
    const data = await this.redis.hGetAll(key);
    
    const pixels: PixelData[] = [];
    for (const [coordKey, teamId] of Object.entries(data)) {
      const [x, y] = coordKey.split(':').map(Number);
      pixels.push({
        x,
        y,
        teamId,
        timestamp: 0, // Historical timestamp not stored in main canvas
      });
    }
    
    return pixels;
  }

  /**
   * Get canvas updates since a specific timestamp
   */
  async getUpdatesSince(postId: string, since: number): Promise<PixelData[]> {
    const key = RedisKeys.canvasUpdates(postId);
    // Get all recent updates (last 1000)
    const updates = await this.redis.zRange(key, -1000, -1, { by: 'rank' });
    
    const pixels: PixelData[] = [];
    for (const update of updates) {
      if (update.score > since) {
        const { x, y, teamId } = parsePixelUpdate(update.member);
        pixels.push({ x, y, teamId, timestamp: update.score });
      }
    }
    
    return pixels;
  }

  /**
   * Get the total number of pixels on the canvas
   */
  async getPixelCount(postId: string): Promise<number> {
    const key = RedisKeys.canvas(postId);
    return await this.redis.hLen(key);
  }

  /**
   * Get pixel count by team
   */
  async getPixelCountByTeam(postId: string): Promise<Record<string, number>> {
    const pixels = await this.getAllPixels(postId);
    const counts: Record<string, number> = {};
    
    for (const pixel of pixels) {
      counts[pixel.teamId] = (counts[pixel.teamId] || 0) + 1;
    }
    
    return counts;
  }

  /**
   * Clear old updates from the log (keep last 24 hours)
   */
  async pruneOldUpdates(postId: string, olderThan: number = 86400000): Promise<void> {
    const key = RedisKeys.canvasUpdates(postId);
    const cutoff = Date.now() - olderThan;
    await this.redis.zRemRangeByScore(key, '-inf', cutoff);
  }
}
