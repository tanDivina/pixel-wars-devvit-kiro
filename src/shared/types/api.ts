import type { Team, PixelData, ZoneData, GameConfig, PlayerRanking, TeamRanking, TeamStats } from './game';

export type InitResponse = {
  type: 'init';
  postId: string;
  username: string;
  team: Team;
  pixelCredits: number;
  nextCreditTime: number;
  canvas: PixelData[];
  zones: ZoneData[];
  config: GameConfig;
};

export type PlacePixelRequest = {
  x: number;
  y: number;
};

export type PlacePixelResponse = {
  type: 'place-pixel';
  success: boolean;
  pixelCredits: number;
  nextCreditTime: number;
  error?: string;
};

export type CanvasUpdatesResponse = {
  type: 'canvas-updates';
  pixels: PixelData[];
  zones: ZoneData[];
  timestamp: number;
};

export type LeaderboardResponse = {
  type: 'leaderboard';
  players: PlayerRanking[];
  teams: TeamRanking[];
  userRank: number;
};

export type SplashDataResponse = {
  type: 'splash-data';
  canvasPreview: string;
  teamStats: TeamStats[];
  activePlayers: number;
};

// Season API types
export type SeasonCurrentResponse = {
  type: 'season-current';
  seasonNumber: number;
  startTime: number;
  endTime: number;
  timeRemaining: number;
  status: 'active' | 'ending' | 'ended';
};

export type SeasonHistoryResponse = {
  type: 'season-history';
  history: Array<{
    seasonNumber: number;
    startTime: number;
    endTime: number;
    duration: number;
    winningTeam: {
      id: string;
      name: string;
      color: string;
      finalScore: number;
    };
    finalStandings: Array<{
      teamId: string;
      teamName: string;
      score: number;
      zonesControlled: number;
      playerCount: number;
    }>;
    statistics: {
      totalPixelsPlaced: number;
      totalPlayers: number;
      topPlayer: {
        username: string;
        teamId: string;
        pixelsPlaced: number;
      };
    };
  }>;
};

export type SeasonSettingsResponse = {
  type: 'season-settings';
  durationMs: number;
  enableAutoPosts: boolean;
  enable24hWarning: boolean;
  enable1hWarning: boolean;
};

export type SeasonSettingsUpdateRequest = {
  durationMs?: number;
  enableAutoPosts?: boolean;
  enable24hWarning?: boolean;
  enable1hWarning?: boolean;
};
