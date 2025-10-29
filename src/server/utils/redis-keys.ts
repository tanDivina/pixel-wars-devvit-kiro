/**
 * Redis key pattern utilities for consistent key generation
 */

export const RedisKeys = {
  // Canvas state
  canvas: (postId: string) => `post:${postId}:canvas`,
  canvasUpdates: (postId: string) => `post:${postId}:canvas:updates`,

  // User data
  userCredits: (postId: string, username: string) => `post:${postId}:user:${username}:credits`,
  userStats: (postId: string, username: string) => `post:${postId}:user:${username}:stats`,

  // Leaderboards
  playerLeaderboard: (postId: string) => `post:${postId}:leaderboard:players`,
  
  // Teams
  teamAssignments: (postId: string) => `post:${postId}:teams`,
  
  // Zones
  zoneControl: (postId: string) => `post:${postId}:zones`,
  
  // Active players
  activePlayers: (postId: string) => `post:${postId}:active`,
  
  // Game configuration
  config: (postId: string) => `post:${postId}:config`,
  
  // Rate limiting
  rateLimit: (username: string) => `ratelimit:${username}`,
};

/**
 * Validate that a key follows the expected pattern
 */
export const validateKey = (key: string): boolean => {
  // Keys should start with 'post:' or 'ratelimit:'
  return key.startsWith('post:') || key.startsWith('ratelimit:');
};

/**
 * Format pixel coordinate for storage
 */
export const formatPixelKey = (x: number, y: number): string => {
  return `${x}:${y}`;
};

/**
 * Parse pixel coordinate from storage key
 */
export const parsePixelKey = (key: string): { x: number; y: number } => {
  const [x, y] = key.split(':').map(Number);
  return { x, y };
};

/**
 * Format pixel update for sorted set
 */
export const formatPixelUpdate = (x: number, y: number, teamId: string): string => {
  return `${x}:${y}:${teamId}`;
};

/**
 * Parse pixel update from sorted set
 */
export const parsePixelUpdate = (value: string): { x: number; y: number; teamId: string } => {
  const [x, y, teamId] = value.split(':');
  return { x: Number(x), y: Number(y), teamId };
};
