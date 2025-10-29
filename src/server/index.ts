import express from 'express';
import type {
  InitResponse,
  PlacePixelRequest,
  PlacePixelResponse,
  CanvasUpdatesResponse,
  LeaderboardResponse,
  SplashDataResponse,
} from '../shared/types/api';
import { redis, reddit, createServer, context, getServerPort } from '@devvit/web/server';
import { createPost } from './core/post';
import { CanvasService } from './services/canvas';
import { CreditsService } from './services/credits';
import { TeamsService } from './services/teams';
import { ZonesService } from './services/zones';
import { LeaderboardService } from './services/leaderboard';
import { ConfigService } from './services/config';
import { createPixelRateLimiter, createGeneralRateLimiter } from './middleware/rateLimiter';
import { authenticateUser, validatePostId } from './middleware/auth';
import {
  validatePlacePixelRequest,
  validateCanvasUpdatesRequest,
  sanitizeRequestBody,
  validateContentType,
  validateRequestSize,
} from './middleware/validation';

const app = express();

// Middleware for JSON body parsing with size limit
app.use(express.json({ limit: '1mb' }));
// Middleware for URL-encoded body parsing with size limit
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
// Middleware for plain text body parsing with size limit
app.use(express.text({ limit: '1mb' }));

// Security middleware
app.use(sanitizeRequestBody());
app.use(validateRequestSize(4 * 1024 * 1024)); // 4MB max as per platform limits

// Initialize services
const canvasService = new CanvasService(redis);
const creditsService = new CreditsService(redis);
const teamsService = new TeamsService(redis);
const zonesService = new ZonesService(redis);
const leaderboardService = new LeaderboardService(redis);
const configService = new ConfigService(redis);

// Season system will be initialized lazily on first request
// (Devvit Web requires context for Redis operations)
let seasonInitialized = false;
async function ensureSeasonInitialized() {
  if (seasonInitialized) return;
  
  try {
    const { SeasonService } = await import('./services/season.js');
    const seasonService = new SeasonService(redis);
    await seasonService.initialize();
    seasonInitialized = true;
    console.log('✅ Season system initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize season system:', error);
    // Don't throw - allow the app to continue without seasons
  }
}

// Initialize rate limiters
const pixelRateLimiter = createPixelRateLimiter(redis);
const generalRateLimiter = createGeneralRateLimiter(redis);

const router = express.Router();

// Authentication and postId validation will be applied per route
// Note: Devvit doesn't support wildcard routes like '/api/*'

router.get<{ postId: string }, InitResponse | { status: string; message: string }>(
  '/api/init',
  authenticateUser(reddit),
  validatePostId(context),
  generalRateLimiter.middleware(),
  async (req, res): Promise<void> => {
    const postId = (req as any).postId;
    const username = (req as any).username;

    try {

      // Get game configuration
      const config = await configService.getConfig(postId);

      // Get or assign team
      const team = await teamsService.getUserTeam(postId, username, config);

      // Initialize user credits if needed
      await creditsService.initializeUser(postId, username, config);

      // Get user credits and cooldown
      const { credits: pixelCredits, nextCreditTime } = await creditsService.getUserCredits(
        postId,
        username,
        config
      );

      // Get canvas state
      const canvas = await canvasService.getAllPixels(postId);

      // Get zone control
      const zones = await zonesService.getZoneControl(postId, config);

      // Update active players
      const { RedisKeys } = await import('./utils/redis-keys');
      await redis.zAdd(RedisKeys.activePlayers(postId), {
        member: username,
        score: Date.now(),
      });

      res.json({
        type: 'init',
        postId,
        username,
        team,
        pixelCredits,
        nextCreditTime,
        canvas,
        zones,
        config,
      });
    } catch (error) {
      console.error(`API Init Error for post ${postId}:`, error);
      let errorMessage = 'Unknown error during initialization';
      if (error instanceof Error) {
        errorMessage = `Initialization failed: ${error.message}`;
      }
      res.status(500).json({ status: 'error', message: errorMessage });
    }
  }
);

