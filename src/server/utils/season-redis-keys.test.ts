/**
 * Season Redis Keys Tests
 */

import { describe, it, expect } from 'vitest';
import {
  SEASON_KEYS,
  getSeasonHistoryKey,
  getSeasonJobsKey,
  parseSeasonNumberFromKey,
  isValidSeasonNumber,
} from './season-redis-keys.js';

describe('Season Redis Keys', () => {
  describe('SEASON_KEYS constants', () => {
    it('should have correct key values', () => {
      expect(SEASON_KEYS.CURRENT).toBe('season:current');
      expect(SEASON_KEYS.SETTINGS).toBe('season:settings');
      expect(SEASON_KEYS.HISTORY_INDEX).toBe('season:history:index');
      expect(SEASON_KEYS.LOCK).toBe('season:lock');
      expect(SEASON_KEYS.FAILED_POSTS).toBe('season:failed-posts');
    });
  });

  describe('getSeasonHistoryKey', () => {
    it('should generate correct history key', () => {
      expect(getSeasonHistoryKey(1)).toBe('season:history:1');
      expect(getSeasonHistoryKey(42)).toBe('season:history:42');
      expect(getSeasonHistoryKey(999)).toBe('season:history:999');
    });
  });

  describe('getSeasonJobsKey', () => {
    it('should generate correct jobs key', () => {
      expect(getSeasonJobsKey(1)).toBe('season:jobs:1');
      expect(getSeasonJobsKey(42)).toBe('season:jobs:42');
      expect(getSeasonJobsKey(999)).toBe('season:jobs:999');
    });
  });

  describe('parseSeasonNumberFromKey', () => {
    it('should parse valid history keys', () => {
      expect(parseSeasonNumberFromKey('season:history:1')).toBe(1);
      expect(parseSeasonNumberFromKey('season:history:42')).toBe(42);
      expect(parseSeasonNumberFromKey('season:history:999')).toBe(999);
    });

    it('should return null for invalid keys', () => {
      expect(parseSeasonNumberFromKey('season:history:')).toBeNull();
      expect(parseSeasonNumberFromKey('season:history:abc')).toBeNull();
      expect(parseSeasonNumberFromKey('season:current')).toBeNull();
      expect(parseSeasonNumberFromKey('invalid:key:1')).toBeNull();
      expect(parseSeasonNumberFromKey('')).toBeNull();
    });
  });

  describe('isValidSeasonNumber', () => {
    it('should validate positive integers', () => {
      expect(isValidSeasonNumber(1)).toBe(true);
      expect(isValidSeasonNumber(42)).toBe(true);
      expect(isValidSeasonNumber(999)).toBe(true);
    });

    it('should reject invalid numbers', () => {
      expect(isValidSeasonNumber(0)).toBe(false);
      expect(isValidSeasonNumber(-1)).toBe(false);
      expect(isValidSeasonNumber(1.5)).toBe(false);
      expect(isValidSeasonNumber(NaN)).toBe(false);
      expect(isValidSeasonNumber(Infinity)).toBe(false);
    });
  });
});
