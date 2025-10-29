/**
 * Season System Redis Key Management
 * 
 * Provides constants and helper functions for managing Redis keys
 * related to the season system.
 */

/**
 * Redis key constants for season system
 */
export const SEASON_KEYS = {
  /** Current season metadata */
  CURRENT: 'season:current',
  
  /** Season settings (moderator configuration) */
  SETTINGS: 'season:settings',
  
  /** Season history index (list of completed season numbers) */
  HISTORY_INDEX: 'season:history:index',
  
  /** Lock key to prevent concurrent season transitions */
  LOCK: 'season:lock',
  
  /** Failed Reddit posts queue */
  FAILED_POSTS: 'season:failed-posts',
} as const;

/**
 * Generate Redis key for a specific season's history
 * @param seasonNumber - The season number
 * @returns Redis key for the season history
 */
export function getSeasonHistoryKey(seasonNumber: number): string {
  return `season:history:${seasonNumber}`;
}

/**
 * Generate Redis key for a specific season's scheduler jobs
 * @param seasonNumber - The season number
 * @returns Redis key for the season's jobs
 */
export function getSeasonJobsKey(seasonNumber: number): string {
  return `season:jobs:${seasonNumber}`;
}

/**
 * Parse season number from a history key
 * @param key - Redis key in format "season:history:{number}"
 * @returns Season number or null if invalid format
 */
export function parseSeasonNumberFromKey(key: string): number | null {
  const match = key.match(/^season:history:(\d+)$/);
  return match && match[1] ? parseInt(match[1], 10) : null;
}

/**
 * Validate season number
 * @param seasonNumber - The season number to validate
 * @returns True if valid, false otherwise
 */
export function isValidSeasonNumber(seasonNumber: number): boolean {
  return Number.isInteger(seasonNumber) && seasonNumber > 0;
}