router.post<{ postId: string }, PlacePixelResponse | { status: string; message: string }, PlacePixelRequest>(
  '/api/place-pixel',
  authenticateUser(reddit),
  validatePostId(context),
  validateContentType(['application/json']),
  pixelRateLimiter.middleware(),
  async (req, res): Promise<void> => {
    const postId = (req as any).postId;
    const username = (req as any).username;

    try {
      const config = await configService.getConfig(postId);
      
      // Validate request with middleware
      await new Promise<void>((resolve, reject) => {
        validatePlacePixelRequest(config)(req, res, (err?: any) => {
          if (err) reject(err);
          else resolve();
        });
      });

      const { x, y } = req.body;

      // Check and deduct credit
      const hasCredits = await creditsService.hasCredits(postId, username, config);
      if (!hasCredits) {
        const timeRemaining = await creditsService.getTimeUntilNextCredit(postId, username, config);
        res.json({
          type: 'place-pixel',
          success: false,
          pixelCredits: 0,
          nextCreditTime: Date.now() + timeRemaining,
          error: 'No credits available',
        });
        return;
      }

      const { credits: pixelCredits, nextCreditTime } = await creditsService.deductCredit(
        postId,
        username,
        config
      );

      // Get user's team
      const team = await teamsService.getUserTeam(postId, username, config);

      // Place pixel
      await canvasService.setPixel(postId, x, y, team.id);

      // Update leaderboard
      await leaderboardService.incrementPlayerScore(postId, username);

      // Update zone control for affected zone
      const pixels = await canvasService.getAllPixels(postId);
      await zonesService.updateZoneForPixel(postId, x, y, pixels, config);

      res.json({
        type: 'place-pixel',
        success: true,
        pixelCredits,
        nextCreditTime,
      });
    } catch (error) {
      console.error(`API PlacePixel Error for post ${postId}:`, error);
      let errorMessage = 'Failed to place pixel';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      res.status(500).json({ status: 'error', message: errorMessage });
    }
  }
);

