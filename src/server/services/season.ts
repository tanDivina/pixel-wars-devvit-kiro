/**
 * Season Service
 * 
 * Core service for managing season lifecycle including initialization,
 * time calculations, and settings management.
 */

import type { RedisClient } from '@devvit/web/server';
import type {
  SeasonMetadata,
  SeasonSettings,
  SeasonHistory,
} from '../../shared/types/season.js';
import { SeasonStorageService, DEFAULT_SEASON_SETTINGS } from './seasonStorage.js';
import { RedisKeys } from '../utils/redis-keys.js';

export class SeasonService {
  private storage: SeasonStorageService;

  constructor(private redis: RedisClient) {
    this.storage = new SeasonStorageService(redis);
  }

  /**
   * Initialize the season system
   * Creates Season 1 if no season exists, otherwise loads existing season
   * Sets default settings if none exist
   */
  async initialize(): Promise<void> {
    try {
      // Ensure settings exist (will use defaults if not)
      const settings = await this.storage.getSettings();
      console.log('Season settings loaded:', settings);
      
      const currentSeason = await this.storage.getCurrentSeason();
      
      if (!currentSeason) {
        console.log('No existing season found. Initializing Season 1...');
        await this.startNewSeason();
      } else {
        console.log(`Season system initialized. Current season: ${currentSeason.seasonNumber}`);
        
        // Log time remaining for visibility
        const timeRemaining = await this.getTimeRemaining();
        const hoursRemaining = Math.floor(timeRemaining / (1000 * 60 * 60));
        console.log(`Time remaining in season ${currentSeason.seasonNumber}: ${hoursRemaining} hours`);
      }
    } catch (error) {
      console.error('Failed to initialize season system:', error);
      throw new Error('Season system initialization failed');
    }
  }

  /**
   * Get current season metadata
   * @returns Current season metadata
   * @throws Error if no season exists
   */
  async getCurrentSeason(): Promise<SeasonMetadata> {
    try {
      const season = await this.storage.getCurrentSeason();
      
      if (!season) {
        throw new Error('No active season found');
      }
      
      return season;
    } catch (error) {
      console.error('Failed to get current season:', error);
      throw error;
    }
  }

  /**
   * Get time remaining in current season
   * @returns Time remaining in milliseconds (0 if season has ended)
   */
  async getTimeRemaining(): Promise<number> {
    try {
      const season = await this.getCurrentSeason();
      const now = Date.now();
      const remaining = Math.max(0, season.endTime - now);
      
      return remaining;
    } catch (error) {
      console.error('Failed to calculate time remaining:', error);
      throw new Error('Failed to calculate time remaining');
    }
  }

  /**
   * Get season settings
   * @returns Current season settings
   */
  async getSettings(): Promise<SeasonSettings> {
    try {
      return await this.storage.getSettings();
    } catch (error) {
      console.error('Failed to get season settings:', error);
      // Return defaults on error
      return { ...DEFAULT_SEASON_SETTINGS };
    }
  }

  /**
   * Update season settings
   * Settings will apply to the next season, not the current one
   * @param settings - Partial settings to update
   * @throws Error if settings are invalid
   */
  async updateSettings(settings: Partial<SeasonSettings>): Promise<void> {
    try {
      // Get current settings
      const currentSettings = await this.storage.getSettings();
      
      // Merge with new settings
      const updatedSettings: SeasonSettings = {
        ...currentSettings,
        ...settings,
      };
      
      // Validate duration
      if (updatedSettings.durationMs <= 0) {
        throw new Error('Season duration must be positive');
      }
      
      // Save updated settings
      await this.storage.setSettings(updatedSettings);
      
      console.log('Season settings updated:', updatedSettings);
    } catch (error) {
      console.error('Failed to update season settings:', error);
      throw error;
    }
  }

  /**
   * Start a new season
   * Creates a new season with incremented season number
   * @returns New season metadata
   */
  async startNewSeason(): Promise<SeasonMetadata> {
    try {
      // Get current season (if exists) to increment number
      const currentSeason = await this.storage.getCurrentSeason();
      const newSeasonNumber = currentSeason ? currentSeason.seasonNumber + 1 : 1;
      
      // Get settings for duration
      const settings = await this.storage.getSettings();
      
      // Create new season
      const now = Date.now();
      const newSeason: SeasonMetadata = {
        seasonNumber: newSeasonNumber,
        startTime: now,
        endTime: now + settings.durationMs,
        duration: settings.durationMs,
        status: 'active',
      };
      
      // Save new season
      await this.storage.setCurrentSeason(newSeason);
      
      console.log(`Season ${newSeasonNumber} started. Ends at ${new Date(newSeason.endTime).toISOString()}`);
      
      return newSeason;
    } catch (error) {
      console.error('Failed to start new season:', error);
      throw new Error('Failed to start new season');
    }
  }

