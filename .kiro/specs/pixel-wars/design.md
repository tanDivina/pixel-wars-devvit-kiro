# Design Document: Pixel Wars

## Overview

Pixel Wars is a massively multiplayer territory control game built on Reddit's Devvit platform. The game features a shared pixel canvas where players compete to claim territory for their teams. The architecture follows a client-server model with React on the frontend, Express on the backend, and Redis for state management.

The design prioritizes real-time responsiveness, scalability to hundreds of concurrent players, mobile-first UX, and seamless Reddit integration. The game leverages Devvit's capabilities for authentication, data persistence, and Reddit API access while maintaining a polished, production-ready experience.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Reddit Platform                       │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                    Devvit Runtime                       │ │
│  │  ┌──────────────┐         ┌──────────────────────────┐ │ │
│  │  │   Client     │◄───────►│   Express Server         │ │ │
│  │  │   (React)    │  HTTP   │   (Node.js)              │ │ │
│  │  │              │  /api/* │                          │ │ │
│  │  │  - Canvas    │         │  - Game Logic            │ │ │
│  │  │  - UI        │         │  - Redis Operations      │ │ │
│  │  │  - Controls  │         │  - Reddit API            │ │ │
│  │  └──────────────┘         └──────────────────────────┘ │ │
│  │                                      │                  │ │
│  │                                      ▼                  │ │
│  │                            ┌──────────────────┐        │ │
│  │                            │   Redis Store    │        │ │
│  │                            │  - Canvas State  │        │ │
│  │                            │  - User Credits  │        │ │
│  │                            │  - Leaderboards  │        │ │
│  │                            └──────────────────┘        │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, HTML5 Canvas
- **Backend**: Express 5, Node.js 22+
- **State Management**: Redis (via Devvit)
- **Build Tools**: Vite, TypeScript
- **Platform**: Devvit Web (Reddit Developer Platform)

### Data Flow

1. **Initialization**: Client fetches game state via `/api/init`
2. **User Actions**: Client sends pixel placement requests to `/api/place-pixel`
3. **State Updates**: Server updates Redis and returns new state
4. **Polling**: Client polls `/api/canvas-updates` every 1 second for changes
5. **Leaderboard**: Client fetches rankings via `/api/leaderboard`

## Components and Interfaces

### Client Components

#### 1. Canvas Component (`Canvas.tsx`)

Renders the pixel grid using HTML5 Canvas API with pan/zoom controls.

**Props:**
```typescript
interface CanvasProps {
  width: number;
  height: number;
  pixels: PixelData[];
  onPixelClick: (x: number, y: number) => void;
  userTeam: Team;
  zones: ZoneData[];
}
```

**Responsibilities:**
- Render pixel grid efficiently using canvas chunking
- Handle mouse/touch input for pixel placement
- Implement pan and zoom with smooth animations
- Display zone boundaries and control indicators
- Optimize rendering for mobile devices

**Key Features:**
- Viewport culling (only render visible pixels)
- Touch gesture support (pinch-to-zoom, drag-to-pan)
- Pixel hover preview showing team color
- Grid lines for better visibility

#### 2. GameUI Component (`GameUI.tsx`)

Main game interface wrapper containing all UI elements.

**Structure:**
```typescript
<GameUI>
  <Header />
  <Canvas />
  <ControlPanel />
  <Leaderboard />
  <Tutorial />
</GameUI>
```

**Responsibilities:**
- Layout management for mobile and desktop
- Responsive design breakpoints
- Modal/overlay management
- Global state coordination

#### 3. Header Component (`Header.tsx`)

Top bar showing game status and user information.

**Props:**
```typescript
interface HeaderProps {
  username: string;
  team: Team;
  pixelCredits: number;
  nextCreditTime: number;
}
```

**Displays:**
- User's team name and color badge
- Available pixel credits with countdown
- Subscribe button
- Menu button (settings, how to play)

#### 4. ControlPanel Component (`ControlPanel.tsx`)

Bottom panel with game controls and quick stats.

**Props:**
```typescript
interface ControlPanelProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
  teamStats: TeamStats[];
}
```

**Features:**
- Zoom controls
- Reset view button
- Mini team stats display
- Quick access to leaderboard

#### 5. Leaderboard Component (`Leaderboard.tsx`)

Displays player and team rankings.

**Props:**
```typescript
interface LeaderboardProps {
  players: PlayerRanking[];
  teams: TeamRanking[];
  currentUser: string;
  isOpen: boolean;
  onClose: () => void;
}
```

**Tabs:**
- Top Players (by pixels placed)
- Team Standings (by territory controlled)
- Personal Stats

#### 6. Tutorial Component (`Tutorial.tsx`)

First-time user onboarding overlay.

**Props:**
```typescript
interface TutorialProps {
  isFirstVisit: boolean;
  onComplete: () => void;
}
```

**Steps:**
1. Welcome and team assignment
2. How to place pixels
3. Cooldown system explanation
4. Territory control objectives
5. Leaderboard and competition

#### 7. SplashScreen Component (`SplashScreen.tsx`)

Custom splash screen for Reddit feed display.

**Props:**
```typescript
interface SplashScreenProps {
  canvasPreview: string; // Base64 image
  teamStats: TeamStats[];
  activePlayers: number;
}
```

**Features:**
- Miniature canvas preview
- Prominent "Join Battle" button
- Current team standings
- Active player count
- Animated elements to attract attention

### Client Hooks

#### `useGameState.ts`

Manages global game state and API communication.

```typescript
interface GameState {
  postId: string;
  username: string;
  team: Team;
  pixelCredits: number;
  nextCreditTime: number;
  canvas: PixelData[];
  zones: ZoneData[];
  loading: boolean;
}

export const useGameState = () => {
  const [state, setState] = useState<GameState>(...);
  
  // Initialize game
  useEffect(() => { /* fetch /api/init */ }, []);
  
  // Poll for updates
  useEffect(() => { /* poll /api/canvas-updates */ }, []);
  
  // Place pixel
  const placePixel = async (x: number, y: number) => { /* ... */ };
  
  return { ...state, placePixel };
};
```

#### `useLeaderboard.ts`

Fetches and manages leaderboard data.

```typescript
export const useLeaderboard = () => {
  const [players, setPlayers] = useState<PlayerRanking[]>([]);
  const [teams, setTeams] = useState<TeamRanking[]>([]);
  
  useEffect(() => {
    // Fetch leaderboard every 10 seconds
  }, []);
  
  return { players, teams };
};
```

#### `usePixelCredits.ts`

Manages pixel credit countdown and regeneration.

```typescript
export const usePixelCredits = (nextCreditTime: number) => {
  const [timeRemaining, setTimeRemaining] = useState(0);
  
  useEffect(() => {
    // Update countdown every second
  }, [nextCreditTime]);
  
  return { timeRemaining };
};
```

### Server Endpoints

#### `GET /api/init`

Initialize game state for a user.

**Response:**
```typescript
interface InitResponse {
  type: 'init';
  postId: string;
  username: string;
  team: Team;
  pixelCredits: number;
  nextCreditTime: number;
  canvas: PixelData[];
  zones: ZoneData[];
  config: GameConfig;
}
```

**Logic:**
1. Get user from Reddit context
2. Determine team assignment (check Redis for existing, or assign new)
3. Get user's pixel credits and cooldown from Redis
4. Fetch current canvas state
5. Calculate zone control
6. Return complete game state

#### `POST /api/place-pixel`

Place a pixel on the canvas.

**Request:**
```typescript
interface PlacePixelRequest {
  x: number;
  y: number;
}
```

**Response:**
```typescript
interface PlacePixelResponse {
  type: 'place-pixel';
  success: boolean;
  pixelCredits: number;
  nextCreditTime: number;
  error?: string;
}
```

**Logic:**
1. Validate coordinates
2. Check user has pixel credits
3. Deduct credit and update cooldown
4. Update canvas in Redis
5. Update user stats (pixels placed)
6. Recalculate zone control if needed
7. Return updated state

**Error Cases:**
- Out of bounds
- No credits available
- Rate limiting

#### `GET /api/canvas-updates`

Get canvas changes since last poll.

**Query Params:**
```typescript
interface CanvasUpdatesQuery {
  since: number; // Timestamp
}
```

**Response:**
```typescript
interface CanvasUpdatesResponse {
  type: 'canvas-updates';
  pixels: PixelData[];
  zones: ZoneData[];
  timestamp: number;
}
```

**Logic:**
1. Get timestamp from query
2. Fetch pixels changed since timestamp from Redis
3. Calculate zone updates if needed
4. Return delta updates

**Optimization:**
- Use Redis sorted sets with timestamps
- Only return changed pixels
- Compress response for large updates

#### `GET /api/leaderboard`

Get player and team rankings.

**Response:**
```typescript
interface LeaderboardResponse {
  type: 'leaderboard';
  players: PlayerRanking[];
  teams: TeamRanking[];
  userRank: number;
}
```

**Logic:**
1. Fetch top 10 players from Redis sorted set
2. Calculate team rankings by territory
3. Get current user's rank
4. Return rankings

#### `GET /api/splash-data`

Get data for splash screen rendering.

**Response:**
```typescript
interface SplashDataResponse {
  type: 'splash-data';
  canvasPreview: string; // Base64 PNG
  teamStats: TeamStats[];
  activePlayers: number;
}
```

**Logic:**
1. Generate miniature canvas image (50x50)
2. Calculate team statistics
3. Count active players (last 5 minutes)
4. Return splash data

#### `POST /internal/on-app-install`

Devvit trigger when app is installed.

**Logic:**
1. Initialize game configuration in Redis
2. Create initial post
3. Set up default teams

#### `POST /internal/menu/post-create`

Moderator menu action to create new game post.

**Logic:**
1. Create new post with game
2. Initialize separate game state for this post
3. Return navigation URL

## Data Models

### Redis Data Structures

#### Canvas State

**Key Pattern:** `post:{postId}:canvas`
**Type:** Hash
**Structure:**
```
{
  "0:0": "team1",
  "0:1": "team2",
  "1:0": "team1",
  ...
}
```

**Rationale:** Hash allows O(1) pixel lookups and updates. Key format `x:y` for coordinates.

#### Canvas Updates Log

**Key Pattern:** `post:{postId}:canvas:updates`
**Type:** Sorted Set
**Structure:**
```
Score (timestamp) | Member (x:y:teamId)
1710000000        | "5:10:team1"
1710000001        | "6:10:team2"
```

**Rationale:** Sorted set enables efficient range queries for polling updates.

#### User Credits

**Key Pattern:** `post:{postId}:user:{username}:credits`
**Type:** Hash
**Structure:**
```
{
  "credits": "3",
  "nextCreditTime": "1710000120"
}
```

#### User Stats

**Key Pattern:** `post:{postId}:user:{username}:stats`
**Type:** Hash
**Structure:**
```
{
  "pixelsPlaced": "42",
  "team": "team1"
}
```

#### Player Leaderboard

**Key Pattern:** `post:{postId}:leaderboard:players`
**Type:** Sorted Set
**Structure:**
```
Score (pixels placed) | Member (username)
42                    | "user1"
38                    | "user2"
```

#### Team Assignments

**Key Pattern:** `post:{postId}:teams`
**Type:** Hash
**Structure:**
```
{
  "user1": "team1",
  "user2": "team2",
  ...
}
```

#### Zone Control

**Key Pattern:** `post:{postId}:zones`
**Type:** Hash
**Structure:**
```
{
  "0:0": "team1",  // Zone at grid position 0,0
  "0:1": "team2",
  ...
}
```

#### Active Players

**Key Pattern:** `post:{postId}:active`
**Type:** Sorted Set
**Structure:**
```
Score (timestamp) | Member (username)
1710000000        | "user1"
1710000005        | "user2"
```

**Rationale:** Track last activity time, can query for active players in last N minutes.

#### Game Configuration

**Key Pattern:** `post:{postId}:config`
**Type:** Hash
**Structure:**
```
{
  "canvasWidth": "100",
  "canvasHeight": "100",
  "creditCooldown": "120",
  "maxCredits": "10",
  "initialCredits": "5",
  "zoneSize": "10"
}
```

### TypeScript Interfaces

#### Shared Types (`src/shared/types/game.ts`)

```typescript
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
```

## Error Handling

### Client-Side Error Handling

**Network Errors:**
- Display toast notification with retry button
- Queue failed pixel placements for retry
- Show connection status indicator

**Validation Errors:**
- Prevent invalid actions before API call
- Show inline error messages
- Disable controls when appropriate

**State Errors:**
- Graceful degradation if data is missing
- Fallback to cached state
- Automatic re-initialization on critical errors

### Server-Side Error Handling

**Request Validation:**
```typescript
const validatePixelPlacement = (x: number, y: number, config: GameConfig) => {
  if (x < 0 || x >= config.canvasWidth) {
    throw new ValidationError('X coordinate out of bounds');
  }
  if (y < 0 || y >= config.canvasHeight) {
    throw new ValidationError('Y coordinate out of bounds');
  }
};
```

**Redis Errors:**
- Retry logic with exponential backoff
- Circuit breaker pattern for repeated failures
- Fallback to cached data when possible
- Log errors for monitoring

**Rate Limiting:**
- Track requests per user
- Return 429 status with retry-after header
- Implement token bucket algorithm

**Error Response Format:**
```typescript
interface ErrorResponse {
  status: 'error';
  message: string;
  code: string;
  retryAfter?: number;
}
```

## Testing Strategy

### Unit Tests

**Client Components:**
- Canvas rendering logic
- Pixel coordinate calculations
- Touch gesture handlers
- State management hooks

**Server Endpoints:**
- Request validation
- Redis operations
- Team assignment logic
- Zone control calculations

**Test Framework:** Vitest

**Example Test:**
```typescript
describe('placePixel endpoint', () => {
  it('should place pixel when user has credits', async () => {
    // Setup
    const mockRedis = createMockRedis();
    const req = { body: { x: 5, y: 10 } };
    
    // Execute
    const response = await placePixel(req, mockRedis);
    
    // Assert
    expect(response.success).toBe(true);
    expect(mockRedis.get).toHaveBeenCalledWith('user:test:credits');
  });
  
  it('should reject when user has no credits', async () => {
    // Test implementation
  });
});
```

### Integration Tests

**API Flow Tests:**
- Complete user journey (init → place pixel → poll updates)
- Concurrent pixel placements
- Credit regeneration
- Leaderboard updates

**Redis Integration:**
- Data persistence
- Concurrent access
- Transaction handling

### Manual Testing

**Cross-Platform:**
- iOS Safari (mobile)
- Android Chrome (mobile)
- Desktop Chrome, Firefox, Safari
- Different screen sizes and orientations

**Performance:**
- 100+ concurrent users simulation
- Large canvas (200x200)
- Rapid pixel placement
- Memory leak detection

**User Experience:**
- First-time user flow
- Tutorial clarity
- Touch responsiveness
- Visual polish

### Load Testing

**Scenarios:**
- 100 concurrent users placing pixels
- 500 users polling for updates
- Leaderboard queries under load
- Redis performance under stress

**Tools:**
- Artillery for load generation
- Redis monitoring
- Response time tracking

## Performance Optimizations

### Client Optimizations

**Canvas Rendering:**
- Use OffscreenCanvas for background rendering
- Implement viewport culling (only render visible area)
- Batch pixel updates before rendering
- Use requestAnimationFrame for smooth animations
- Cache rendered chunks

**Network:**
- Debounce polling when tab is inactive
- Compress API responses
- Use HTTP/2 multiplexing
- Implement request coalescing

**Memory:**
- Limit canvas history
- Clean up event listeners
- Use React.memo for expensive components
- Implement virtual scrolling for leaderboards

### Server Optimizations

**Redis:**
- Use pipelining for batch operations
- Implement connection pooling
- Use Lua scripts for atomic operations
- Set appropriate TTLs for temporary data

**API:**
- Implement response caching
- Use compression middleware
- Optimize JSON serialization
- Batch database queries

**Concurrency:**
- Use Redis transactions for atomic updates
- Implement optimistic locking for conflicts
- Queue non-critical updates

### Example: Efficient Zone Control Calculation

```typescript
// Calculate zone control using Lua script for atomicity
const calculateZoneControl = async (postId: string, zoneX: number, zoneY: number) => {
  const script = `
    local canvas = redis.call('HGETALL', KEYS[1])
    local teams = {}
    
    for i = 1, #canvas, 2 do
      local coord = canvas[i]
      local team = canvas[i + 1]
      local x, y = coord:match("(%d+):(%d+)")
      
      if math.floor(x / ARGV[1]) == ARGV[2] and 
         math.floor(y / ARGV[1]) == ARGV[3] then
        teams[team] = (teams[team] or 0) + 1
      end
    end
    
    local maxTeam, maxCount = nil, 0
    for team, count in pairs(teams) do
      if count > maxCount then
        maxTeam, maxCount = team, count
      end
    end
    
    return maxTeam
  `;
  
  return await redis.eval(script, 
    [`post:${postId}:canvas`],
    [config.zoneSize, zoneX, zoneY]
  );
};
```

## Mobile-First Design Considerations

### Touch Interactions

- Minimum touch target size: 44x44px
- Prevent accidental zooms with viewport meta tag
- Support pinch-to-zoom on canvas
- Implement long-press for pixel preview
- Smooth scroll and pan with momentum

### Responsive Layout

**Breakpoints:**
- Mobile: < 768px (single column, bottom controls)
- Tablet: 768px - 1024px (side panel for leaderboard)
- Desktop: > 1024px (full layout with sidebars)

**Mobile Optimizations:**
- Collapsible leaderboard (modal overlay)
- Floating action button for controls
- Simplified header (hamburger menu)
- Full-screen canvas mode
- Bottom sheet for stats

### Performance on Mobile

- Reduce canvas resolution on low-end devices
- Throttle polling on slow connections
- Optimize touch event handlers
- Minimize reflows and repaints
- Use CSS transforms for animations

## Security Considerations

### Authentication

- Rely on Devvit's built-in Reddit authentication
- Validate user context on every request
- No custom authentication required

### Input Validation

- Validate all coordinates server-side
- Sanitize user inputs
- Rate limit API requests per user
- Prevent coordinate injection attacks

### Data Integrity

- Use Redis transactions for atomic updates
- Implement optimistic locking for conflicts
- Validate team assignments
- Prevent credit manipulation

### Rate Limiting

```typescript
const rateLimiter = {
  maxRequests: 10,
  windowMs: 60000, // 1 minute
  
  async checkLimit(username: string): Promise<boolean> {
    const key = `ratelimit:${username}`;
    const count = await redis.incr(key);
    
    if (count === 1) {
      await redis.expire(key, this.windowMs / 1000);
    }
    
    return count <= this.maxRequests;
  }
};
```

## Deployment and Configuration

### Environment Variables

```bash
# Not needed - Devvit handles configuration
# Redis and Reddit API access provided by platform
```

### Build Process

```bash
# Build client and server
npm run build

