/**
 * Season System Type Definitions
 * 
 * Defines all types and interfaces for the season system including
 * metadata, settings, history, and related data structures.
 */

/**
 * Current season metadata stored in Redis
 */
export interface SeasonMetadata {
  seasonNumber: number;
  startTime: number; // Unix timestamp in milliseconds
  endTime: number; // Unix timestamp in milliseconds
  duration: number; // Duration in milliseconds
  status: 'active' | 'ending' | 'ended';
}

/**
 * Season configuration settings (moderator-controlled)
 */
export interface SeasonSettings {
  durationMs: number; // Season duration in milliseconds
  enableAutoPosts: boolean; // Enable automated Reddit posts
  enable24hWarning: boolean; // Post 24h warning
  enable1hWarning: boolean; // Post 1h warning
}

/**
 * Team standings for a completed season
 */
export interface TeamStanding {
  teamId: string;
  teamName: string;
  score: number;
  zonesControlled: number;
  playerCount: number;
}

/**
 * Winning team information
 */
export interface WinningTeam {
  id: string;
  name: string;
  color: string;
  finalScore: number;
}

/**
 * Top player statistics
 */
export interface TopPlayer {
  username: string;
  teamId: string;
  pixelsPlaced: number;
}

/**
 * Closest zone battle information
 */
export interface ClosestZone {
  x: number;
  y: number;
  marginPixels: number;
}

/**
 * Season statistics
 */
export interface SeasonStatistics {
  totalPixelsPlaced: number;
  totalPlayers: number;
  topPlayer: TopPlayer;
  closestZone: ClosestZone;
}

/**
 * Complete season history record for a completed season
 */
export interface SeasonHistory {
  seasonNumber: number;
  startTime: number;
  endTime: number;
  duration: number;
  winningTeam: WinningTeam;
  finalStandings: TeamStanding[];
  statistics: SeasonStatistics;
}

/**
 * Scheduler job tracking information
 */
export interface SeasonJobs {
  endJob?: string;
  warning24hJob?: string;
  warning1hJob?: string;
}
