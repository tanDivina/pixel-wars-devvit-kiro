/**
 * Scheduler Service Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { RedisClient, Scheduler } from '@devvit/public-api';
import { SchedulerService } from './scheduler.js';

// Mock Redis client
const createMockRedis = (): RedisClient => {
  const store = new Map<string, string>();

  return {
    get: vi.fn(async (key: string) => store.get(key) ?? null),
    set: vi.fn(async (key: string, value: string) => {
      store.set(key, value);
      return 'OK';
    }),
    del: vi.fn(async (key: string | string[]) => {
      const keys = Array.isArray(key) ? key : [key];
      let deleted = 0;
      for (const k of keys) {
        if (store.delete(k)) deleted++;
      }
      return deleted;
    }),
  } as unknown as RedisClient;
};

// Mock Scheduler
const createMockScheduler = (): Scheduler => {
  const jobs = new Map<string, any>();
  let jobIdCounter = 1;

  return {
    runJob: vi.fn(async (options: any) => {
      const jobId = `job-${jobIdCounter++}`;
      jobs.set(jobId, options);
      return jobId;
    }),
    cancelJob: vi.fn(async (jobId: string) => {
      jobs.delete(jobId);
    }),
  } as unknown as Scheduler;
};

describe('SchedulerService', () => {
  let redis: RedisClient;
  let scheduler: Scheduler;
  let service: SchedulerService;

  beforeEach(() => {
    redis = createMockRedis();
    scheduler = createMockScheduler();
    service = new SchedulerService(redis, scheduler);
    vi.clearAllMocks();
  });

  describe('scheduleSeasonEnd', () => {
    it('should schedule season end job', async () => {
      const endTime = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days from now
      const seasonNumber = 1;

      await service.scheduleSeasonEnd(endTime, seasonNumber);

      expect(scheduler.runJob).toHaveBeenCalledWith({
        name: 'season-end',
        runAt: new Date(endTime),
        data: { seasonNumber },
      });
    });

    it('should store job tracking info', async () => {
      const endTime = Date.now() + 7 * 24 * 60 * 60 * 1000;
      const seasonNumber = 1;

      await service.scheduleSeasonEnd(endTime, seasonNumber);

      expect(redis.set).toHaveBeenCalledWith(
        'season:jobs:1',
        expect.stringContaining('season-end')
      );
    });

    it('should log scheduling operation', async () => {
      const consoleSpy = vi.spyOn(console, 'log');
      const endTime = Date.now() + 7 * 24 * 60 * 60 * 1000;
      const seasonNumber = 1;

      await service.scheduleSeasonEnd(endTime, seasonNumber);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Scheduling season end for season 1')
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Season end job scheduled')
      );
    });

    it('should handle scheduling errors', async () => {
      vi.spyOn(scheduler, 'runJob').mockRejectedValueOnce(new Error('Scheduler error'));

      await expect(
        service.scheduleSeasonEnd(Date.now() + 1000, 1)
      ).rejects.toThrow('Failed to schedule season end');
    });

    it('should use correct date format', async () => {
      const endTime = Date.now() + 7 * 24 * 60 * 60 * 1000;
      const seasonNumber = 1;

      await service.scheduleSeasonEnd(endTime, seasonNumber);

      const call = (scheduler.runJob as any).mock.calls[0][0];
      expect(call.runAt).toBeInstanceOf(Date);
      expect(call.runAt.getTime()).toBe(endTime);
    });
  });

  describe('scheduleWarnings', () => {
    it('should schedule 24h warning when enabled and season is long enough', async () => {
      const endTime = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
      const seasonNumber = 1;
      const settings = { enable24hWarning: true, enable1hWarning: false };

      await service.scheduleWarnings(endTime, seasonNumber, settings);

      expect(scheduler.runJob).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'warning-24h',
          data: { seasonNumber },
        })
      );
    });

    it('should schedule 1h warning when enabled and season is long enough', async () => {
      const endTime = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
      const seasonNumber = 1;
      const settings = { enable24hWarning: false, enable1hWarning: true };

      await service.scheduleWarnings(endTime, seasonNumber, settings);

      expect(scheduler.runJob).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'warning-1h',
          data: { seasonNumber },
        })
      );
    });

    it('should schedule both warnings when both enabled', async () => {
      const endTime = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
      const seasonNumber = 1;
      const settings = { enable24hWarning: true, enable1hWarning: true };

      await service.scheduleWarnings(endTime, seasonNumber, settings);

      expect(scheduler.runJob).toHaveBeenCalledTimes(2);
      expect(scheduler.runJob).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'warning-24h' })
      );
      expect(scheduler.runJob).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'warning-1h' })
      );
    });

    it('should not schedule 24h warning for short seasons', async () => {
      const endTime = Date.now() + 30 * 60 * 1000; // 30 minutes
      const seasonNumber = 1;
      const settings = { enable24hWarning: true, enable1hWarning: true };

      await service.scheduleWarnings(endTime, seasonNumber, settings);

      // Should only schedule 1h warning (or none if too short)
      const calls = (scheduler.runJob as any).mock.calls;
      const has24hWarning = calls.some((call: any) => call[0].name === 'warning-24h');
      expect(has24hWarning).toBe(false);
    });

    it('should not schedule warnings when disabled', async () => {
      const endTime = Date.now() + 7 * 24 * 60 * 60 * 1000;
      const seasonNumber = 1;
      const settings = { enable24hWarning: false, enable1hWarning: false };

      await service.scheduleWarnings(endTime, seasonNumber, settings);

      expect(scheduler.runJob).not.toHaveBeenCalled();
    });

    it('should not schedule warnings in the past', async () => {
      const endTime = Date.now() + 30 * 60 * 1000; // 30 minutes from now
      const seasonNumber = 1;
      const settings = { enable24hWarning: true, enable1hWarning: true };

      await service.scheduleWarnings(endTime, seasonNumber, settings);

      // 24h warning would be in the past, should not be scheduled
      const calls = (scheduler.runJob as any).mock.calls;
      const has24hWarning = calls.some((call: any) => call[0].name === 'warning-24h');
      expect(has24hWarning).toBe(false);
    });

    it('should store job tracking info for warnings', async () => {
      const endTime = Date.now() + 7 * 24 * 60 * 60 * 1000;
      const seasonNumber = 1;
      const settings = { enable24hWarning: true, enable1hWarning: true };

      await service.scheduleWarnings(endTime, seasonNumber, settings);

      expect(redis.set).toHaveBeenCalled();
    });

    it('should log warning scheduling', async () => {
      const consoleSpy = vi.spyOn(console, 'log');
      const endTime = Date.now() + 7 * 24 * 60 * 60 * 1000;
      const seasonNumber = 1;
      const settings = { enable24hWarning: true, enable1hWarning: true };

      await service.scheduleWarnings(endTime, seasonNumber, settings);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Scheduling 24h warning')
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Scheduling 1h warning')
      );
    });

    it('should handle scheduling errors', async () => {
      vi.spyOn(scheduler, 'runJob').mockRejectedValueOnce(new Error('Scheduler error'));
      const endTime = Date.now() + 7 * 24 * 60 * 60 * 1000;
      const seasonNumber = 1;
      const settings = { enable24hWarning: true, enable1hWarning: false };

      await expect(
        service.scheduleWarnings(endTime, seasonNumber, settings)
      ).rejects.toThrow('Failed to schedule warnings');
    });

    it('should calculate correct warning times', async () => {
      const endTime = Date.now() + 7 * 24 * 60 * 60 * 1000;
      const seasonNumber = 1;
      const settings = { enable24hWarning: true, enable1hWarning: true };

      await service.scheduleWarnings(endTime, seasonNumber, settings);

      const calls = (scheduler.runJob as any).mock.calls;
      
      // Find 24h warning call
      const warning24h = calls.find((call: any) => call[0].name === 'warning-24h');
      if (warning24h) {
        const expectedTime = endTime - 24 * 60 * 60 * 1000;
        expect(warning24h[0].runAt.getTime()).toBe(expectedTime);
      }

      // Find 1h warning call
      const warning1h = calls.find((call: any) => call[0].name === 'warning-1h');
      if (warning1h) {
        const expectedTime = endTime - 60 * 60 * 1000;
        expect(warning1h[0].runAt.getTime()).toBe(expectedTime);
      }
    });
  });

  describe('cancelSeasonJobs', () => {
    it('should cancel all jobs for a season', async () => {
      const seasonNumber = 1;

      // Set up some jobs
      await redis.set(
        'season:jobs:1',
        JSON.stringify({
          'season-end': 'job-1',
          'warning-24h': 'job-2',
          'warning-1h': 'job-3',
        })
      );

      await service.cancelSeasonJobs(seasonNumber);

      expect(scheduler.cancelJob).toHaveBeenCalledWith('job-1');
      expect(scheduler.cancelJob).toHaveBeenCalledWith('job-2');
      expect(scheduler.cancelJob).toHaveBeenCalledWith('job-3');
    });

    it('should remove job tracking data', async () => {
      const seasonNumber = 1;

      await redis.set(
        'season:jobs:1',
        JSON.stringify({ 'season-end': 'job-1' })
      );

      await service.cancelSeasonJobs(seasonNumber);

      expect(redis.del).toHaveBeenCalledWith('season:jobs:1');
    });

    it('should handle missing job data gracefully', async () => {
      const seasonNumber = 1;

      // No jobs stored
      await expect(service.cancelSeasonJobs(seasonNumber)).resolves.not.toThrow();
    });

    it('should handle cancellation errors gracefully', async () => {
      const seasonNumber = 1;

      await redis.set(
        'season:jobs:1',
        JSON.stringify({ 'season-end': 'job-1' })
      );

      vi.spyOn(scheduler, 'cancelJob').mockRejectedValueOnce(new Error('Cancel failed'));

      // Should not throw
      await expect(service.cancelSeasonJobs(seasonNumber)).resolves.not.toThrow();
    });

    it('should log cancellation operations', async () => {
      const consoleSpy = vi.spyOn(console, 'log');
      const seasonNumber = 1;

      await redis.set(
        'season:jobs:1',
        JSON.stringify({ 'season-end': 'job-1' })
      );

      await service.cancelSeasonJobs(seasonNumber);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Cancelling all jobs for season 1')
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('All jobs cancelled for season 1')
      );
    });

    it('should handle partial cancellation failures', async () => {
      const seasonNumber = 1;

      await redis.set(
        'season:jobs:1',
        JSON.stringify({
          'season-end': 'job-1',
          'warning-24h': 'job-2',
        })
      );

      // First cancel succeeds, second fails
      vi.spyOn(scheduler, 'cancelJob')
        .mockResolvedValueOnce(undefined)
        .mockRejectedValueOnce(new Error('Cancel failed'));

      await service.cancelSeasonJobs(seasonNumber);

      // Should still delete tracking data
      expect(redis.del).toHaveBeenCalledWith('season:jobs:1');
    });
  });

  describe('getSeasonJobs', () => {
    it('should retrieve job information', async () => {
      const seasonNumber = 1;
      const jobData = {
        'season-end': 'job-1',
        'season-end_time': Date.now() + 1000,
        'warning-24h': 'job-2',
        'warning-24h_time': Date.now() + 500,
      };

      await redis.set('season:jobs:1', JSON.stringify(jobData));

      const result = await service.getSeasonJobs(seasonNumber);

      expect(result).toEqual(jobData);
    });

    it('should return null when no jobs exist', async () => {
      const seasonNumber = 1;

      const result = await service.getSeasonJobs(seasonNumber);

      expect(result).toBeNull();
    });

    it('should handle Redis errors gracefully', async () => {
      vi.spyOn(redis, 'get').mockRejectedValueOnce(new Error('Redis error'));

      const result = await service.getSeasonJobs(1);

      expect(result).toBeNull();
    });

    it('should parse JSON correctly', async () => {
      const seasonNumber = 1;
      const jobData = { 'season-end': 'job-1' };

      await redis.set('season:jobs:1', JSON.stringify(jobData));

      const result = await service.getSeasonJobs(seasonNumber);

      expect(result).toEqual(jobData);
      expect(typeof result).toBe('object');
    });
  });

  describe('handleSeasonEnd', () => {
    it('should execute season end callback', async () => {
      const seasonNumber = 1;
      const onSeasonEnd = vi.fn().mockResolvedValue(undefined);

      // Set up current season
      await redis.set(
        'season:current',
        JSON.stringify({ seasonNumber: 1, startTime: Date.now(), endTime: Date.now() + 1000 })
      );

      await service.handleSeasonEnd(seasonNumber, onSeasonEnd);

      expect(onSeasonEnd).toHaveBeenCalledWith(seasonNumber);
    });

    it('should verify season number matches', async () => {
      const seasonNumber = 1;
      const onSeasonEnd = vi.fn();

      // Set up different current season
      await redis.set(
        'season:current',
        JSON.stringify({ seasonNumber: 2, startTime: Date.now(), endTime: Date.now() + 1000 })
      );

      await service.handleSeasonEnd(seasonNumber, onSeasonEnd);

      // Should not execute callback
      expect(onSeasonEnd).not.toHaveBeenCalled();
    });

    it('should handle missing current season', async () => {
      const seasonNumber = 1;
      const onSeasonEnd = vi.fn();

      // No current season
      await service.handleSeasonEnd(seasonNumber, onSeasonEnd);

      expect(onSeasonEnd).not.toHaveBeenCalled();
    });

    it('should schedule retry on failure', async () => {
      const seasonNumber = 1;
      const onSeasonEnd = vi.fn().mockRejectedValue(new Error('Season end failed'));

      await redis.set(
        'season:current',
        JSON.stringify({ seasonNumber: 1, startTime: Date.now(), endTime: Date.now() + 1000 })
      );

      await expect(service.handleSeasonEnd(seasonNumber, onSeasonEnd)).rejects.toThrow();

      // Should schedule retry
      expect(scheduler.runJob).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'season-end-retry',
          data: { seasonNumber },
        })
      );
    });

    it('should log season end operations', async () => {
      const consoleSpy = vi.spyOn(console, 'log');
      const seasonNumber = 1;
      const onSeasonEnd = vi.fn().mockResolvedValue(undefined);

      await redis.set(
        'season:current',
        JSON.stringify({ seasonNumber: 1, startTime: Date.now(), endTime: Date.now() + 1000 })
      );

      await service.handleSeasonEnd(seasonNumber, onSeasonEnd);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Season end job triggered for season 1')
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Season end completed for season 1')
      );
    });

    it('should handle retry scheduling failure', async () => {
      const seasonNumber = 1;
      const onSeasonEnd = vi.fn().mockRejectedValue(new Error('Season end failed'));

      await redis.set(
        'season:current',
        JSON.stringify({ seasonNumber: 1, startTime: Date.now(), endTime: Date.now() + 1000 })
      );

      vi.spyOn(scheduler, 'runJob').mockRejectedValueOnce(new Error('Retry schedule failed'));

      await expect(service.handleSeasonEnd(seasonNumber, onSeasonEnd)).rejects.toThrow();
    });
  });

  describe('handleWarning', () => {
    it('should execute warning callback for 24h warning', async () => {
      const seasonNumber = 1;
      const onWarning = vi.fn().mockResolvedValue(undefined);

      await redis.set(
        'season:current',
        JSON.stringify({ seasonNumber: 1, startTime: Date.now(), endTime: Date.now() + 1000 })
      );

      await service.handleWarning('24h', seasonNumber, onWarning);

      expect(onWarning).toHaveBeenCalledWith('24h', seasonNumber);
    });

    it('should execute warning callback for 1h warning', async () => {
      const seasonNumber = 1;
      const onWarning = vi.fn().mockResolvedValue(undefined);

      await redis.set(
        'season:current',
        JSON.stringify({ seasonNumber: 1, startTime: Date.now(), endTime: Date.now() + 1000 })
      );

      await service.handleWarning('1h', seasonNumber, onWarning);

      expect(onWarning).toHaveBeenCalledWith('1h', seasonNumber);
    });

    it('should verify season number matches', async () => {
      const seasonNumber = 1;
      const onWarning = vi.fn();

      await redis.set(
        'season:current',
        JSON.stringify({ seasonNumber: 2, startTime: Date.now(), endTime: Date.now() + 1000 })
      );

      await service.handleWarning('24h', seasonNumber, onWarning);

      expect(onWarning).not.toHaveBeenCalled();
    });

    it('should handle missing current season', async () => {
      const seasonNumber = 1;
      const onWarning = vi.fn();

      await service.handleWarning('24h', seasonNumber, onWarning);

      expect(onWarning).not.toHaveBeenCalled();
    });

    it('should not throw on warning failure', async () => {
      const seasonNumber = 1;
      const onWarning = vi.fn().mockRejectedValue(new Error('Warning failed'));

      await redis.set(
        'season:current',
        JSON.stringify({ seasonNumber: 1, startTime: Date.now(), endTime: Date.now() + 1000 })
      );

      // Should not throw
      await expect(service.handleWarning('24h', seasonNumber, onWarning)).resolves.not.toThrow();
    });

    it('should store failed warning posts', async () => {
      const seasonNumber = 1;
      const onWarning = vi.fn().mockRejectedValue(new Error('Warning failed'));

      // Mock lPush
      const lPushMock = vi.fn().mockResolvedValue(1);
      (redis as any).lPush = lPushMock;

      await redis.set(
        'season:current',
        JSON.stringify({ seasonNumber: 1, startTime: Date.now(), endTime: Date.now() + 1000 })
      );

      await service.handleWarning('24h', seasonNumber, onWarning);

      expect(lPushMock).toHaveBeenCalledWith(
        'season:failed-posts',
        expect.stringContaining('warning-24h')
      );
    });

    it('should log warning operations', async () => {
      const consoleSpy = vi.spyOn(console, 'log');
      const seasonNumber = 1;
      const onWarning = vi.fn().mockResolvedValue(undefined);

      await redis.set(
        'season:current',
        JSON.stringify({ seasonNumber: 1, startTime: Date.now(), endTime: Date.now() + 1000 })
      );

      await service.handleWarning('1h', seasonNumber, onWarning);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('1h warning job triggered for season 1')
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('1h warning completed for season 1')
      );
    });
  });

  describe('integration scenarios', () => {
    it('should handle complete scheduling flow', async () => {
      const endTime = Date.now() + 7 * 24 * 60 * 60 * 1000;
      const seasonNumber = 1;
      const settings = { enable24hWarning: true, enable1hWarning: true };

      // Schedule season end
      await service.scheduleSeasonEnd(endTime, seasonNumber);

      // Schedule warnings
      await service.scheduleWarnings(endTime, seasonNumber, settings);

      // Verify all jobs scheduled
      expect(scheduler.runJob).toHaveBeenCalledTimes(3);

      // Get job info
      const jobs = await service.getSeasonJobs(seasonNumber);
      expect(jobs).not.toBeNull();
      expect(jobs).toHaveProperty('season-end');
      expect(jobs).toHaveProperty('warning-24h');
      expect(jobs).toHaveProperty('warning-1h');
    });

    it('should handle season transition', async () => {
      const seasonNumber = 1;

      // Schedule jobs for season 1
      await service.scheduleSeasonEnd(Date.now() + 1000, seasonNumber);

      // Cancel jobs when season ends
      await service.cancelSeasonJobs(seasonNumber);

      // Schedule jobs for season 2
      await service.scheduleSeasonEnd(Date.now() + 2000, seasonNumber + 1);

      // Verify season 1 jobs cancelled
      const season1Jobs = await service.getSeasonJobs(seasonNumber);
      expect(season1Jobs).toBeNull();

      // Verify season 2 jobs exist
      const season2Jobs = await service.getSeasonJobs(seasonNumber + 1);
      expect(season2Jobs).not.toBeNull();
    });

    it('should handle rescheduling', async () => {
      const seasonNumber = 1;
      const endTime1 = Date.now() + 1000;
      const endTime2 = Date.now() + 2000;

      // Schedule first time
      await service.scheduleSeasonEnd(endTime1, seasonNumber);
      const firstJobId = (scheduler.runJob as any).mock.results[0].value;

      // Reschedule
      await service.scheduleSeasonEnd(endTime2, seasonNumber);
      const secondJobId = (scheduler.runJob as any).mock.results[1].value;

      // Should have different job IDs
      expect(firstJobId).not.toBe(secondJobId);
    });

    it('should handle complete job execution flow', async () => {
      const seasonNumber = 1;
      const onSeasonEnd = vi.fn().mockResolvedValue(undefined);
      const onWarning = vi.fn().mockResolvedValue(undefined);

      // Set up current season
      await redis.set(
        'season:current',
        JSON.stringify({ seasonNumber: 1, startTime: Date.now(), endTime: Date.now() + 1000 })
      );

      // Execute warning handlers
      await service.handleWarning('24h', seasonNumber, onWarning);
      await service.handleWarning('1h', seasonNumber, onWarning);

      // Execute season end handler
      await service.handleSeasonEnd(seasonNumber, onSeasonEnd);

      // Verify all callbacks executed
      expect(onWarning).toHaveBeenCalledTimes(2);
      expect(onSeasonEnd).toHaveBeenCalledTimes(1);
    });
  });
});
