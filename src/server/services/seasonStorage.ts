/**
 * Season Storage Service
 * 
 * Handles all Redis operations for the season system including
 * storing and retrieving season metadata, settings, and history.
 */

import type { RedisClient } from '@devvit/web/server';
import type {
  SeasonMetadata,
  SeasonSettings,
  SeasonHistory,
  SeasonJobs,
} from '../../shared/types/season.js';
import {
  SEASON_KEYS,
  getSeasonHistoryKey,
  getSeasonJobsKey,
  isValidSeasonNumber,
} from '../utils/season-redis-keys.js';

/**
 * Default season settings
 */
export const DEFAULT_SEASON_SETTINGS: SeasonSettings = {
  durationMs: 7 * 24 * 60 * 60 * 1000, // 7 days
  enableAutoPosts: true,
  enable24hWarning: true,
  enable1hWarning: true,
};

/**
 * Maximum number of seasons to keep in history
 */
export const MAX_SEASON_HISTORY = 10;

/**
 * Lock TTL in milliseconds (60 seconds)
 */
export const LOCK_TTL_MS = 60000;

export class SeasonStorageService {
  constructor(private redis: RedisClient) {}

  /**
   * Get current season metadata
   * @returns Current season metadata or null if not exists
   */
  async getCurrentSeason(): Promise<SeasonMetadata | null> {
    try {
      const data = await this.redis.get(SEASON_KEYS.CURRENT);
      if (!data) {
        return null;
      }
      return JSON.parse(data) as SeasonMetadata;
    } catch (error) {
      console.error('Failed to get current season:', error);
      throw new Error('Failed to retrieve current season data');
    }
  }

  /**
   * Save current season metadata
   * @param season - Season metadata to save
   */
  async setCurrentSeason(season: SeasonMetadata): Promise<void> {
    try {
      if (!isValidSeasonNumber(season.seasonNumber)) {
        throw new Error('Invalid season number');
      }
      await this.redis.set(SEASON_KEYS.CURRENT, JSON.stringify(season));
    } catch (error) {
      console.error('Failed to set current season:', error);
      // Re-throw validation errors as-is, wrap Redis errors
      if (error instanceof Error && error.message === 'Invalid season number') {
        throw error;
      }
      throw new Error('Failed to save current season data');
    }
  }

  /**
   * Get season settings
   * @returns Season settings or default settings if not exists
   */
  async getSettings(): Promise<SeasonSettings> {
    try {
      const data = await this.redis.get(SEASON_KEYS.SETTINGS);
      if (!data) {
        return { ...DEFAULT_SEASON_SETTINGS };
      }
      return JSON.parse(data) as SeasonSettings;
    } catch (error) {
      console.error('Failed to get season settings:', error);
      // Return defaults on error
      return { ...DEFAULT_SEASON_SETTINGS };
    }
  }

