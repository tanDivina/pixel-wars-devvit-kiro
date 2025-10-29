/**
 * Reddit Post Service Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { RedditAPIClient } from '@devvit/public-api';
import { RedditPostService, type TeamStanding } from './redditPosts.js';
import type { SeasonMetadata, SeasonHistory } from '../../shared/types/season.js';

// Mock Reddit API client
const createMockReddit = (): RedditAPIClient => {
  return {
    submitPost: vi.fn().mockResolvedValue({ id: 'post-123' }),
  } as unknown as RedditAPIClient;
};

describe('RedditPostService', () => {
  let reddit: RedditAPIClient;
  let service: RedditPostService;
  const subredditName = 'test_subreddit';

  beforeEach(() => {
    reddit = createMockReddit();
    service = new RedditPostService(reddit, subredditName);
    vi.clearAllMocks();
  });

  describe('postSeasonStart', () => {
    it('should create season start post', async () => {
      const season: SeasonMetadata = {
        seasonNumber: 1,
        startTime: Date.now(),
        endTime: Date.now() + 7 * 24 * 60 * 60 * 1000,
        duration: 7 * 24 * 60 * 60 * 1000,
        status: 'active',
      };

      await service.postSeasonStart(season);

      expect(reddit.submitPost).toHaveBeenCalledWith({
        title: expect.stringContaining('Season 1'),
        text: expect.any(String),
        subredditName,
      });
    });

    it('should include season number in title', async () => {
      const season: SeasonMetadata = {
        seasonNumber: 5,
        startTime: Date.now(),
        endTime: Date.now() + 1000,
        duration: 1000,
        status: 'active',
      };

      await service.postSeasonStart(season);

      const call = (reddit.submitPost as any).mock.calls[0][0];
      expect(call.title).toContain('Season 5');
    });

    it('should include duration in post body', async () => {
      const season: SeasonMetadata = {
        seasonNumber: 1,
        startTime: Date.now(),
        endTime: Date.now() + 7 * 24 * 60 * 60 * 1000,
        duration: 7 * 24 * 60 * 60 * 1000,
        status: 'active',
      };

      await service.postSeasonStart(season);

      const call = (reddit.submitPost as any).mock.calls[0][0];
      expect(call.text).toContain('7 days');
    });

    it('should handle Reddit API errors', async () => {
      vi.spyOn(reddit, 'submitPost').mockRejectedValueOnce(new Error('Reddit API error'));

      const season: SeasonMetadata = {
        seasonNumber: 1,
        startTime: Date.now(),
        endTime: Date.now() + 1000,
        duration: 1000,
        status: 'active',
      };

      await expect(service.postSeasonStart(season)).rejects.toThrow(
        'Failed to create season start post'
      );
    });

    it('should log post creation', async () => {
      const consoleSpy = vi.spyOn(console, 'log');
      const season: SeasonMetadata = {
        seasonNumber: 1,
        startTime: Date.now(),
        endTime: Date.now() + 1000,
        duration: 1000,
        status: 'active',
      };

      await service.postSeasonStart(season);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Creating season start post')
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Season start post created')
      );
    });
  });

  describe('post24HourWarning', () => {
    const standings: TeamStanding[] = [
      { teamId: 'red', teamName: 'Red Team', score: 250, zonesControlled: 2, playerCount: 5 },
      { teamId: 'blue', teamName: 'Blue Team', score: 150, zonesControlled: 1, playerCount: 3 },
    ];

    it('should create 24h warning post', async () => {
      const season: SeasonMetadata = {
        seasonNumber: 1,
        startTime: Date.now() - 6 * 24 * 60 * 60 * 1000,
        endTime: Date.now() + 24 * 60 * 60 * 1000,
        duration: 7 * 24 * 60 * 60 * 1000,
        status: 'active',
      };

      await service.post24HourWarning(season, standings);

      expect(reddit.submitPost).toHaveBeenCalledWith({
        title: expect.stringContaining('24 Hours Left'),
        text: expect.any(String),
        subredditName,
      });
    });

    it('should include standings in post', async () => {
      const season: SeasonMetadata = {
        seasonNumber: 1,
        startTime: Date.now(),
        endTime: Date.now() + 1000,
        duration: 1000,
        status: 'active',
      };

      await service.post24HourWarning(season, standings);

      const call = (reddit.submitPost as any).mock.calls[0][0];
      expect(call.text).toContain('Red Team');
      expect(call.text).toContain('Blue Team');
      expect(call.text).toContain('250');
      expect(call.text).toContain('150');
    });

    it('should format standings as table', async () => {
      const season: SeasonMetadata = {
        seasonNumber: 1,
        startTime: Date.now(),
        endTime: Date.now() + 1000,
        duration: 1000,
        status: 'active',
      };

      await service.post24HourWarning(season, standings);

      const call = (reddit.submitPost as any).mock.calls[0][0];
      expect(call.text).toContain('| Rank | Team | Score |');
      expect(call.text).toContain('🥇');
      expect(call.text).toContain('🥈');
    });

    it('should handle Reddit API errors', async () => {
      vi.spyOn(reddit, 'submitPost').mockRejectedValueOnce(new Error('Reddit API error'));

      const season: SeasonMetadata = {
        seasonNumber: 1,
        startTime: Date.now(),
        endTime: Date.now() + 1000,
        duration: 1000,
        status: 'active',
      };

      await expect(service.post24HourWarning(season, standings)).rejects.toThrow(
        'Failed to create 24h warning post'
      );
    });
  });

  describe('post1HourWarning', () => {
    const standings: TeamStanding[] = [
      { teamId: 'red', teamName: 'Red Team', score: 250, zonesControlled: 2, playerCount: 5 },
      { teamId: 'blue', teamName: 'Blue Team', score: 150, zonesControlled: 1, playerCount: 3 },
    ];

    it('should create 1h warning post', async () => {
      const season: SeasonMetadata = {
        seasonNumber: 1,
        startTime: Date.now() - 6 * 24 * 60 * 60 * 1000,
        endTime: Date.now() + 60 * 60 * 1000,
        duration: 7 * 24 * 60 * 60 * 1000,
        status: 'active',
      };

      await service.post1HourWarning(season, standings);

      expect(reddit.submitPost).toHaveBeenCalledWith({
        title: expect.stringContaining('FINAL HOUR'),
        text: expect.any(String),
        subredditName,
      });
    });

    it('should include urgency in title', async () => {
      const season: SeasonMetadata = {
        seasonNumber: 1,
        startTime: Date.now(),
        endTime: Date.now() + 1000,
        duration: 1000,
        status: 'active',
      };

      await service.post1HourWarning(season, standings);

      const call = (reddit.submitPost as any).mock.calls[0][0];
      expect(call.title).toContain('🚨');
      expect(call.title).toContain('FINAL HOUR');
    });

    it('should include standings in post', async () => {
      const season: SeasonMetadata = {
        seasonNumber: 1,
        startTime: Date.now(),
        endTime: Date.now() + 1000,
        duration: 1000,
        status: 'active',
      };

      await service.post1HourWarning(season, standings);

      const call = (reddit.submitPost as any).mock.calls[0][0];
      expect(call.text).toContain('Red Team');
      expect(call.text).toContain('Blue Team');
    });

    it('should handle Reddit API errors', async () => {
      vi.spyOn(reddit, 'submitPost').mockRejectedValueOnce(new Error('Reddit API error'));

      const season: SeasonMetadata = {
        seasonNumber: 1,
        startTime: Date.now(),
        endTime: Date.now() + 1000,
        duration: 1000,
        status: 'active',
      };

      await expect(service.post1HourWarning(season, standings)).rejects.toThrow(
        'Failed to create 1h warning post'
      );
    });
  });

  describe('postWinnerAnnouncement', () => {
    const history: SeasonHistory = {
      seasonNumber: 1,
      startTime: Date.now() - 7 * 24 * 60 * 60 * 1000,
      endTime: Date.now(),
      duration: 7 * 24 * 60 * 60 * 1000,
      winningTeam: {
        id: 'red',
        name: 'Red Team',
        color: '#FF0000',
        finalScore: 250,
      },
      finalStandings: [
        { teamId: 'red', teamName: 'Red Team', score: 250, zonesControlled: 2, playerCount: 5 },
        { teamId: 'blue', teamName: 'Blue Team', score: 150, zonesControlled: 1, playerCount: 3 },
      ],
      statistics: {
        totalPixelsPlaced: 100,
        totalPlayers: 8,
        topPlayer: { username: 'player1', teamId: 'red', pixelsPlaced: 25 },
        closestZone: { x: 0, y: 0, marginPixels: 5 },
      },
    };

    it('should create winner announcement post', async () => {
      await service.postWinnerAnnouncement(history);

      expect(reddit.submitPost).toHaveBeenCalledWith({
        title: expect.stringContaining('Winner: Red Team'),
        text: expect.any(String),
        subredditName,
      });
    });

    it('should include winner name in title', async () => {
      await service.postWinnerAnnouncement(history);

      const call = (reddit.submitPost as any).mock.calls[0][0];
      expect(call.title).toContain('Red Team');
      expect(call.title).toContain('🏆');
    });

    it('should include final standings', async () => {
      await service.postWinnerAnnouncement(history);

      const call = (reddit.submitPost as any).mock.calls[0][0];
      expect(call.text).toContain('Red Team');
      expect(call.text).toContain('Blue Team');
      expect(call.text).toContain('250');
      expect(call.text).toContain('150');
    });

    it('should include season statistics', async () => {
      await service.postWinnerAnnouncement(history);

      const call = (reddit.submitPost as any).mock.calls[0][0];
      expect(call.text).toContain('Total Pixels Placed');
      expect(call.text).toContain('100');
      expect(call.text).toContain('Total Players');
      expect(call.text).toContain('8');
      expect(call.text).toContain('Top Player');
      expect(call.text).toContain('player1');
      expect(call.text).toContain('25 pixels');
    });

    it('should include next season teaser', async () => {
      await service.postWinnerAnnouncement(history);

      const call = (reddit.submitPost as any).mock.calls[0][0];
      expect(call.text).toContain('Season 2');
    });

    it('should handle Reddit API errors', async () => {
      vi.spyOn(reddit, 'submitPost').mockRejectedValueOnce(new Error('Reddit API error'));

      await expect(service.postWinnerAnnouncement(history)).rejects.toThrow(
        'Failed to create winner announcement'
      );
    });

    it('should log post creation', async () => {
      const consoleSpy = vi.spyOn(console, 'log');

      await service.postWinnerAnnouncement(history);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Creating winner announcement')
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Winner announcement created')
      );
    });
  });

  describe('standings formatting', () => {
    it('should use medals for top 3 teams', async () => {
      const standings: TeamStanding[] = [
        { teamId: 'red', teamName: 'Red Team', score: 300, zonesControlled: 3, playerCount: 5 },
        { teamId: 'blue', teamName: 'Blue Team', score: 200, zonesControlled: 2, playerCount: 4 },
        { teamId: 'green', teamName: 'Green Team', score: 100, zonesControlled: 1, playerCount: 3 },
        { teamId: 'yellow', teamName: 'Yellow Team', score: 50, zonesControlled: 0, playerCount: 2 },
      ];

      const season: SeasonMetadata = {
        seasonNumber: 1,
        startTime: Date.now(),
        endTime: Date.now() + 1000,
        duration: 1000,
        status: 'active',
      };

      await service.post24HourWarning(season, standings);

      const call = (reddit.submitPost as any).mock.calls[0][0];
      expect(call.text).toContain('🥇');
      expect(call.text).toContain('🥈');
      expect(call.text).toContain('🥉');
      expect(call.text).toContain('4.');
    });

    it('should handle empty standings', async () => {
      const season: SeasonMetadata = {
        seasonNumber: 1,
        startTime: Date.now(),
        endTime: Date.now() + 1000,
        duration: 1000,
        status: 'active',
      };

      await service.post24HourWarning(season, []);

      expect(reddit.submitPost).toHaveBeenCalled();
    });
  });
});