# Deploy to Reddit
npm run deploy

# Publish for review
npm run launch
```

### Configuration Management

Game configuration stored in Redis per post:

```typescript
const DEFAULT_CONFIG: GameConfig = {
  canvasWidth: 100,
  canvasHeight: 100,
  creditCooldown: 120, // 2 minutes
  maxCredits: 10,
  initialCredits: 5,
  zoneSize: 10,
  teams: [
    { id: 'red', name: 'Red Team', color: '#FF0000' },
    { id: 'blue', name: 'Blue Team', color: '#0000FF' },
    { id: 'green', name: 'Green Team', color: '#00FF00' },
    { id: 'yellow', name: 'Yellow Team', color: '#FFFF00' },
  ],
};
```

### Monitoring

**Key Metrics:**
- API response times
- Redis operation latency
- Active user count
- Pixel placement rate
- Error rates
- Memory usage

**Logging:**
- Structured JSON logs
- Error tracking with context
- Performance metrics
- User actions for analytics

## Future Enhancements

### Phase 2 Features

1. **Special Events System**
   - Scheduled pixel rush hours
   - Territory blitz events
   - Double points periods

2. **Power-Ups**
   - Mega pixels (claim 3x3 area)
   - Shield (protect pixels for 5 minutes)
   - Scanner (reveal opponent strategies)

3. **Community Flair Integration**
   - Award flair for achievements
   - Special colors for top contributors
   - Team badges

4. **Advanced Analytics**
   - Heatmaps of activity
   - Team strategy visualization
   - Historical playback

5. **Social Features**
   - Team chat via Reddit comments
   - Strategy sharing
   - Alliance system

### Scalability Improvements

- Implement Redis Cluster for horizontal scaling
- Add CDN for static assets
- Optimize canvas storage with compression
- Implement sharding for multiple concurrent games

## Design Decisions and Rationales

### Why HTML5 Canvas over SVG?

Canvas provides better performance for large pixel grids with frequent updates. SVG would create too many DOM elements and slow down rendering.

### Why Polling over WebSockets?

Devvit doesn't support long-running connections or WebSockets. Polling with 1-second intervals provides acceptable real-time feel while working within platform constraints.

### Why Redis Hash for Canvas?

Hash provides O(1) lookups and updates for individual pixels. Alternative approaches (strings, lists) would require full deserialization for single pixel updates.

### Why Team-Based over Free-For-All?

Team-based gameplay encourages community coordination and creates natural engagement through Reddit's existing community structure (subreddits). It also generates more comments and discussion.

### Why 2-Minute Cooldown?

Balances engagement (players return frequently) with preventing spam. Allows casual players to participate without overwhelming the canvas. Can be adjusted based on analytics.

## Conclusion

This design provides a complete, production-ready architecture for Pixel Wars that meets all hackathon requirements. The system is optimized for mobile-first gameplay, scales to hundreds of concurrent users, and integrates seamlessly with Reddit's platform. The modular design allows for iterative development and future enhancements while maintaining code quality and performance.
