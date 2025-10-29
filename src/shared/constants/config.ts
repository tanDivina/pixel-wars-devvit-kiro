import type { GameConfig } from '../types/game';

export const DEFAULT_CONFIG: GameConfig = {
  canvasWidth: 100,
  canvasHeight: 100,
  creditCooldown: 120, // 2 minutes in seconds
  maxCredits: 10,
  initialCredits: 5,
  zoneSize: 10,
  teams: [
    { id: 'red', name: 'Red Team', color: '#FF4444' },
    { id: 'blue', name: 'Blue Team', color: '#4444FF' },
    { id: 'green', name: 'Green Team', color: '#44FF44' },
    { id: 'yellow', name: 'Yellow Team', color: '#FFFF44' },
  ],
};

export const POLLING_INTERVAL = 1000; // 1 second
export const LEADERBOARD_REFRESH_INTERVAL = 10000; // 10 seconds
export const ACTIVE_PLAYER_THRESHOLD = 300000; // 5 minutes in milliseconds
