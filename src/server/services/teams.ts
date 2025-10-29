import type { RedisClient } from '@devvit/web/server';
import type { Team, GameConfig } from '../../shared/types/game';
import { RedisKeys } from '../utils/redis-keys';

/**
 * Team assignment and management service
 */
export class TeamsService {
  constructor(private redis: RedisClient) {}

  /**
   * Get or assign team for a user
   */
  async getUserTeam(postId: string, username: string, config: GameConfig): Promise<Team> {
    const key = RedisKeys.teamAssignments(postId);
    const existingTeam = await this.redis.hGet(key, username);
    
    if (existingTeam) {
      return this.getTeamById(existingTeam, config);
    }
    
    // Assign new team
    const teamId = await this.assignTeam(postId, username, config);
    return this.getTeamById(teamId, config);
  }

  /**
   * Assign a team to a user based on activity or balancing
   * 
   * Assignment strategy:
   * 1. Try to assign based on user flair or activity (if userHint provided)
   * 2. Fall back to balanced assignment (smallest team)
   * 
   * @param postId - The post ID
   * @param username - The username to assign
   * @param config - Game configuration
   * @param userHint - Optional hint for team assignment (e.g., flair text, subreddit)
   */
  async assignTeam(
    postId: string,
    username: string,
    config: GameConfig,
    userHint?: string
  ): Promise<string> {
    let teamId: string | null = null;

    // Try to assign based on user hint (flair, subreddit, etc.)
    if (userHint) {
      teamId = this.getTeamFromHint(userHint, config);
    }

    // Fall back to balanced assignment
    if (!teamId) {
      teamId = await this.getBalancedTeam(postId, config);
    }
    
    // Assign user to team
    await this.setUserTeam(postId, username, teamId);
    return teamId;
  }

  /**
   * Get team ID from user hint (flair, subreddit name, etc.)
   * Matches hint against team names or colors
   */
  private getTeamFromHint(hint: string, config: GameConfig): string | null {
    const lowerHint = hint.toLowerCase();
    
    // Try to match team name
    for (const team of config.teams) {
      if (team.name.toLowerCase().includes(lowerHint) || lowerHint.includes(team.name.toLowerCase())) {
        return team.id;
      }
      
      // Try to match team ID
      if (team.id.toLowerCase() === lowerHint) {
        return team.id;
      }
    }
    
    return null;
  }

  /**
   * Get team with fewest members for balanced assignment
   */
  private async getBalancedTeam(postId: string, config: GameConfig): Promise<string> {
    if (config.teams.length === 0) {
      throw new Error('No teams configured');
    }
    
    // Get current team sizes
    const teamSizes = await this.getTeamSizes(postId, config);
    
    // Find team with fewest members
    let smallestTeam = config.teams[0].id;
    let smallestSize = teamSizes[smallestTeam] || 0;
    
    for (const team of config.teams) {
      const size = teamSizes[team.id] || 0;
      if (size < smallestSize) {
        smallestTeam = team.id;
        smallestSize = size;
      }
    }
    
    return smallestTeam;
  }

  /**
   * Set user's team
   */
  async setUserTeam(postId: string, username: string, teamId: string): Promise<void> {
    const key = RedisKeys.teamAssignments(postId);
    await this.redis.hSet(key, { [username]: teamId });
  }

  /**
   * Get team sizes (number of players per team)
   */
  async getTeamSizes(postId: string, config: GameConfig): Promise<Record<string, number>> {
    const key = RedisKeys.teamAssignments(postId);
    const assignments = await this.redis.hGetAll(key);
    
    const sizes: Record<string, number> = {};
    
    // Initialize all teams with 0
    for (const team of config.teams) {
      sizes[team.id] = 0;
    }
    
    // Count assignments
    for (const teamId of Object.values(assignments)) {
      sizes[teamId] = (sizes[teamId] || 0) + 1;
    }
    
    return sizes;
  }

  /**
   * Get team by ID
   */
  getTeamById(teamId: string, config: GameConfig): Team {
    const team = config.teams.find((t) => t.id === teamId);
    if (!team) {
      // Fallback to first team if not found
      if (config.teams.length === 0) {
        throw new Error('No teams configured');
      }
      const firstTeam = config.teams[0];
      if (!firstTeam) {
        throw new Error('No teams configured');
      }
      return firstTeam;
    }
    return team;
  }

  /**
   * Get all team assignments
   */
  async getAllTeamAssignments(postId: string): Promise<Record<string, string>> {
    const key = RedisKeys.teamAssignments(postId);
    return await this.redis.hGetAll(key);
  }

  /**
   * Get all users on a specific team
   */
  async getTeamMembers(postId: string, teamId: string): Promise<string[]> {
    const assignments = await this.getAllTeamAssignments(postId);
    const members: string[] = [];
    
    for (const [username, team] of Object.entries(assignments)) {
      if (team === teamId) {
        members.push(username);
      }
    }
    
    return members;
  }

  /**
   * Check if user is on a team
   */
  async isUserOnTeam(postId: string, username: string, teamId: string): Promise<boolean> {
    const key = RedisKeys.teamAssignments(postId);
    const userTeam = await this.redis.hGet(key, username);
    return userTeam === teamId;
  }

  /**
   * Get team statistics
   */
  async getTeamStats(postId: string, config: GameConfig): Promise<Record<string, { size: number; team: Team }>> {
    const sizes = await this.getTeamSizes(postId, config);
    const stats: Record<string, { size: number; team: Team }> = {};
    
    for (const team of config.teams) {
      stats[team.id] = {
        size: sizes[team.id] || 0,
        team,
      };
    }
    
    return stats;
  }
}