router.get<{ postId: string }, CanvasUpdatesResponse | { status: string; message: string }>(
  '/api/canvas-updates',
  authenticateUser(reddit),
  validatePostId(context),
  generalRateLimiter.middleware(),
  validateCanvasUpdatesRequest(),
  async (req, res): Promise<void> => {
    const postId = (req as any).postId;

    try {
      const since = parseInt(req.query.since as string);
      const config = await configService.getConfig(postId);

      const pixels = await canvasService.getUpdatesSince(postId, since);
      const zones = await zonesService.getZoneControl(postId, config);

      res.json({
        type: 'canvas-updates',
        pixels,
        zones,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error(`API CanvasUpdates Error for post ${postId}:`, error);
      res.status(500).json({ status: 'error', message: 'Failed to fetch updates' });
    }
  }
);

router.get<{ postId: string }, LeaderboardResponse | { status: string; message: string }>(
  '/api/leaderboard',
  authenticateUser(reddit),
  validatePostId(context),
  generalRateLimiter.middleware(),
  async (req, res): Promise<void> => {
    const postId = (req as any).postId;
    const username = (req as any).username;

    try {
      const config = await configService.getConfig(postId);

      // Get top players
      const players = await leaderboardService.getTopPlayers(postId, 10);

      // Get user's rank
      const { rank: userRank } = await leaderboardService.getPlayerRank(postId, username);

      // Calculate team rankings
      const zones = await zonesService.getZoneControl(postId, config);
      const teamZoneCounts = zonesService.countZonesByTeam(zones);
      const teamPixelCounts = await canvasService.getPixelCountByTeam(postId);
      const teams = await leaderboardService.calculateTeamRankings(
        postId,
        teamZoneCounts,
        teamPixelCounts
      );

      // Enrich team names
      for (const team of teams) {
        const teamData = teamsService.getTeamById(team.teamId, config);
        team.teamName = teamData.name;
      }

      res.json({
        type: 'leaderboard',
        players,
        teams,
        userRank,
      });
    } catch (error) {
      console.error(`API Leaderboard Error for post ${postId}:`, error);
      res.status(500).json({ status: 'error', message: 'Failed to fetch leaderboard' });
    }
  }
);

router.get<{ postId: string }, SplashDataResponse | { status: string; message: string }>(
  '/api/splash-data',
  authenticateUser(reddit),
  validatePostId(context),
  generalRateLimiter.middleware(),
  async (req, res): Promise<void> => {
    const postId = (req as any).postId;

    try {
      const config = await configService.getConfig(postId);
      const { RedisKeys } = await import('./utils/redis-keys');

      // Get team statistics
      const zones = await zonesService.getZoneControl(postId, config);
      const teamZoneCounts = zonesService.countZonesByTeam(zones);
      const teamPixelCounts = await canvasService.getPixelCountByTeam(postId);

      const teamStats = config.teams.map((team) => ({
        teamId: team.id,
        teamName: team.name,
        color: team.color,
        zonesControlled: teamZoneCounts[team.id] || 0,
        totalPixels: teamPixelCounts[team.id] || 0,
        playerCount: 0, // Will be calculated below
      }));

      // Get player counts per team
      for (const teamStat of teamStats) {
        teamStat.playerCount = await leaderboardService.getTeamPlayerCount(postId, teamStat.teamId);
      }

      // Count active players (last 5 minutes)
      const fiveMinutesAgo = Date.now() - 300000;
      const allActive = await redis.zRange(RedisKeys.activePlayers(postId), 0, -1, { by: 'rank' });
      const activePlayers = allActive.filter((p) => p.score >= fiveMinutesAgo).length;

      // Generate canvas preview (simplified - just return empty for now)
      // In a real implementation, this would generate a small PNG
      const canvasPreview = '';

      res.json({
        type: 'splash-data',
        canvasPreview,
        teamStats,
        activePlayers,
      });
    } catch (error) {
      console.error(`API SplashData Error for post ${postId}:`, error);
      res.status(500).json({ status: 'error', message: 'Failed to fetch splash data' });
    }
  }
);

router.post('/internal/on-app-install', async (_req, res): Promise<void> => {
  try {
    const post = await createPost();

    // Initialize game configuration for the post
    await configService.initializeConfig(post.id);

    res.json({
      status: 'success',
      message: `Post created in subreddit ${context.subredditName} with id ${post.id}`,
    });
  } catch (error) {
    console.error(`Error creating post: ${error}`);
    res.status(400).json({
      status: 'error',
      message: 'Failed to create post',
    });
  }
});

router.post('/internal/menu/post-create', async (_req, res): Promise<void> => {
  try {
    const post = await createPost();

    // Initialize game configuration for the post
    await configService.initializeConfig(post.id);

    res.json({
      navigateTo: `https://reddit.com/r/${context.subredditName}/comments/${post.id}`,
    });
  } catch (error) {
    console.error(`Error creating post: ${error}`);
    res.status(400).json({
      status: 'error',
      message: 'Failed to create post',
    });
  }
});

// Season API endpoints
router.get('/api/season/current', authenticateUser(reddit), generalRateLimiter.middleware(), async (_req, res): Promise<void> => {
  try {
    // Ensure season system is initialized
    await ensureSeasonInitialized();
    
    const { SeasonService } = await import('./services/season.js');
    const seasonService = new SeasonService(redis);

    const season = await seasonService.getCurrentSeason();
    const timeRemaining = await seasonService.getTimeRemaining();

    res.json({
      type: 'season-current',
      seasonNumber: season.seasonNumber,
      startTime: season.startTime,
      endTime: season.endTime,
      timeRemaining,
      status: season.status,
    });
  } catch (error) {
    console.error('API Season Current Error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch current season' });
  }
});

router.get('/api/season/history', authenticateUser(reddit), generalRateLimiter.middleware(), async (_req, res): Promise<void> => {
  try {
    await ensureSeasonInitialized();
    
    const { SeasonService } = await import('./services/season.js');
    const seasonService = new SeasonService(redis);

    const history = await seasonService.getAllSeasonHistory();

    res.json({
      type: 'season-history',
      history,
    });
  } catch (error) {
    console.error('API Season History Error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch season history' });
  }
});

