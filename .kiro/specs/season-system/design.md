# Season System Design Document

## Overview

The Season System adds time-limited competitive seasons to Pixel Wars with automatic lifecycle management, countdown timers, winner announcements, season history tracking, and automated Reddit posts to keep communities engaged. The system leverages Devvit's scheduler for reliable timing and Reddit API for automated community updates.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client (React)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  Countdown   │  │   Winner     │  │  Season History  │  │
│  │    Timer     │  │    Modal     │  │   Leaderboard    │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                    API Calls (fetch)
                              │
┌─────────────────────────────────────────────────────────────┐
│                    Server (Express + Devvit)                 │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Season API Endpoints                     │   │
│  │  /api/season/current  /api/season/history            │   │
│  │  /api/season/settings (mod only)                     │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Season Service Layer                     │   │
│  │  - Season lifecycle management                        │   │
│  │  - Winner calculation                                 │   │
│  │  - History tracking                                   │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │           Devvit Scheduler Integration                │   │
│  │  - Season end job                                     │   │
│  │  - Automated post jobs (24h, 1h warnings)            │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Reddit Post Service                      │   │
│  │  - Season start posts                                 │   │
│  │  - Warning posts (24h, 1h)                           │   │
│  │  - Winner announcement posts                          │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                    Data Persistence
                              │
┌─────────────────────────────────────────────────────────────┐
│                         Redis Storage                        │
│  - season:current (season metadata)                          │
│  - season:settings (configuration)                           │
│  - season:history:{seasonNum} (completed seasons)            │
│  - season:lock (prevent concurrent resets)                   │
└─────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. Season Service (`src/server/services/season.ts`)

Core service managing season lifecycle.

```typescript
interface SeasonMetadata {
  seasonNumber: number;
  startTime: number; // Unix timestamp
  endTime: number; // Unix timestamp
  duration: number; // Duration in milliseconds
  status: 'active' | 'ending' | 'ended';
}

interface SeasonSettings {
  durationMs: number; // Season duration in milliseconds
  enableAutoPosts: boolean; // Enable automated Reddit posts
  enable24hWarning: boolean; // Post 24h warning
  enable1hWarning: boolean; // Post 1h warning
}

interface SeasonHistory {
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
    closestZone: {
      x: number;
      y: number;
      marginPixels: number;
    };
  };
}

class SeasonService {
  // Initialize season system on app start
  async initialize(): Promise<void>;
  
  // Get current season metadata
  async getCurrentSeason(): Promise<SeasonMetadata>;
  
  // Get time remaining in current season
  async getTimeRemaining(): Promise<number>;
  
  // End current season and start new one
  async endSeason(): Promise<SeasonHistory>;
  
  // Start a new season
  async startNewSeason(): Promise<SeasonMetadata>;
  
  // Get season history (last N seasons)
  async getSeasonHistory(limit: number): Promise<SeasonHistory[]>;
  
  // Get/set season settings (moderator only)
  async getSettings(): Promise<SeasonSettings>;
  async updateSettings(settings: Partial<SeasonSettings>): Promise<void>;
  
  // Calculate winner and final standings
  async calculateWinner(): Promise<SeasonHistory>;
  
  // Reset game state for new season
  async resetGameState(): Promise<void>;
}
```

### 2. Scheduler Service (`src/server/services/scheduler.ts`)

Manages Devvit scheduler jobs for season timing.

```typescript
interface SchedulerJob {
  id: string;
  type: 'season-end' | 'warning-24h' | 'warning-1h';
  scheduledTime: number;
  seasonNumber: number;
}

class SchedulerService {
  // Schedule season end job
  async scheduleSeasonEnd(endTime: number, seasonNumber: number): Promise<void>;
  
  // Schedule warning posts
  async scheduleWarnings(endTime: number, seasonNumber: number): Promise<void>;
  
  // Cancel all jobs for a season
  async cancelSeasonJobs(seasonNumber: number): Promise<void>;
  
  // Handle season end trigger
  async handleSeasonEnd(seasonNumber: number): Promise<void>;
  
  // Handle warning post trigger
  async handleWarning(type: '24h' | '1h', seasonNumber: number): Promise<void>;
}
```

### 3. Reddit Post Service (`src/server/services/redditPosts.ts`)

Creates automated Reddit posts for season events.

```typescript
interface PostTemplate {
  title: string;
  body: string;
}

class RedditPostService {
  // Post season start announcement
  async postSeasonStart(season: SeasonMetadata): Promise<void>;
  
  // Post 24h warning with standings
  async post24HourWarning(season: SeasonMetadata, standings: TeamStandings[]): Promise<void>;
  
  // Post 1h final warning
  async post1HourWarning(season: SeasonMetadata, standings: TeamStandings[]): Promise<void>;
  
  // Post winner announcement
  async postWinnerAnnouncement(history: SeasonHistory): Promise<void>;
  
  // Generate post content from template
  private generatePost(template: PostTemplate, data: any): { title: string; body: string };
  
  // Format team standings for posts
  private formatStandings(standings: TeamStandings[]): string;
}
```