  /**
   * Save season settings
   * @param settings - Season settings to save
   */
  async setSettings(settings: SeasonSettings): Promise<void> {
    try {
      if (settings.durationMs <= 0) {
        throw new Error('Duration must be positive');
      }
      await this.redis.set(SEASON_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to set season settings:', error);
      // Re-throw validation errors as-is, wrap Redis errors
      if (error instanceof Error && error.message === 'Duration must be positive') {
        throw error;
      }
      throw new Error('Failed to save season settings');
    }
  }

  /**
   * Get season history for a specific season
   * @param seasonNumber - The season number
   * @returns Season history or null if not exists
   */
  async getSeasonHistory(seasonNumber: number): Promise<SeasonHistory | null> {
    try {
      if (!isValidSeasonNumber(seasonNumber)) {
        throw new Error('Invalid season number');
      }
      const key = getSeasonHistoryKey(seasonNumber);
      const data = await this.redis.get(key);
      if (!data) {
        return null;
      }
      return JSON.parse(data) as SeasonHistory;
    } catch (error) {
      console.error(`Failed to get season ${seasonNumber} history:`, error);
      // Re-throw validation errors as-is, wrap Redis errors
      if (error instanceof Error && error.message === 'Invalid season number') {
        throw error;
      }
      throw new Error('Failed to retrieve season history');
    }
  }

  /**
   * Save season history
   * @param history - Season history to save
   */
  async saveSeasonHistory(history: SeasonHistory): Promise<void> {
    try {
      if (!isValidSeasonNumber(history.seasonNumber)) {
        throw new Error('Invalid season number');
      }

      const key = getSeasonHistoryKey(history.seasonNumber);
      
      // Save the history record
      await this.redis.set(key, JSON.stringify(history));

      // Add to history index
      await this.redis.zAdd(SEASON_KEYS.HISTORY_INDEX, {
        member: history.seasonNumber.toString(),
        score: history.seasonNumber,
      });

      // Maintain max history limit
      await this.trimHistoryIndex();
    } catch (error) {
      console.error('Failed to save season history:', error);
      throw new Error('Failed to save season history');
    }
  }

  /**
   * Get all season history records (up to MAX_SEASON_HISTORY)
   * @returns Array of season history records, sorted by season number descending
   */
  async getAllSeasonHistory(): Promise<SeasonHistory[]> {
    try {
      // Get season numbers from index (most recent first)
      const seasonNumbers = await this.redis.zRange(
        SEASON_KEYS.HISTORY_INDEX,
        0,
        MAX_SEASON_HISTORY - 1,
        { reverse: true, by: 'rank' }
      );

      if (!seasonNumbers || seasonNumbers.length === 0) {
        return [];
      }

      // Fetch all history records
      const histories: SeasonHistory[] = [];
      for (const member of seasonNumbers) {
        const seasonNum = parseInt(member.member, 10);
        const history = await this.getSeasonHistory(seasonNum);
        if (history) {
          histories.push(history);
        }
      }

      return histories;
    } catch (error) {
      console.error('Failed to get all season history:', error);
      return [];
    }
  }

  /**
   * Trim history index to maintain MAX_SEASON_HISTORY limit
   * Removes oldest seasons beyond the limit
   */
  private async trimHistoryIndex(): Promise<void> {
    try {
      const count = await this.redis.zCard(SEASON_KEYS.HISTORY_INDEX);
      if (count > MAX_SEASON_HISTORY) {
        // Remove oldest entries (lowest scores)
        const toRemove = count - MAX_SEASON_HISTORY;
        await this.redis.zRemRangeByRank(SEASON_KEYS.HISTORY_INDEX, 0, toRemove - 1);
      }
    } catch (error) {
      console.error('Failed to trim history index:', error);
      // Non-critical error, don't throw
    }
  }

  /**
   * Get scheduler jobs for a season
   * @param seasonNumber - The season number
   * @returns Season jobs or null if not exists
   */
  async getSeasonJobs(seasonNumber: number): Promise<SeasonJobs | null> {
    try {
      if (!isValidSeasonNumber(seasonNumber)) {
        throw new Error('Invalid season number');
      }
      const key = getSeasonJobsKey(seasonNumber);
      const data = await this.redis.get(key);
      if (!data) {
        return null;
      }
      return JSON.parse(data) as SeasonJobs;
    } catch (error) {
      console.error(`Failed to get season ${seasonNumber} jobs:`, error);
      return null;
    }
  }

  /**
   * Save scheduler jobs for a season
   * @param seasonNumber - The season number
   * @param jobs - Season jobs to save
   */
  async setSeasonJobs(seasonNumber: number, jobs: SeasonJobs): Promise<void> {
    try {
      if (!isValidSeasonNumber(seasonNumber)) {
        throw new Error('Invalid season number');
      }
      const key = getSeasonJobsKey(seasonNumber);
      await this.redis.set(key, JSON.stringify(jobs));
    } catch (error) {
      console.error(`Failed to set season ${seasonNumber} jobs:`, error);
      throw new Error('Failed to save season jobs');
    }
  }

  /**
   * Delete scheduler jobs for a season
   * @param seasonNumber - The season number
   */
  async deleteSeasonJobs(seasonNumber: number): Promise<void> {
    try {
      if (!isValidSeasonNumber(seasonNumber)) {
        throw new Error('Invalid season number');
      }
      const key = getSeasonJobsKey(seasonNumber);
      await this.redis.del(key);
    } catch (error) {
      console.error(`Failed to delete season ${seasonNumber} jobs:`, error);
      // Non-critical error, don't throw
    }
  }

  /**
   * Acquire a distributed lock
   * @param key - Lock key
   * @param ttlMs - Time to live in milliseconds
   * @returns True if lock acquired, false otherwise
   */
  async acquireLock(key: string, ttlMs: number = LOCK_TTL_MS): Promise<boolean> {
    try {
      // Use SET NX EX pattern for distributed locking
      const result = await this.redis.set(key, 'locked', {
        expiration: new Date(Date.now() + ttlMs),
        nx: true,
      });
      return result !== null;
    } catch (error) {
      console.error(`Failed to acquire lock ${key}:`, error);
      return false;
    }
  }

  /**
   * Release a distributed lock
   * @param key - Lock key
   */
  async releaseLock(key: string): Promise<void> {
    try {
      await this.redis.del(key);
    } catch (error) {
      console.error(`Failed to release lock ${key}:`, error);
      // Non-critical error, don't throw
    }
  }

  /**
   * Add a failed Reddit post to the queue
   * @param post - Failed post data
   */
  async addFailedPost(post: {
    title: string;
    body: string;
    timestamp: number;
    error: string;
  }): Promise<void> {
    try {
      // Use zAdd with timestamp as score for ordering
      await this.redis.zAdd(SEASON_KEYS.FAILED_POSTS, {
        member: JSON.stringify(post),
        score: post.timestamp,
      });
    } catch (error) {
      console.error('Failed to add failed post:', error);
      // Non-critical error, don't throw
    }
  }

  /**
   * Get all failed Reddit posts
   * @returns Array of failed posts
   */
  async getFailedPosts(): Promise<Array<{
    title: string;
    body: string;
    timestamp: number;
    error: string;
  }>> {
    try {
      const posts = await this.redis.zRange(SEASON_KEYS.FAILED_POSTS, 0, -1, { by: 'rank' });
      return posts.map(item => JSON.parse(item.member));
    } catch (error) {
      console.error('Failed to get failed posts:', error);
      return [];
    }
  }

  /**
   * Clear all failed Reddit posts
   */
  async clearFailedPosts(): Promise<void> {
    try {
      await this.redis.del(SEASON_KEYS.FAILED_POSTS);
    } catch (error) {
      console.error('Failed to clear failed posts:', error);
      // Non-critical error, don't throw
    }
  }
}
