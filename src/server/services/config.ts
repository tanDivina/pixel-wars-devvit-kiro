import type { RedisClient } from '@devvit/web/server';
import type { GameConfig } from '../../shared/types/game';
import { RedisKeys } from '../utils/redis-keys';
import { DEFAULT_CONFIG } from '../../shared/constants/config';

/**
 * Game configuration management service
 */
export class ConfigService {
  constructor(private redis: RedisClient) {}

  /**
   * Get game configuration for a post
   */
  async getConfig(postId: string): Promise<GameConfig> {
    const key = RedisKeys.config(postId);
    const data = await this.redis.hGetAll(key);
    
    if (!data.canvasWidth) {
      // No config exists, return default
      return DEFAULT_CONFIG;
    }
    
    // Parse stored config
    return {
      canvasWidth: parseInt(data.canvasWidth || '100'),
      canvasHeight: parseInt(data.canvasHeight || '100'),
      creditCooldown: parseInt(data.creditCooldown || '120'),
      maxCredits: parseInt(data.maxCredits || '10'),
      initialCredits: parseInt(data.initialCredits || '5'),
      zoneSize: parseInt(data.zoneSize || '10'),
      teams: DEFAULT_CONFIG.teams, // Teams are static
    };
  }

  /**
   * Initialize configuration for a new post
   */
  async initializeConfig(postId: string, config: GameConfig = DEFAULT_CONFIG): Promise<void> {
    const key = RedisKeys.config(postId);
    
    await this.redis.hSet(key, {
      canvasWidth: config.canvasWidth.toString(),
      canvasHeight: config.canvasHeight.toString(),
      creditCooldown: config.creditCooldown.toString(),
      maxCredits: config.maxCredits.toString(),
      initialCredits: config.initialCredits.toString(),
      zoneSize: config.zoneSize.toString(),
    });
  }

  /**
   * Update configuration
   */
  async updateConfig(postId: string, config: Partial<GameConfig>): Promise<void> {
    const key = RedisKeys.config(postId);
    const updates: Record<string, string> = {};
    
    if (config.canvasWidth !== undefined) {
      updates.canvasWidth = config.canvasWidth.toString();
    }
    if (config.canvasHeight !== undefined) {
      updates.canvasHeight = config.canvasHeight.toString();
    }
    if (config.creditCooldown !== undefined) {
      updates.creditCooldown = config.creditCooldown.toString();
    }
    if (config.maxCredits !== undefined) {
      updates.maxCredits = config.maxCredits.toString();
    }
    if (config.initialCredits !== undefined) {
      updates.initialCredits = config.initialCredits.toString();
    }
    if (config.zoneSize !== undefined) {
      updates.zoneSize = config.zoneSize.toString();
    }
    
    if (Object.keys(updates).length > 0) {
      await this.redis.hSet(key, updates);
    }
  }
}
