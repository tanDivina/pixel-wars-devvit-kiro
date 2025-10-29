/**
 * Scheduler Service
 * 
 * Manages Devvit scheduler jobs for season timing and automated posts.
 * Handles scheduling season end jobs and warning post jobs.
 * 
 * Note: This service is designed for future scheduler integration.
 * Devvit Web currently doesn't support traditional scheduler jobs.
 * Season management is handled through API endpoints and manual triggers.
 */

import type { RedisClient } from '@devvit/web/server';

// Placeholder Scheduler type since Devvit Web doesn't support it yet
export interface Scheduler {
  runJob(options: { name: string; runAt: Date; data: any }): Promise<string>;
  cancelJob(jobId: string): Promise<void>;
}

export interface SchedulerJob {
  id: string;
  type: 'season-end' | 'warning-24h' | 'warning-1h';
  scheduledTime: number;
  seasonNumber: number;
}

export class SchedulerService {
  constructor(
    private redis: RedisClient,
    private scheduler: Scheduler
  ) {}

  /**
   * Schedule season end job
   * @param endTime - Unix timestamp when season should end
   * @param seasonNumber - Season number for verification
   */
  async scheduleSeasonEnd(endTime: number, seasonNumber: number): Promise<void> {
    try {
      console.log(`Scheduling season end for season ${seasonNumber} at ${new Date(endTime).toISOString()}`);

      // Cancel any existing season end job for this season
      await this.cancelJobIfExists(`season-end-${seasonNumber}`);

      // Schedule the job
      const jobId = await this.scheduler.runJob({
        name: 'season-end',
        runAt: new Date(endTime),
        data: { seasonNumber },
      });

      // Store job tracking info
      await this.storeJobInfo(seasonNumber, 'season-end', jobId, endTime);

      console.log(`Season end job scheduled: ${jobId}`);
    } catch (error) {
      console.error(`Failed to schedule season end for season ${seasonNumber}:`, error);
      throw new Error('Failed to schedule season end');
    }
  }

  /**
   * Schedule warning posts (24h and 1h before season end)
   * @param endTime - Unix timestamp when season ends
   * @param seasonNumber - Season number for verification
   * @param settings - Season settings to check if warnings are enabled
   */
  async scheduleWarnings(
    endTime: number,
    seasonNumber: number,
    settings: { enable24hWarning: boolean; enable1hWarning: boolean }
  ): Promise<void> {
    try {
      const now = Date.now();
      const timeUntilEnd = endTime - now;

      // Schedule 24h warning if enabled and season is long enough
      if (settings.enable24hWarning && timeUntilEnd > 24 * 60 * 60 * 1000) {
        const warning24hTime = endTime - 24 * 60 * 60 * 1000;
        
        if (warning24hTime > now) {
          console.log(`Scheduling 24h warning for season ${seasonNumber} at ${new Date(warning24hTime).toISOString()}`);

          await this.cancelJobIfExists(`warning-24h-${seasonNumber}`);

          const jobId = await this.scheduler.runJob({
            name: 'warning-24h',
            runAt: new Date(warning24hTime),
            data: { seasonNumber },
          });

          await this.storeJobInfo(seasonNumber, 'warning-24h', jobId, warning24hTime);
          console.log(`24h warning job scheduled: ${jobId}`);
        }
      }

      // Schedule 1h warning if enabled and season is long enough
      if (settings.enable1hWarning && timeUntilEnd > 60 * 60 * 1000) {
        const warning1hTime = endTime - 60 * 60 * 1000;
        
        if (warning1hTime > now) {
          console.log(`Scheduling 1h warning for season ${seasonNumber} at ${new Date(warning1hTime).toISOString()}`);

          await this.cancelJobIfExists(`warning-1h-${seasonNumber}`);

          const jobId = await this.scheduler.runJob({
            name: 'warning-1h',
            runAt: new Date(warning1hTime),
            data: { seasonNumber },
          });

          await this.storeJobInfo(seasonNumber, 'warning-1h', jobId, warning1hTime);
          console.log(`1h warning job scheduled: ${jobId}`);
        }
      }
    } catch (error) {
      console.error(`Failed to schedule warnings for season ${seasonNumber}:`, error);
      throw new Error('Failed to schedule warnings');
    }
  }

  /**
   * Cancel all jobs for a season
   * @param seasonNumber - Season number
   */
  async cancelSeasonJobs(seasonNumber: number): Promise<void> {
    try {
      console.log(`Cancelling all jobs for season ${seasonNumber}`);

      // Get stored job info
      const jobsKey = `season:jobs:${seasonNumber}`;
      const jobsData = await this.redis.get(jobsKey);

      if (jobsData) {
        const jobs = JSON.parse(jobsData);

        // Cancel each job
        for (const [type, jobId] of Object.entries(jobs)) {
          if (jobId) {
            try {
              await this.scheduler.cancelJob(jobId as string);
              console.log(`Cancelled ${type} job: ${jobId}`);
            } catch (error) {
              console.warn(`Failed to cancel ${type} job ${jobId}:`, error);
            }
          }
        }

        // Remove job tracking
        await this.redis.del(jobsKey);
      }

      console.log(`All jobs cancelled for season ${seasonNumber}`);
    } catch (error) {
      console.error(`Failed to cancel jobs for season ${seasonNumber}:`, error);
      // Don't throw - cancellation failures shouldn't block operations
    }
  }