  /**
   * Reset game state for a new season
   * Clears canvas, scores, and zones but preserves team assignments
   * @param postId - The post ID to reset
   */
  async resetGameState(postId: string): Promise<void> {
    try {
      console.log(`Resetting game state for post ${postId}...`);
      
      // Use Redis pipeline for batch operations
      const pipeline = [
        // Clear canvas pixels
        this.redis.del(RedisKeys.canvas(postId)),
        
        // Clear canvas updates log
        this.redis.del(RedisKeys.canvasUpdates(postId)),
        
        // Clear player leaderboard (scores)
        this.redis.del(RedisKeys.playerLeaderboard(postId)),
        
        // Clear zone control
        this.redis.del(RedisKeys.zoneControl(postId)),
      ];
      
      // Execute all deletions
      await Promise.all(pipeline);
      
      // Note: Team assignments (RedisKeys.teamAssignments) are NOT cleared
      // This preserves player team assignments across seasons
      
      console.log(`Game state reset complete for post ${postId}`);
    } catch (error) {
      console.error(`Failed to reset game state for post ${postId}:`, error);
      throw new Error('Failed to reset game state');
    }
  }

  /**
   * Calculate winner and final standings for a completed season
   * @param postId - The post ID
   * @param config - Game configuration with team definitions
   * @returns Season history with winner and statistics
   */
  async calculateWinner(
    postId: string,
    config: { teams: Array<{ id: string; name: string; color: string }> }
  ): Promise<Omit<SeasonHistory, 'seasonNumber' | 'startTime' | 'endTime' | 'duration'>> {
    try {
      console.log(`Calculating winner for post ${postId}...`);

      // Get all canvas pixels
      const canvasKey = RedisKeys.canvas(postId);
      const canvasData = await this.redis.hGetAll(canvasKey);

      // Get zone control data
      const zoneKey = RedisKeys.zoneControl(postId);
      const zoneData = await this.redis.hGetAll(zoneKey);

      // Get player leaderboard
      const leaderboardKey = RedisKeys.playerLeaderboard(postId);
      const playerScores = await this.redis.zRange(leaderboardKey, 0, -1, {
        by: 'rank',
        reverse: true,
      });

      // Get team assignments
      const teamKey = RedisKeys.teamAssignments(postId);
      const teamAssignments = await this.redis.hGetAll(teamKey);

      // Calculate pixel counts by team
      const pixelCounts: Record<string, number> = {};
      for (const teamId of Object.values(canvasData)) {
        pixelCounts[teamId] = (pixelCounts[teamId] || 0) + 1;
      }

      // Calculate zone counts by team
      const zoneCounts: Record<string, number> = {};
      for (const teamId of Object.values(zoneData)) {
        zoneCounts[teamId] = (zoneCounts[teamId] || 0) + 1;
      }

      // Calculate player counts by team
      const playerCounts: Record<string, number> = {};
      for (const teamId of Object.values(teamAssignments)) {
        playerCounts[teamId] = (playerCounts[teamId] || 0) + 1;
      }

      // Calculate team scores (zones * 100 + pixels)
      const teamScores: Record<string, number> = {};
      for (const team of config.teams) {
        const zones = zoneCounts[team.id] || 0;
        const pixels = pixelCounts[team.id] || 0;
        teamScores[team.id] = zones * 100 + pixels;
      }

      // Create final standings
      const finalStandings = config.teams
        .map((team) => ({
          teamId: team.id,
          teamName: team.name,
          score: teamScores[team.id] || 0,
          zonesControlled: zoneCounts[team.id] || 0,
          playerCount: playerCounts[team.id] || 0,
        }))
        .sort((a, b) => b.score - a.score);

      // Determine winning team
      const winner = finalStandings[0];
      if (!winner) {
        throw new Error('No teams found in standings');
      }

      const winningTeamConfig = config.teams.find((t) => t.id === winner.teamId);
      if (!winningTeamConfig) {
        throw new Error(`Winning team ${winner.teamId} not found in config`);
      }

      const winningTeam = {
        id: winner.teamId,
        name: winner.teamName,
        color: winningTeamConfig.color,
        finalScore: winner.score,
      };

      // Calculate statistics
      const totalPixelsPlaced = Object.values(pixelCounts).reduce((sum, count) => sum + count, 0);
      const totalPlayers = Object.keys(teamAssignments).length;

      // Find top player
      let topPlayer = {
        username: 'Unknown',
        teamId: 'unknown',
        pixelsPlaced: 0,
      };

      if (playerScores.length > 0) {
        const topPlayerData = playerScores[0];
        if (topPlayerData) {
          topPlayer = {
            username: topPlayerData.member,
            teamId: teamAssignments[topPlayerData.member] || 'unknown',
            pixelsPlaced: topPlayerData.score,
          };
        }
      }

      // Find closest zone (zone with smallest margin between top 2 teams)
      // For now, use a simple placeholder since detailed zone pixel counts aren't stored
      const closestZone = {
        x: 0,
        y: 0,
        marginPixels: 0,
      };

      const statistics = {
        totalPixelsPlaced,
        totalPlayers,
        topPlayer,
        closestZone,
      };

      console.log(`Winner calculated: ${winningTeam.name} with score ${winningTeam.finalScore}`);

      return {
        winningTeam,
        finalStandings,
        statistics,
      };
    } catch (error) {
      console.error(`Failed to calculate winner for post ${postId}:`, error);
      throw new Error('Failed to calculate winner');
    }
  }