### 4. Client Components

#### Countdown Timer Component (`src/client/components/CountdownTimer.tsx`)

```typescript
interface CountdownTimerProps {
  endTime: number; // Unix timestamp
  onSeasonEnd?: () => void;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({ endTime, onSeasonEnd }) => {
  // Display format:
  // > 24h: "5d 12h remaining"
  // < 24h: "23h 45m remaining"
  // < 1h: "45m 30s remaining" (red, pulsing)
  // < 5m: "4:30 remaining" (red, urgent animation)
};
```

#### Winner Modal Component (`src/client/components/WinnerModal.tsx`)

```typescript
interface WinnerModalProps {
  history: SeasonHistory;
  onClose: () => void;
}

export const WinnerModal: React.FC<WinnerModalProps> = ({ history, onClose }) => {
  // Full-screen modal with:
  // - Winning team celebration
  // - Trophy animation
  // - Final standings
  // - Season statistics
  // - Auto-close after 10 seconds
};
```

#### Season History Tab (`src/client/components/SeasonHistory.tsx`)

```typescript
interface SeasonHistoryProps {
  history: SeasonHistory[];
  currentSeason: SeasonMetadata;
}

export const SeasonHistory: React.FC<SeasonHistoryProps> = ({ history, currentSeason }) => {
  // Display list of past seasons with:
  // - Season number and dates
  // - Winning team
  // - Final scores
  // - Expandable details
};
```

## Data Models

### Redis Keys Structure

```
# Current season metadata
season:current -> JSON {
  seasonNumber: number,
  startTime: number,
  endTime: number,
  duration: number,
  status: string
}

# Season settings
season:settings -> JSON {
  durationMs: number,
  enableAutoPosts: boolean,
  enable24hWarning: boolean,
  enable1hWarning: boolean
}

# Season history (one per completed season)
season:history:{seasonNumber} -> JSON {
  seasonNumber: number,
  startTime: number,
  endTime: number,
  winningTeam: {...},
  finalStandings: [...],
  statistics: {...}
}

# Season history index (list of season numbers)
season:history:index -> List [1, 2, 3, ...]

# Season lock (prevent concurrent resets)
season:lock -> String "locked" (with TTL)

# Scheduler job tracking
season:jobs:{seasonNumber} -> JSON {
  endJob: string,
  warning24hJob: string,
  warning1hJob: string
}
```

## Error Handling

### Season End Failures

```typescript
async endSeason(): Promise<SeasonHistory> {
  const lock = await this.acquireLock('season:lock', 60000); // 60s TTL
  if (!lock) {
    throw new Error('Season end already in progress');
  }
  
  try {
    // 1. Calculate winner (must succeed)
    const history = await this.calculateWinner();
    
    // 2. Save history (log error but continue if fails)
    try {
      await this.saveHistory(history);
    } catch (error) {
      console.error('Failed to save season history:', error);
    }
    
    // 3. Post winner announcement (log error but continue if fails)
    try {
      await this.redditPostService.postWinnerAnnouncement(history);
    } catch (error) {
      console.error('Failed to post winner announcement:', error);
    }
    
    // 4. Reset game state (must succeed)
    await this.resetGameState();
    
    // 5. Start new season (must succeed)
    await this.startNewSeason();
    
    return history;
  } finally {
    await this.releaseLock('season:lock');
  }
}
```

### Reddit API Failures

```typescript
async postToReddit(title: string, body: string): Promise<void> {
  try {
    await this.reddit.submitPost({
      title,
      text: body,
      subredditName: this.subredditName,
    });
  } catch (error) {
    // Log error but don't throw - season operations should continue
    console.error('Failed to create Reddit post:', error);
    
    // Store failed post for manual retry
    await this.redis.lpush('season:failed-posts', JSON.stringify({
      title,
      body,
      timestamp: Date.now(),
      error: error.message,
    }));
  }
}
```

### Scheduler Job Failures

```typescript
async handleSeasonEnd(seasonNumber: number): Promise<void> {
  try {
    const currentSeason = await this.getCurrentSeason();
    
    // Verify this is the correct season
    if (currentSeason.seasonNumber !== seasonNumber) {
      console.warn(`Season end triggered for ${seasonNumber} but current is ${currentSeason.seasonNumber}`);
      return;
    }
    
    await this.endSeason();
  } catch (error) {
    console.error('Season end failed:', error);
    
    // Schedule retry in 1 minute
    await this.scheduler.runJob({
      name: 'season-end-retry',
      cron: `*/${1} * * * *`, // Run in 1 minute
      data: { seasonNumber },
    });
  }
}
```

## Testing Strategy

### Unit Tests

