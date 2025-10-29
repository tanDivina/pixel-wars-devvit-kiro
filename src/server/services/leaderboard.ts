import type { RedisClient } from '@devvit/web/server';
import type { PlayerRanking, TeamRanking } from '../../shared/types/game';
import { RedisKeys } from '../utils/redis-keys';

/**
 * Leaderboard management service
 */
export class LeaderboardService {
  constructor(private redis: RedisClient) {}

  /**
   * Update player's pixel count in leaderboard
   */
  async updatePlayerScore(postId: string, username: string, pixelsPlaced: number): Promise<void> {
    const key = RedisKeys.playerLeaderboard(postId);
    await this.redis.zAdd(key, { member: username, score: pixelsPlaced });
  }

  /**
   * Increment player's score by 1
   */
  async incrementPlayerScore(postId: string, username: string): Promise<number> {
    const key = RedisKeys.playerLeaderboard(postId);
    const newScore = await this.redis.zIncrBy(key, username, 1);
    return newScore;
  }

  /**
   * Get top N players
   */
  async getTopPlayers(postId: string, limit: number = 10): Promise<PlayerRanking[]> {
    const key = RedisKeys.playerLeaderboard(postId);
    const results = await this.redis.zRange(key, 0, limit - 1, { by: 'rank', reverse: true });
    
    const rankings: PlayerRanking[] = [];
    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      if (!result) continue; // Safety check
      
      const username = result.member;
      const pixelsPlaced = result.score;
      const team = await this.getPlayerTeam(postId, username);
      
      rankings.push({
        username,
        pixelsPlaced,
        rank: i + 1,
        team,
      });
    }
    
    return rankings;
  }

  /**
   * Get player's rank and score
   */
  async getPlayerRank(postId: string, username: string): Promise<{ rank: number; score: number }> {
    const key = RedisKeys.playerLeaderboard(postId);
    const score = await this.redis.zScore(key, username);
    
    // Get all players to calculate rank (simplified)
    const allPlayers = await this.redis.zRange(key, 0, -1, { by: 'rank', reverse: true });
    let rank = 0;
    for (let i = 0; i < allPlayers.length; i++) {
      const player = allPlayers[i];
      if (player && player.member === username) {
        rank = i + 1;
        break;
      }
    }
    
    return {
      rank,
      score: score ?? 0,
    };
  }

  /**
   * Get player's team from team assignments
   */
  private async getPlayerTeam(postId: string, username: string): Promise<string> {
    const key = RedisKeys.teamAssignments(postId);
    const team = await this.redis.hGet(key, username);
    return team ?? 'unknown';
  }

  /**
   * Calculate team rankings based on territory control
   */
  async calculateTeamRankings(
    _postId: string,
    teamZoneCounts: Record<string, number>,
    teamPixelCounts: Record<string, number>
  ): Promise<TeamRanking[]> {
    const teams = Object.keys(teamZoneCounts);
    const rankings: TeamRanking[] = [];
    
    for (const teamId of teams) {
      rankings.push({
        teamId,
        teamName: teamId, // Will be enriched with actual team name by caller
        zonesControlled: teamZoneCounts[teamId] || 0,
        totalPixels: teamPixelCounts[teamId] || 0,
        rank: 0, // Will be set after sorting
      });
    }
    
    // Sort by zones controlled (primary) and total pixels (secondary)
    rankings.sort((a, b) => {
      if (b.zonesControlled !== a.zonesControlled) {
        return b.zonesControlled - a.zonesControlled;
      }
      return b.totalPixels - a.totalPixels;
    });
    
    // Assign ranks
    rankings.forEach((ranking, index) => {
      ranking.rank = index + 1;
    });
    
    return rankings;
  }

  /**
   * Get all player scores for a specific team
   */
  async getTeamPlayerScores(postId: string, teamId: string): Promise<number> {
    const key = RedisKeys.playerLeaderboard(postId);
    const teamKey = RedisKeys.teamAssignments(postId);
    
    // Get all players
    const allPlayers = await this.redis.zRange(key, 0, -1, { by: 'rank' });
    
    let totalScore = 0;
    for (const player of allPlayers) {
      const playerTeam = await this.redis.hGet(teamKey, player.member);
      if (playerTeam === teamId) {
        totalScore += player.score;
      }
    }
    
    return totalScore;
  }

  /**
   * Get player count for a team
   */
  async getTeamPlayerCount(postId: string, teamId: string): Promise<number> {
    const teamKey = RedisKeys.teamAssignments(postId);
    const allAssignments = await this.redis.hGetAll(teamKey);
    
    let count = 0;
    for (const team of Object.values(allAssignments)) {
      if (team === teamId) {
        count++;
      }
    }
    
    return count;
  }

  /**
   * Clear leaderboard (for testing or reset)
   */
  async clearLeaderboard(postId: string): Promise<void> {
    const key = RedisKeys.playerLeaderboard(postId);
    await this.redis.del(key);
  }
}
