export interface Team {
  id: string;
  name: string;
  color: string;
}

export interface PixelData {
  x: number;
  y: number;
  teamId: string;
  timestamp: number;
}

export interface ZoneData {
  x: number;
  y: number;
  controllingTeam: string | null;
  pixelCount: Record<string, number>;
}

export interface PlayerRanking {
  username: string;
  pixelsPlaced: number;
  rank: number;
  team: string;
}

export interface TeamRanking {
  teamId: string;
  teamName: string;
  zonesControlled: number;
  totalPixels: number;
  rank: number;
}

export interface TeamStats {
  teamId: string;
  teamName: string;
  color: string;
  zonesControlled: number;
  totalPixels: number;
  playerCount: number;
}

export interface GameConfig {
  canvasWidth: number;
  canvasHeight: number;
  creditCooldown: number;
  maxCredits: number;
  initialCredits: number;
  zoneSize: number;
  teams: Team[];
}