  /**
   * Save season history for a completed season
   * @param history - Complete season history record
   */
  async saveHistory(history: SeasonHistory): Promise<void> {
    try {
      console.log(`Saving history for season ${history.seasonNumber}...`);
      await this.storage.saveSeasonHistory(history);
      console.log(`Season ${history.seasonNumber} history saved successfully`);
    } catch (error) {
      console.error(`Failed to save season ${history.seasonNumber} history:`, error);
      throw new Error('Failed to save season history');
    }
  }

  /**
   * Get season history for a specific season
   * @param seasonNumber - The season number to retrieve
   * @returns Season history or null if not found
   */
  async getSeasonHistory(seasonNumber: number): Promise<SeasonHistory | null> {
    try {
      return await this.storage.getSeasonHistory(seasonNumber);
    } catch (error) {
      console.error(`Failed to get season ${seasonNumber} history:`, error);
      return null;
    }
  }

  /**
   * Get all season history records (up to last 10 seasons)
   * @returns Array of season history records, sorted by season number descending
   */
  async getAllSeasonHistory(): Promise<SeasonHistory[]> {
    try {
      return await this.storage.getAllSeasonHistory();
    } catch (error) {
      console.error('Failed to get all season history:', error);
      return [];
    }
  }

  /**
   * End current season and start a new one
   * Orchestrates the complete season transition process with distributed locking
   * @param postId - The post ID
   * @param config - Game configuration with team definitions
   * @returns Season history for the completed season
   */
  async endSeason(
    postId: string,
    config: { teams: Array<{ id: string; name: string; color: string }> }
  ): Promise<SeasonHistory> {
    const lockKey = 'season:lock';
    const lockAcquired = await this.storage.acquireLock(lockKey, 60000); // 60s TTL

    if (!lockAcquired) {
      throw new Error('Season end already in progress');
    }

    try {
      console.log('Starting season end process...');

      // Get current season metadata before ending
      const currentSeason = await this.getCurrentSeason();
      console.log(`Ending season ${currentSeason.seasonNumber}...`);

      // 1. Calculate winner (must succeed)
      console.log('Step 1/4: Calculating winner...');
      const winnerData = await this.calculateWinner(postId, config);

      // Create complete season history
      const history: SeasonHistory = {
        seasonNumber: currentSeason.seasonNumber,
        startTime: currentSeason.startTime,
        endTime: currentSeason.endTime,
        duration: currentSeason.duration,
        ...winnerData,
      };

      // 2. Save history (log error but continue if fails)
      console.log('Step 2/4: Saving season history...');
      try {
        await this.saveHistory(history);
      } catch (error) {
        console.error('Failed to save season history (continuing):', error);
        // Store failed operation for manual retry
        await this.storage.addFailedPost({
          title: `Season ${currentSeason.seasonNumber} History Save Failed`,
          body: `Failed to save history: ${error instanceof Error ? error.message : 'Unknown error'}`,
          timestamp: Date.now(),
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }

      // 3. Reset game state (must succeed)
      console.log('Step 3/4: Resetting game state...');
      await this.resetGameState(postId);

      // 4. Start new season (must succeed)
      console.log('Step 4/4: Starting new season...');
      const newSeason = await this.startNewSeason();

      console.log(
        `Season transition complete! Season ${currentSeason.seasonNumber} ended, Season ${newSeason.seasonNumber} started.`
      );
      console.log(`Winner: ${history.winningTeam.name} with score ${history.winningTeam.finalScore}`);

      return history;
    } finally {
      // Always release lock
      await this.storage.releaseLock(lockKey);
    }
  }
}