router.get('/api/season/settings', authenticateUser(reddit), generalRateLimiter.middleware(), async (req, res): Promise<void> => {
  try {
    // Check if user is moderator
    const username = (req as any).username;
    const subreddit = await reddit.getSubredditInfoByName(context.subredditName);
    // Note: Moderator check would require additional Reddit API permissions
    // For now, we'll allow all authenticated users to view settings
    // TODO: Implement proper moderator check when API is available

    const { SeasonService } = await import('./services/season.js');
    const seasonService = new SeasonService(redis);

    const settings = await seasonService.getSettings();

    res.json({
      type: 'season-settings',
      ...settings,
    });
  } catch (error) {
    console.error('API Season Settings Error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch season settings' });
  }
});

router.post('/api/season/settings', authenticateUser(reddit), generalRateLimiter.middleware(), async (req, res): Promise<void> => {
  try {
    // Check if user is moderator
    const username = (req as any).username;
    const subreddit = await reddit.getSubredditInfoByName(context.subredditName);
    // Note: Moderator check would require additional Reddit API permissions
    // For now, we'll allow all authenticated users to update settings
    // TODO: Implement proper moderator check when API is available

    const { SeasonService } = await import('./services/season.js');
    const seasonService = new SeasonService(redis);

    await seasonService.updateSettings(req.body);

    res.json({ status: 'success', message: 'Settings updated' });
  } catch (error) {
    console.error('API Season Settings Update Error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to update season settings' });
  }
});

// Debug endpoint to check user credits (DEV ONLY)
router.get('/api/debug/credits', authenticateUser(reddit), validatePostId(context), async (req, res): Promise<void> => {
  try {
    const postId = (req as any).postId;
    const username = (req as any).username;
    const config = await configService.getConfig(postId);
    
    const { RedisKeys } = await import('./utils/redis-keys');
    const key = RedisKeys.userCredits(postId, username);
    const data = await redis.hGetAll(key);
    
    const credits = await creditsService.getUserCredits(postId, username, config);
    const timeUntilNext = await creditsService.getTimeUntilNextCredit(postId, username, config);
    
    res.json({
      username,
      rawRedisData: data,
      processedCredits: credits,
      timeUntilNextMs: timeUntilNext,
      timeUntilNextFormatted: `${Math.floor(timeUntilNext / 60000)}:${Math.floor((timeUntilNext % 60000) / 1000).toString().padStart(2, '0')}`,
      currentTime: Date.now(),
    });
  } catch (error) {
    console.error('Debug credits error:', error);
    res.status(500).json({ error: String(error) });
  }
});

// Admin endpoint to manually start a new season (simple version - just increments season)
router.post('/api/season/start-new-simple', authenticateUser(reddit), generalRateLimiter.middleware(), async (_req, res): Promise<void> => {
  try {
    await ensureSeasonInitialized();
    
    const { SeasonService } = await import('./services/season.js');
    const seasonService = new SeasonService(redis);

    // Just start a new season (increments number)
    const newSeason = await seasonService.startNewSeason();

    res.json({
      status: 'success',
      message: `Season ${newSeason.seasonNumber} started!`,
      seasonNumber: newSeason.seasonNumber,
      startTime: newSeason.startTime,
      endTime: newSeason.endTime,
    });
  } catch (error) {
    console.error('API Start New Season Error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to start new season' });
  }
});

// Admin endpoint to manually start a new season (full version with game reset)
router.post('/api/season/start-new', authenticateUser(reddit), validatePostId(context), generalRateLimiter.middleware(), async (req, res): Promise<void> => {
  try {
    const postId = (req as any).postId;
    const username = (req as any).username;
    
    console.log(`User ${username} requesting to start new season for post ${postId}`);

    const { SeasonService } = await import('./services/season.js');
    const seasonService = new SeasonService(redis);
    
    const config = await configService.getConfig(postId);

    // End current season and start new one
    const history = await seasonService.endSeason(postId, config);

    res.json({
      status: 'success',
      message: `Season ${history.seasonNumber} ended. New season started!`,
      previousSeason: history.seasonNumber,
      winner: history.winningTeam,
    });
  } catch (error) {
    console.error('API Start New Season Error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to start new season' });
  }
});

// Use router middleware
app.use(router);

// Get port from environment variable with fallback
const port = getServerPort();

const server = createServer(app);
server.on('error', (err) => console.error(`server error; ${err.stack}`));
server.listen(port);
