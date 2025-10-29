# Season System Documentation

## Overview

The Season System adds time-limited competitive seasons to Pixel Wars, creating recurring competitive cycles with automatic resets, winner announcements, and season history tracking.

## Features

### 🏆 Competitive Seasons
- **Time-Limited Gameplay**: Seasons run for a configurable duration (default: 7 days)
- **Automatic Resets**: Canvas, scores, and zones reset at season end
- **Winner Determination**: Team with highest score (zones × 100 + pixels) wins
- **Season History**: Last 10 completed seasons are stored and viewable

### ⏱️ Live Countdown Timer
- **Real-Time Display**: Shows time remaining in current season
- **Urgency Styling**: Color-coded based on time left
  - Normal (> 24h): Gray
  - Warning (< 24h): Yellow
  - Urgent (< 1h): Orange
  - Critical (< 5m): Red with pulsing animation
- **Auto-Updates**: Polls server every 10 seconds for accuracy

### 🎉 Winner Celebration
- **Full-Screen Modal**: Displays when season ends
- **Celebration Effects**: Confetti animation and trophy display
- **Final Standings**: Complete leaderboard with medals
- **Season Statistics**: Total pixels, players, and top performer
- **Auto-Close**: Closes after 10 seconds (manual close available)

### 📢 Automated Reddit Posts
- **Season Start**: Announces new season with details
- **24-Hour Warning**: Posts standings with 24h remaining
- **1-Hour Warning**: Final push notification
- **Winner Announcement**: Celebrates winner with full statistics

## Architecture

### Backend Services

#### SeasonService (`src/server/services/season.ts`)
Core service managing season lifecycle:
- `initialize()` - Sets up season system on app start
- `getCurrentSeason()` - Returns active season metadata
- `getTimeRemaining()` - Calculates time left in season
- `startNewSeason()` - Creates new season with incremented number
- `endSeason()` - Orchestrates season transition
- `calculateWinner()` - Determines winner and final standings
- `resetGameState()` - Clears canvas/scores, preserves teams
- `saveHistory()` - Stores completed season data

#### SeasonStorageService (`src/server/services/seasonStorage.ts`)
Handles Redis persistence:
- Season metadata storage
- Settings management
- History tracking (last 10 seasons)
- Distributed locking for concurrent operations

#### SchedulerService (`src/server/services/scheduler.ts`)
Manages scheduled jobs:
- Season end job scheduling
- Warning post scheduling (24h, 1h)
- Job cancellation and tracking
- Retry logic for failed operations

#### RedditPostService (`src/server/services/redditPosts.ts`)
Creates automated Reddit posts:
- Season start announcements
- Warning posts with standings
- Winner announcements with statistics
- Formatted markdown with emojis and tables

### API Endpoints

#### GET `/api/season/current`
Returns current season information:
```json
{
  "type": "season-current",
  "seasonNumber": 1,
  "startTime": 1234567890000,
  "endTime": 1234567890000,
  "timeRemaining": 86400000,
  "status": "active"
}
```

#### GET `/api/season/history`
Returns last 10 completed seasons:
```json
{
  "type": "season-history",
  "history": [
    {
      "seasonNumber": 1,
      "startTime": 1234567890000,
      "endTime": 1234567890000,
      "duration": 604800000,
      "winningTeam": {
        "id": "red",
        "name": "Red Team",
        "color": "#FF0000",
        "finalScore": 250
      },
      "finalStandings": [...],
      "statistics": {...}
    }
  ]
}
```

#### GET `/api/season/settings` (Moderator Only)
Returns season configuration:
```json
{
  "type": "season-settings",
  "durationMs": 604800000,
  "enableAutoPosts": true,
  "enable24hWarning": true,
  "enable1hWarning": true
}
```

#### POST `/api/season/settings` (Moderator Only)
Updates season settings (applies to next season):
```json
{
  "durationMs": 259200000,
  "enableAutoPosts": false
}
```

### Client Components

#### CountdownTimer (`src/client/components/CountdownTimer.tsx`)
Displays live countdown with urgency styling:
- Props: `endTime`, `onSeasonEnd`, `className`
- Updates every second
- Calls `onSeasonEnd` callback when time expires
- Responsive design with mobile support

#### WinnerModal (`src/client/components/WinnerModal.tsx`)
Full-screen celebration modal:
- Props: `isOpen`, `seasonNumber`, `winningTeam`, `finalStandings`, `statistics`, `onClose`
- Confetti animation
- Auto-closes after 10 seconds
- Manual close button
- Responsive layout

## Data Models

### SeasonMetadata
```typescript
interface SeasonMetadata {
  seasonNumber: number;
  startTime: number; // Unix timestamp
  endTime: number; // Unix timestamp
  duration: number; // Duration in milliseconds
  status: 'active' | 'ending' | 'ended';
}
```

### SeasonSettings
```typescript
interface SeasonSettings {
  durationMs: number; // Season duration in milliseconds
  enableAutoPosts: boolean; // Enable automated Reddit posts
  enable24hWarning: boolean; // Post 24h warning
  enable1hWarning: boolean; // Post 1h warning
}
```