  /**
   * Store job tracking information in Redis
   * @param seasonNumber - Season number
   * @param jobType - Type of job
   * @param jobId - Job ID from scheduler
   * @param scheduledTime - When the job is scheduled to run
   */
  private async storeJobInfo(
    seasonNumber: number,
    jobType: string,
    jobId: string,
    scheduledTime: number
  ): Promise<void> {
    const jobsKey = `season:jobs:${seasonNumber}`;
    
    // Get existing jobs
    const existingData = await this.redis.get(jobsKey);
    const jobs = existingData ? JSON.parse(existingData) : {};

    // Add new job
    jobs[jobType] = jobId;
    jobs[`${jobType}_time`] = scheduledTime;

    // Save back
    await this.redis.set(jobsKey, JSON.stringify(jobs));
  }

  /**
   * Cancel a job if it exists
   * @param jobKey - Unique key for the job
   */
  private async cancelJobIfExists(jobKey: string): Promise<void> {
    try {
      // Note: Devvit doesn't provide a way to query jobs by name,
      // so we rely on stored job IDs
      // This is a placeholder for future implementation if needed
    } catch (error) {
      console.warn(`Failed to cancel job ${jobKey}:`, error);
    }
  }

  /**
   * Get job information for a season
   * @param seasonNumber - Season number
   * @returns Job information or null if not found
   */
  async getSeasonJobs(seasonNumber: number): Promise<Record<string, any> | null> {
    try {
      const jobsKey = `season:jobs:${seasonNumber}`;
      const jobsData = await this.redis.get(jobsKey);
      
      return jobsData ? JSON.parse(jobsData) : null;
    } catch (error) {
      console.error(`Failed to get jobs for season ${seasonNumber}:`, error);
      return null;
    }
  }

  /**
   * Handle season end job trigger
   * This is called by Devvit when the season-end job runs
   * @param seasonNumber - Season number from job data
   * @param onSeasonEnd - Callback to execute season end logic
   */
  async handleSeasonEnd(
    seasonNumber: number,
    onSeasonEnd: (seasonNumber: number) => Promise<void>
  ): Promise<void> {
    try {
      console.log(`Season end job triggered for season ${seasonNumber}`);

      // Verify this is the correct season by checking current season
      const currentSeasonData = await this.redis.get('season:current');
      if (!currentSeasonData) {
        console.warn(`No current season found when handling season end for ${seasonNumber}`);
        return;
      }

      const currentSeason = JSON.parse(currentSeasonData);
      if (currentSeason.seasonNumber !== seasonNumber) {
        console.warn(
          `Season end triggered for ${seasonNumber} but current season is ${currentSeason.seasonNumber}. Skipping.`
        );
        return;
      }

      // Execute season end logic
      await onSeasonEnd(seasonNumber);

      console.log(`Season end completed for season ${seasonNumber}`);
    } catch (error) {
      console.error(`Season end handler failed for season ${seasonNumber}:`, error);

      // Schedule retry in 1 minute
      try {
        console.log(`Scheduling retry for season ${seasonNumber} in 1 minute`);
        await this.scheduler.runJob({
          name: 'season-end-retry',
          runAt: new Date(Date.now() + 60 * 1000), // 1 minute from now
          data: { seasonNumber },
        });
      } catch (retryError) {
        console.error(`Failed to schedule retry for season ${seasonNumber}:`, retryError);
      }

      throw error;
    }
  }

  /**
   * Handle warning post job trigger
   * This is called by Devvit when warning jobs run
   * @param type - Type of warning ('24h' or '1h')
   * @param seasonNumber - Season number from job data
   * @param onWarning - Callback to execute warning post logic
   */
  async handleWarning(
    type: '24h' | '1h',
    seasonNumber: number,
    onWarning: (type: '24h' | '1h', seasonNumber: number) => Promise<void>
  ): Promise<void> {
    try {
      console.log(`${type} warning job triggered for season ${seasonNumber}`);

      // Verify this is the correct season
      const currentSeasonData = await this.redis.get('season:current');
      if (!currentSeasonData) {
        console.warn(`No current season found when handling ${type} warning for ${seasonNumber}`);
        return;
      }

      const currentSeason = JSON.parse(currentSeasonData);
      if (currentSeason.seasonNumber !== seasonNumber) {
        console.warn(
          `${type} warning triggered for ${seasonNumber} but current season is ${currentSeason.seasonNumber}. Skipping.`
        );
        return;
      }

      // Execute warning post logic
      await onWarning(type, seasonNumber);

      console.log(`${type} warning completed for season ${seasonNumber}`);
    } catch (error) {
      console.error(`${type} warning handler failed for season ${seasonNumber}:`, error);

      // Log error but don't retry - warning posts are not critical
      // Store failed post for manual review
      try {
        const failedPostsKey = 'season:failed-posts';
        const failedPost = {
          type: `warning-${type}`,
          seasonNumber,
          timestamp: Date.now(),
          error: error instanceof Error ? error.message : 'Unknown error',
        };
        // Use zAdd instead of lPush for Devvit Web Redis
        await this.redis.zAdd(failedPostsKey, {
          member: JSON.stringify(failedPost),
          score: Date.now(),
        });
      } catch (storeError) {
        console.error('Failed to store failed post:', storeError);
      }

      // Don't throw - warning failures shouldn't block the system
    }
  }
}