```typescript
// Season Service Tests
describe('SeasonService', () => {
  test('should initialize first season on app start');
  test('should calculate correct time remaining');
  test('should determine winner correctly');
  test('should reset game state on season end');
  test('should preserve team assignments on reset');
  test('should handle concurrent season end attempts');
  test('should save season history correctly');
});

// Scheduler Service Tests
describe('SchedulerService', () => {
  test('should schedule season end job');
  test('should schedule warning jobs');
  test('should cancel jobs when season ends early');
  test('should handle job execution failures');
  test('should not schedule 24h warning for short seasons');
});

// Reddit Post Service Tests
describe('RedditPostService', () => {
  test('should generate season start post');
  test('should generate warning posts with standings');
  test('should generate winner announcement');
  test('should handle Reddit API failures gracefully');
  test('should format standings correctly');
});
```

### Integration Tests

```typescript
describe('Season System Integration', () => {
  test('should complete full season lifecycle');
  test('should transition from season 1 to season 2');
  test('should post all automated updates');
  test('should maintain history across seasons');
  test('should handle app restart mid-season');
});
```

### Manual Testing Scenarios

1. **Short Season Test** (1 hour duration)
   - Verify countdown displays correctly
   - Verify warnings post at correct times
   - Verify season ends and resets properly

2. **Season Transition Test**
   - Place pixels in season 1
   - Wait for season end
   - Verify winner modal appears
   - Verify canvas resets
   - Verify season 2 starts

3. **History Test**
   - Complete 3 seasons
   - Verify history shows all 3
   - Verify statistics are accurate

4. **Reddit Posts Test**
   - Monitor subreddit during season
   - Verify all automated posts appear
   - Verify post formatting is correct

## Implementation Notes

### Devvit Scheduler Usage

Devvit's scheduler allows running jobs at specific times:

```typescript
// In main.ts
Devvit.addSchedulerJob({
  name: 'season-end',
  onRun: async (event, context) => {
    const { seasonNumber } = event.data;
    const seasonService = new SeasonService(context.redis, context.reddit);
    await seasonService.handleSeasonEnd(seasonNumber);
  },
});

// Schedule a job
await context.scheduler.runJob({
  name: 'season-end',
  runAt: new Date(endTime),
  data: { seasonNumber },
});
```

### Time Synchronization

All times use Unix timestamps (milliseconds) to avoid timezone issues:

```typescript
const now = Date.now();
const endTime = now + durationMs;
const timeRemaining = Math.max(0, endTime - Date.now());
```

### Season Number Management

Season numbers are sequential integers starting from 1:

```typescript
async startNewSeason(): Promise<SeasonMetadata> {
  const currentSeason = await this.getCurrentSeason();
  const newSeasonNumber = currentSeason ? currentSeason.seasonNumber + 1 : 1;
  
  const season: SeasonMetadata = {
    seasonNumber: newSeasonNumber,
    startTime: Date.now(),
    endTime: Date.now() + this.settings.durationMs,
    duration: this.settings.durationMs,
    status: 'active',
  };
  
  await this.redis.set('season:current', JSON.stringify(season));
  return season;
}
```

### Moderator Settings UI

Settings will be accessible via Devvit's settings API:

```typescript
// In devvit.json
{
  "settings": [
    {
      "type": "select",
      "name": "seasonDuration",
      "label": "Season Duration",
      "options": [
        { "label": "1 Hour", "value": "3600000" },
        { "label": "6 Hours", "value": "21600000" },
        { "label": "24 Hours", "value": "86400000" },
        { "label": "3 Days", "value": "259200000" },
        { "label": "7 Days (Default)", "value": "604800000" },
        { "label": "14 Days", "value": "1209600000" },
        { "label": "30 Days", "value": "2592000000" }
      ],
      "defaultValue": "604800000"
    },
    {
      "type": "boolean",
      "name": "enableAutoPosts",
      "label": "Enable Automated Reddit Posts",
      "defaultValue": true
    }
  ]
}
```

## Performance Considerations

### Redis Operations

- Use pipelining for batch operations during season reset
- Set appropriate TTLs on locks (60 seconds)
- Limit history storage to last 10 seasons to prevent unbounded growth

### Scheduler Jobs

- Cancel old jobs when scheduling new ones
- Use unique job IDs to prevent duplicates
- Handle job failures with exponential backoff

### Client Updates

- Poll season status every 10 seconds (not every second)
- Use WebSocket or polling for countdown updates
- Cache season history on client side

## Migration Strategy

### Existing Games

For games already running without seasons:

1. On first deployment, detect no season exists
2. Create Season 1 with current game state
3. Set default 7-day duration
4. Schedule first season end
5. Preserve all existing pixels and scores

```typescript
async initialize(): Promise<void> {
  const currentSeason = await this.redis.get('season:current');
  
  if (!currentSeason) {
    // First time setup - create season 1 with current state
    console.log('Initializing season system for existing game');
    await this.startNewSeason();
  } else {
    // Verify scheduler jobs exist
    await this.verifySchedulerJobs();
  }
}
```
