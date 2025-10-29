import type { RedisClient } from '@devvit/web/server';
import type { GameConfig } from '../../shared/types/game';
import { RedisKeys } from '../utils/redis-keys';

export interface UserCredits {
  credits: number;
  nextCreditTime: number;
}

/**
 * User credit management service
 */
export class CreditsService {
  constructor(private redis: RedisClient) {}

  /**
   * Get user's current credits and cooldown state
   */
  async getUserCredits(postId: string, username: string, config: GameConfig): Promise<UserCredits> {
    const key = RedisKeys.userCredits(postId, username);
    const data = await this.redis.hGetAll(key);
    
    if (!data.credits) {
      // New user - initialize with default credits
      return {
        credits: config.initialCredits,
        nextCreditTime: 0,
      };
    }
    
    const credits = parseInt(data.credits);
    const nextCreditTime = parseInt(data.nextCreditTime || '0');
    
    // Check if we should regenerate credits
    const now = Date.now();
    if (credits < config.maxCredits && nextCreditTime > 0 && now >= nextCreditTime) {
      return await this.regenerateCredits(postId, username, config, credits, nextCreditTime);
    }
    
    return { credits, nextCreditTime };
  }

  /**
   * Regenerate credits based on elapsed time
   */
  private async regenerateCredits(
    postId: string,
    username: string,
    config: GameConfig,
    currentCredits: number,
    lastCreditTime: number
  ): Promise<UserCredits> {
    const now = Date.now();
    const elapsed = now - lastCreditTime;
    const creditsToAdd = Math.floor(elapsed / (config.creditCooldown * 1000));
    
    if (creditsToAdd > 0) {
      const newCredits = Math.min(currentCredits + creditsToAdd, config.maxCredits);
      const nextCreditTime = newCredits < config.maxCredits 
        ? lastCreditTime + (creditsToAdd * config.creditCooldown * 1000)
        : 0;
      
      await this.setUserCredits(postId, username, newCredits, nextCreditTime);
      return { credits: newCredits, nextCreditTime };
    }
    
    return { credits: currentCredits, nextCreditTime: lastCreditTime };
  }

  /**
   * Set user's credits and cooldown time
   */
  async setUserCredits(postId: string, username: string, credits: number, nextCreditTime: number): Promise<void> {
    const key = RedisKeys.userCredits(postId, username);
    await this.redis.hSet(key, { credits: credits.toString(), nextCreditTime: nextCreditTime.toString() });
  }

  /**
   * Deduct a credit from user and start cooldown if needed
   */
  async deductCredit(postId: string, username: string, config: GameConfig): Promise<UserCredits> {
    const current = await this.getUserCredits(postId, username, config);
    
    if (current.credits <= 0) {
      throw new Error('No credits available');
    }
    
    const newCredits = current.credits - 1;
    const now = Date.now();
    
    // Start cooldown if this is the first credit spent or if we're at max
    const nextCreditTime = current.nextCreditTime === 0 || current.credits === config.maxCredits
      ? now + (config.creditCooldown * 1000)
      : current.nextCreditTime;
    
    await this.setUserCredits(postId, username, newCredits, nextCreditTime);
    
    return { credits: newCredits, nextCreditTime };
  }

  /**
   * Initialize credits for a new user
   */
  async initializeUser(postId: string, username: string, config: GameConfig): Promise<void> {
    const key = RedisKeys.userCredits(postId, username);
    const exists = await this.redis.exists(key);
    
    if (!exists) {
      await this.setUserCredits(postId, username, config.initialCredits, 0);
    }
  }

  /**
   * Check if user has credits available
   */
  async hasCredits(postId: string, username: string, config: GameConfig): Promise<boolean> {
    const { credits } = await this.getUserCredits(postId, username, config);
    return credits > 0;
  }

  /**
   * Get time remaining until next credit (in milliseconds)
   */
  async getTimeUntilNextCredit(postId: string, username: string, config: GameConfig): Promise<number> {
    const { credits, nextCreditTime } = await this.getUserCredits(postId, username, config);
    
    if (credits >= config.maxCredits) {
      return 0; // At max credits
    }
    
    if (nextCreditTime === 0) {
      return 0; // No cooldown active
    }
    
    const now = Date.now();
    return Math.max(0, nextCreditTime - now);
  }
}
