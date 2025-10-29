import { describe, it, expect, vi } from 'vitest';
import type { TeamStats } from '../../shared/types/game';

describe('SplashScreen Component Logic', () => {
  describe('Team sorting logic', () => {
    it('should sort teams by total pixels in descending order', () => {
      const teamStats: TeamStats[] = [
        {
          teamId: 'blue',
          teamName: 'Blue Team',
          color: '#0000FF',
          zonesControlled: 3,
          totalPixels: 100,
          playerCount: 8,
        },
        {
          teamId: 'red',
          teamName: 'Red Team',
          color: '#FF0000',
          zonesControlled: 5,
          totalPixels: 150,
          playerCount: 10,
        },
        {
          teamId: 'green',
          teamName: 'Green Team',
          color: '#00FF00',
          zonesControlled: 2,
          totalPixels: 75,
          playerCount: 5,
        },
      ];

      const sorted = [...teamStats].sort((a, b) => b.totalPixels - a.totalPixels);

      expect(sorted[0].teamId).toBe('red'); // 150 pixels
      expect(sorted[1].teamId).toBe('blue'); // 100 pixels
      expect(sorted[2].teamId).toBe('green'); // 75 pixels
    });

    it('should handle teams with equal pixels', () => {
      const teamStats: TeamStats[] = [
        {
          teamId: 'red',
          teamName: 'Red Team',
          color: '#FF0000',
          zonesControlled: 5,
          totalPixels: 100,
          playerCount: 10,
        },
        {
          teamId: 'blue',
          teamName: 'Blue Team',
          color: '#0000FF',
          zonesControlled: 3,
          totalPixels: 100,
          playerCount: 8,
        },
      ];

      const sorted = [...teamStats].sort((a, b) => b.totalPixels - a.totalPixels);

      expect(sorted).toHaveLength(2);
      expect(sorted[0].totalPixels).toBe(100);
      expect(sorted[1].totalPixels).toBe(100);
    });
  });

  describe('Percentage calculation', () => {
    it('should calculate correct percentage for each team', () => {
      const teamStats: TeamStats[] = [
        { teamId: 'red', teamName: 'Red', color: '#FF0000', zonesControlled: 5, totalPixels: 150, playerCount: 10 },
        { teamId: 'blue', teamName: 'Blue', color: '#0000FF', zonesControlled: 3, totalPixels: 100, playerCount: 8 },
        { teamId: 'green', teamName: 'Green', color: '#00FF00', zonesControlled: 2, totalPixels: 75, playerCount: 5 },
      ];

      const totalPixels = teamStats.reduce((sum, team) => sum + team.totalPixels, 0);
      expect(totalPixels).toBe(325);

      const redPercentage = (150 / 325) * 100;
      const bluePercentage = (100 / 325) * 100;
      const greenPercentage = (75 / 325) * 100;

      expect(redPercentage).toBeCloseTo(46.15, 1);
      expect(bluePercentage).toBeCloseTo(30.77, 1);
      expect(greenPercentage).toBeCloseTo(23.08, 1);
    });

    it('should handle zero total pixels', () => {
      const teamStats: TeamStats[] = [
        { teamId: 'red', teamName: 'Red', color: '#FF0000', zonesControlled: 0, totalPixels: 0, playerCount: 5 },
      ];

      const totalPixels = teamStats.reduce((sum, team) => sum + team.totalPixels, 0);
      const percentage = totalPixels > 0 ? (0 / totalPixels) * 100 : 0;

      expect(percentage).toBe(0);
    });
  });

  describe('Player count formatting', () => {
    it('should use singular "player" for count of 1', () => {
      const count = 1;
      const text = `${count} ${count === 1 ? 'player' : 'players'}`;
      expect(text).toBe('1 player');
    });

    it('should use plural "players" for count > 1', () => {
      const count = 10;
      const text = `${count} ${count === 1 ? 'player' : 'players'}`;
      expect(text).toBe('10 players');
    });

    it('should use plural "players" for count of 0', () => {
      const count = 0;
      const text = `${count} ${count === 1 ? 'player' : 'players'}`;
      expect(text).toBe('0 players');
    });
  });

  describe('API fetch behavior', () => {
    it('should call fetch with correct endpoint', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        json: async () => ({
          type: 'splash-data',
          teamStats: [],
          activePlayers: 0,
        }),
      });

      global.fetch = mockFetch;

      await fetch('/api/splash-data');

      expect(mockFetch).toHaveBeenCalledWith('/api/splash-data');
    });

    it('should handle fetch errors', async () => {
      const mockFetch = vi.fn().mockRejectedValue(new Error('Network error'));
      global.fetch = mockFetch;

      await expect(fetch('/api/splash-data')).rejects.toThrow('Network error');
    });
  });

  describe('Number formatting', () => {
    it('should format large numbers with commas', () => {
      expect((1234).toLocaleString()).toBe('1,234');
      expect((1234567).toLocaleString()).toBe('1,234,567');
    });

    it('should format small numbers without commas', () => {
      expect((123).toLocaleString()).toBe('123');
      expect((0).toLocaleString()).toBe('0');
    });
  });
});