### SeasonHistory
```typescript
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
```

## Redis Keys

```
season:current              - Current season metadata (JSON)
season:settings             - Season settings (JSON)
season:history:{number}     - Individual season history (JSON)
season:history:index        - List of season numbers (sorted set)
season:lock                 - Distributed lock for season transitions (TTL: 60s)
season:jobs:{number}        - Scheduled job tracking (JSON)
season:failed-posts         - Failed Reddit posts for manual retry (list)
```

## Scoring System

### Team Score Calculation
```
Team Score = (Zones Controlled × 100) + Total Pixels Placed
```

- **Zones**: Each controlled zone = 100 points
- **Pixels**: Each pixel placed = 1 point
- **Winner**: Team with highest total score

### Example
- Red Team: 2 zones + 50 pixels = 250 points
- Blue Team: 1 zone + 75 pixels = 175 points
- **Winner: Red Team**

## Season Lifecycle

### 1. Season Start
1. New season created with incremented number
2. Start time set to current time
3. End time calculated based on duration setting
4. Scheduler jobs created for warnings and end
5. Reddit post announces new season (if enabled)

### 2. During Season
1. Players place pixels and compete for zones
2. Countdown timer displays time remaining
3. Scores update in real-time
4. Warning posts at 24h and 1h (if enabled)

### 3. Season End
1. Countdown reaches zero
2. Winner calculated based on final scores
3. Season history saved to Redis
4. Reddit post announces winner (if enabled)
5. Winner modal displayed to all players
6. Game state reset (canvas, scores, zones)
7. Team assignments preserved
8. New season automatically starts

## Configuration

### Default Settings
```typescript
{
  durationMs: 604800000,      // 7 days
  enableAutoPosts: true,       // Automated posts enabled
  enable24hWarning: true,      // 24h warning enabled
  enable1hWarning: true        // 1h warning enabled
}
```

### Duration Options
- 1 hour: `3600000`
- 6 hours: `21600000`
- 24 hours: `86400000`
- 3 days: `259200000`
- 7 days: `604800000` (default)
- 14 days: `1209600000`
- 30 days: `2592000000`

## Testing

### Unit Tests
- **SeasonService**: 83 tests covering all lifecycle methods
- **SchedulerService**: 42 tests for job management
- **RedditPostService**: 22 tests for post generation
- **Total**: 147 backend tests passing

### Test Coverage
- Season initialization and setup
- Winner calculation with various scenarios
- Game state reset operations
- History storage and retrieval
- Distributed locking
- Job scheduling and handling
- Reddit post formatting
- Error handling and edge cases

## Error Handling

### Season End Failures
- Distributed locking prevents concurrent resets
- Failed history saves logged but don't block transition
- Failed Reddit posts stored for manual retry
- Retry logic for critical operations

### Reddit API Failures
- Posts fail gracefully without blocking season operations
- Failed posts stored in `season:failed-posts` list
- Errors logged for moderator review

### Edge Cases
- Negative time remaining (clock skew) triggers immediate end
- Very short seasons (< 1h) skip 24h warning
- Missing season data handled with defaults
- Concurrent season end attempts prevented by locking

## Monitoring

### Logs
All season operations are logged:
- Season initialization
- Season transitions
- Winner calculations
- Reddit post creation
- Job scheduling
- Error conditions

### Failed Operations
Failed Reddit posts stored for review:
```typescript
{
  type: 'warning-24h',
  seasonNumber: 1,
  timestamp: 1234567890000,
  error: 'Reddit API unavailable'
}
```

## Future Enhancements

### Potential Features
- Season leaderboards with historical rankings
- Player achievements and badges
- Season rewards and incentives
- Custom season themes
- Mid-season events
- Team-specific season goals
- Season preview and countdown
- Email notifications for season events

## Troubleshooting

### Season Not Starting
1. Check Redis connection
2. Verify `season:current` key exists
3. Check logs for initialization errors
4. Manually call `/api/season/current` to verify

### Countdown Not Updating
1. Verify API endpoint is accessible
2. Check browser console for fetch errors
3. Ensure season data is being polled (every 10s)
4. Check `seasonData` state in React DevTools

### Winner Modal Not Showing
1. Verify season history API returns data
2. Check `handleSeasonEnd` callback is triggered
3. Ensure `winnerData` state is set
4. Check modal `isOpen` prop

### Reddit Posts Not Creating
1. Verify Reddit API credentials
2. Check `enableAutoPosts` setting
3. Review `season:failed-posts` list
4. Check Reddit API rate limits

## Support

For issues or questions:
1. Check logs for error messages
2. Review Redis keys for data integrity
3. Test API endpoints manually
4. Verify season settings configuration
5. Check test suite for similar scenarios

---

**Version**: 1.0.0  
**Last Updated**: 2025-10-18  
**Status**: Production Ready ✅
