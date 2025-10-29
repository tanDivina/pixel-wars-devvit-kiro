# Pixel Wars 🎨⚔️

A massively multiplayer territory control game built on Reddit's Devvit platform where teams compete to dominate a shared canvas by placing pixels strategically in time-limited competitive seasons.

## What is Pixel Wars?

Pixel Wars is a real-time, team-based strategy game where hundreds of Reddit users collaborate to control territory on a 100x100 pixel canvas. Players are automatically assigned to one of four color-coded teams (Red, Blue, Green, or Yellow) and work together to claim zones by placing pixels in their team's color.

Think of it as a strategic evolution of r/place - instead of just creating pixel art, you're fighting for territorial dominance in a persistent multiplayer battlefield where every pixel placement matters. The game introduces zone-based territory mechanics that reward strategic coordination over random clicking, all within time-limited competitive seasons that create urgency and excitement.

The game runs directly within Reddit posts using Devvit's web platform. When you open a Pixel Wars post, you see an animated splash screen with live team statistics and an active player count. Click "⚔️ Join the Battle" to enter the full-screen game interface where you can immediately start placing pixels and claiming territory for your team.

**Key Innovation**: Pixel Wars combines the viral appeal of r/place with strategic gameplay mechanics - resource management (credit cooldown system), territorial objectives (zone control), competitive seasons with countdown timers, winner celebrations, season history tracking, and real-time competition - creating a game that's easy to learn but rewards coordination and strategy.

## Why Pixel Wars is Unique

### 🎯 Strategic Territory Control
Unlike simple pixel art games, Pixel Wars introduces **zone-based territory mechanics**. The 100x100 canvas is divided into 100 zones (each 10x10 pixels), and controlling a zone requires having MORE pixels in it than any other team. This encourages coordinated team efforts and strategic thinking rather than random pixel placement.

### ⏰ Competitive Season System
Time-limited seasons (default 7 days) create urgency and excitement. A live countdown timer in the header shows exactly how much time remains, with dynamic styling that increases urgency as the deadline approaches. When a season ends, players see a spectacular winner celebration with confetti, trophy animations, and complete final standings before the canvas resets for a new season. All season results are preserved in season history, allowing players to track past winners and statistics.

### ⚡ Instant Feedback
Your pixels appear **instantly** on the canvas (0ms perceived latency) using optimistic updates. The game provides immediate visual feedback through hover previews, contextual instruction banners, toast notifications, and animated zone capture effects.

### 🚀 Performance-Optimized
Advanced rendering techniques ensure smooth 60fps performance: chunk-based rendering, OffscreenCanvas for background processing, viewport culling to only render visible areas, and batch pixel updates for efficiency.

### 💬 Reddit-Native Integration
Built natively on Reddit's Devvit platform with automatic user authentication, seamless integration into Reddit posts, and a "💬 Discuss Strategy" button that links directly to post comments for team coordination.

## Game Description

Pixel Wars transforms Reddit into a competitive multiplayer battlefield where strategy meets community coordination. The game features a persistent 100x100 pixel canvas divided into 100 territorial zones (each 10x10 pixels). Four teams - Red, Blue, Green, and Yellow - battle for dominance by placing pixels strategically across the canvas within time-limited competitive seasons.

**Core Gameplay Loop:**
1. See the animated splash screen with live team statistics and active player count
2. Click "⚔️ Join the Battle" to enter the game
3. Check the season countdown timer in the header to see how much time remains
4. Complete the optional 6-step interactive tutorial (or skip it)
5. Click anywhere on the canvas to place a pixel in your team's color (costs 1 credit)
6. Control zones by having the most pixels in them compared to other teams
7. Watch your credits regenerate every 2 minutes (max 10 credits)
8. Coordinate with teammates via the "💬 Discuss Strategy" button to plan attacks
9. Track your progress on the leaderboard showing top players and team standings
10. Race against the clock as the season countdown creates urgency and excitement
11. When the season ends, celebrate with a full-screen winner announcement showing the victorious team
12. View season history to see past winners and statistics

**What Makes It Engaging:**
- **Competitive Seasons**: Time-limited seasons (default 7 days) create urgency and excitement
- **Live Countdown Timer**: Dynamic timer shows exactly how much time remains with urgency-based styling
- **Instant Feedback**: Optimistic pixel placement (0ms perceived latency), toast notifications, animated zone captures
- **Real-Time Multiplayer**: See other players' moves appear live with 1-second updates
- **Strategic Depth**: Resource management (credits) + territorial control (zones) + time pressure = meaningful decisions
- **Team Coordination**: Success requires working together across time zones to win before season ends
- **Persistent World**: Your team's progress continues even when you're offline
- **Competitive Rankings**: Dual leaderboard system tracks both individual and team performance
- **Smooth Performance**: Chunk-based rendering with viewport culling ensures 60fps
- **Intuitive UX**: Hover preview, contextual banners, crosshair cursor for precision
- **Engaging Onboarding**: Animated splash screen and interactive tutorial welcome new players
- **Season History**: Track past season winners and statistics

The game creates natural opportunities for Reddit community engagement, with players coordinating strategies in post comments while racing against the clock to dominate the canvas before the season ends.

## Core Features at a Glance

- **⏰ Competitive Seasons**: Time-limited seasons (default 7 days) with automatic resets
- **⏱️ Live Season Countdown**: Dynamic timer with urgency-based styling (normal → warning → urgent → critical)
- **🏆 Winner Celebrations**: Full-screen modal with confetti, trophy animation, and final standings
- **🎬 Animated Splash Screen**: Eye-catching entry with gradient title, team stats, and active player count
- **🎯 100x100 Pixel Canvas**: Shared persistent grid where every pixel placement matters
- **👥 Four Competing Teams**: Red, Blue, Green, and Yellow battle for dominance
- **🗺️ Zone Control System**: 100 zones (10x10 each) - control by pixel majority
- **⚡ Credit-Based Gameplay**: 5 starting credits, regenerate every 2 minutes (max 10)
- **🔄 Real-Time Multiplayer**: Canvas updates every second, see other players' moves live
- **🎨 Optimistic Updates**: Pixels appear instantly (0ms perceived latency)
- **⏳ Live Credit Timer**: Real-time countdown in header (e.g., "1:45")
- **🏆 Dual Leaderboards**: Track top 10 players and all 4 team standings
- **📊 Team Statistics**: Zones controlled, total pixels, progress bars
- **🎯 Zone Visualization**: Animated borders, pulsing effects when zones change hands
- **📱 Mobile-Optimized**: Fully responsive with touch controls
- **🎓 Interactive Tutorial**: 6-step guided walkthrough via "❓ Help" button
- **💬 Reddit Integration**: "💬 Discuss Strategy" button links to post comments
- **🖱️ Intuitive Controls**: Hover preview, contextual banners, crosshair cursor
- **🎨 Smooth Performance**: 60fps with chunk-based rendering and viewport culling
- **🔔 Toast Notifications**: Real-time feedback for all actions (success, errors, zone captures)
- **📜 Season History**: View past season winners and statistics

## What Makes This Game Innovative?

### 🎯 Strategic Territory Control
Unlike simple pixel art games, Pixel Wars introduces **zone-based territory mechanics**. The 100x100 canvas is divided into 100 zones (each 10x10 pixels), and controlling a zone requires having MORE pixels in it than any other team. This encourages coordinated team efforts and strategic thinking rather than random pixel placement.

**Visual Zone System:**
- Controlled zones display colored borders matching the controlling team
- Subtle background tint shows zone ownership at a glance
- Small team indicator in zone corner (colored square with team initial)
- Animated pulsing borders when zones change hands (1-second animation)
- Real-time zone control updates as pixels are placed

### ⚡ Instant Feedback with Optimistic Updates
Your pixels appear **instantly** on the canvas (0ms perceived latency) before server confirmation. If placement fails, the pixel is automatically removed with an error notification. This creates a responsive, snappy experience that feels native and immediate.

**How It Works:**
- Click to place → pixel appears immediately in your team's color
- Server confirms in background (100-300ms)
- Success: Credits update, cooldown starts, toast notification
- Failure: Pixel automatically removed, error toast shown
- Result: Feels instant and responsive, no waiting

### ⏰ Competitive Season System
Time-limited seasons create urgency and excitement:
- **Season Duration**: Default 7 days (configurable by moderators)
- **Live Countdown Timer**: Always visible in header with dynamic formatting
  - **>24 hours**: "5d 12h" (gray background, normal urgency)
  - **<24 hours**: "23h 45m" (yellow background, warning state)
  - **<1 hour**: "45m 30s" (orange background, urgent state)
  - **<5 minutes**: "4m 30s" (red background, pulsing animation, critical state)
  - **Season ending**: "Season Ending..." (red background)
- **Urgency Icons**: Timer shows different icons based on time remaining (⏱️ → ⏰ → 🚨)
- **Automatic Reset**: When season ends, canvas resets and new season begins
- **Winner Celebration**: Full-screen modal with:
  - Animated confetti falling from top
  - Bouncing trophy (🏆) animation
  - Winning team name in their color with final score
  - Complete final standings table with medals (🥇🥈🥉)
  - Season statistics (total pixels, total players, top player)
  - Auto-closes after 10 seconds (or click to close immediately)
- **Season History**: View past season results and statistics
- **Strategic Pressure**: Time limit adds excitement and encourages coordinated final pushes

### 🎮 Balanced Resource System
The credit cooldown system prevents spam while keeping gameplay engaging:
- **Starting Credits**: 5 pixel credits when you join
- **Regeneration**: 1 credit every 2 minutes (120 seconds)
- **Maximum Storage**: 10 credits (encourages regular play)
- **Live Countdown**: Real-time timer shows exactly when your next credit arrives (e.g., "1:45")
- **Strategic Depth**: Players must decide when and where to spend credits

This system ensures that success comes from strategy and coordination, not just who can click fastest.

### 🌐 Real-Time Multiplayer
The canvas updates every second via polling, creating a live multiplayer experience:
- See other players' pixels appear in real-time
- Zone control changes animate immediately with pulsing borders
- Live leaderboard updates every 10 seconds
- Active player count shows who's online
- Persistent world continues 24/7

### 🚀 Performance-Optimized Rendering
Advanced optimization techniques ensure smooth 60fps performance:
- **Chunk-based Rendering**: Canvas divided into 50x50 pixel chunks, only dirty chunks re-render
- **OffscreenCanvas**: Background rendering reduces main thread blocking
- **Viewport Culling**: Only visible chunks are rendered based on pan/zoom state
- **Batch Pixel Updates**: Multiple pixel changes batched into single render cycle
- **RequestAnimationFrame**: Smooth animations and interactions

These optimizations ensure the game runs smoothly on both desktop and mobile devices.

### 🏆 Comprehensive Leaderboard System
Track competition with detailed rankings:
- **Player Rankings**: Top 10 players with medals (🥇🥈🥉), pixel counts, and team colors
- **Team Standings**: All 4 teams ranked by zones controlled and total pixels
- **Personal Stats**: See your own rank even if outside top 10 (with "..." separator)
- **Progress Bars**: Visual representation of team dominance and zone control percentages
- **Auto-Refresh**: Updates every 10 seconds automatically
- **Manual Refresh**: Button to update rankings on demand
- **Responsive Design**: Beautiful modal on desktop, full-screen on mobile

### 🎨 Intuitive User Experience
Every action has clear visual feedback:
- **Hover Preview**: See exactly where your pixel will be placed (semi-transparent with black border)
- **Contextual Instructions**: Dynamic banners guide you ("Click to place" or "Wait for credits")
- **Crosshair Cursor**: Indicates precision placement
- **Zone Animations**: Pulsing borders when zones change hands
- **Toast Notifications**: Success/error messages for all actions (auto-dismiss after 3 seconds)
- **Smooth Animations**: Polished visual effects including zone capture celebrations

### 💬 Reddit-Native Integration
Built natively on Reddit's Devvit platform:
- **No Signup Required**: Automatic Reddit user authentication
- **Seamless Integration**: Runs directly in Reddit posts as a webview
- **Cross-Platform**: Works on Reddit web, iOS app, and Android app
- **Animated Splash Screen**: Eye-catching entry with gradient title, bouncing sword icon, and live stats
- **Community Features**: "💬 Discuss Strategy" button (orange) links directly to post comments
- **Natural Coordination**: Players coordinate strategies in Reddit comments

### 🤝 Asynchronous Team Coordination
Success requires teamwork across time zones:
- **Persistent Canvas**: Your team's work continues even when you're offline
- **Reddit Integration**: Coordinate strategies in post comments
- **Leaderboard Insights**: See which zones need defense or which to attack
- **Team Statistics**: Track your team's progress and compare with rivals
- **24/7 Gameplay**: Players worldwide can contribute at any time

### 🎓 Engaging Onboarding
New players get comprehensive guidance:
- **Animated Splash Screen**: Welcoming entry with gradient title, bouncing sword (⚔️), and live team statistics
- **Interactive Tutorial**: 6-step guided walkthrough covering all game mechanics
- **Help Button**: Access tutorial anytime via "❓ Help" in header
- **Contextual Banners**: Dynamic instructions guide you through gameplay
- **Visual Feedback**: Immediate response to all player actions with toast notifications
- **Hover Preview**: See where pixels will be placed before clicking
- **Welcome Message**: Personalized greeting when you join (e.g., "👋 Welcome username! You're on Red Team!")

## How to Play

### Getting Started

1. **Find a Pixel Wars Post**
   - Look for Pixel Wars posts in participating subreddits
   - You'll see an animated splash screen with:
     - Gradient title "PIXEL WARS" (purple → pink → red)
     - Bouncing sword icon (⚔️)
     - Live team statistics showing zones controlled and total pixels
     - Active player count
     - "⚔️ Join the Battle" button

2. **Join the Game**
   - Click the "⚔️ Join the Battle" button on the splash screen
   - The game loads in full-screen mode within the Reddit post
   - You'll see a personalized welcome message (e.g., "👋 Welcome username! You're on Red Team!")

3. **Meet Your Team**
   - You're automatically assigned to one of four teams:
     - **Red Team** (#FF4444) - Bright red
     - **Blue Team** (#4444FF) - Bright blue
     - **Green Team** (#44FF44) - Bright green
     - **Yellow Team** (#FFFF44) - Bright yellow
   - Your team is chosen to balance player counts across all teams
   - Your team assignment is permanent for this game session

4. **Learn the Basics (Optional Tutorial)**
   - The tutorial automatically appears for first-time players
   - Or click the "❓ Help" button in the header anytime to access it
   - Interactive 7-step walkthrough:
     1. **Welcome**: Introduction and team assignment
     2. **Your Mission**: How to place pixels and control zones
     3. **Pixel Credits**: Understanding the credit system
     4. **Territory Zones**: How zone control works
     5. **⏱️ Competitive Seasons**: Understanding the season system and scoring
     6. **Win Together**: Team coordination and leaderboards
     7. **Controls**: Canvas navigation (click, drag, zoom)
   - Navigate with Next/Back buttons or click "Skip Tutorial" to jump straight into the game
   - Tutorial state is saved - it won't show again unless you click "❓ Help"

5. **Understand the Interface**
   
   **Header (Top Bar)**:
   - **Left Side**:
     - Game title: "Pixel Wars"
     - Season number: "Season X" (hidden on mobile)
     - Your username (e.g., "Player: username") - hidden on mobile
   - **Center/Right Side**:
     - **Season Countdown Timer**: Shows time remaining in current season
       - Format changes based on urgency (e.g., "5d 12h", "23h 45m", "45m 30s")
       - Background color indicates urgency (gray → yellow → orange → red)
       - Pulsing animation when <5 minutes remain
       - Icon changes based on urgency (⏱️ → ⏰ → 🚨)
     - Team badge (glowing colored square) and team name
     - Credit counter: "Credits: 7" (shows available credits)
     - Credit cooldown timer: "(1:45)" - time until next credit regenerates (hidden when at max credits)
     - "❓ Help" button to reopen tutorial
   
   **Canvas (Center)**:
   - 100x100 pixel grid (10,000 total pixels)
   - Colored pixels show team territories
   - Zone overlays with animated borders show controlled areas
   - Team indicators in zone corners (small colored squares with team initial)
   - Grid lines for precise pixel placement
   - Smooth pan and zoom functionality
   
   **Control Panel (Bottom Bar)**:
   - **Left**: Instructions
     - Desktop: "Click to place pixels • Drag to pan • Use +/- to zoom"
     - Mobile: "Tap to place • Drag to pan"
   - **Center** (Desktop only): Mini team badges showing all 4 teams (your team is highlighted)
   - **Right**: Controls
     - Zoom controls: "−" button, zoom percentage (e.g., "100%"), "+" button
     - "Reset" button to center view
     - "💬 Discuss Strategy" button (orange) - Opens Reddit comments to coordinate with team
     - "🏆 Leaderboard" button (purple)

### Core Gameplay Mechanics

#### Placing Pixels

1. **Hover Preview**: Move your mouse over the canvas to see a semi-transparent preview of where your pixel will be placed
   - Preview shows in your team's color at 50% opacity
   - Black border indicates exact pixel location
   - Crosshair cursor for precision placement
2. **Click to Place**: Click (or tap on mobile) anywhere on the canvas to place a pixel
3. **Credit Cost**: Each pixel placement costs 1 credit
4. **Contextual Guidance**: 
   - **When you have credits**: Blue banner shows "👆 Click on the canvas to place a pixel for [Your Team]!"
   - **When out of credits**: Orange banner shows "⏳ No credits! Wait [time] for next pixel"
5. **Optimistic Updates**: 
   - Your pixel appears **instantly** on the canvas in your team's color (no waiting for server)
   - Success toast notification: "🎨 Pixel placed for [Your Team]!" (auto-dismisses after 1.5 seconds)
   - Credit counter updates immediately
   - Cooldown timer starts if you were at max credits
   - If server rejects placement, pixel is automatically removed with error notification
6. **Team Color**: All your pixels are automatically in your team's color
7. **No Undo**: Once placed, pixels cannot be removed (but can be overwritten by any team)
8. **Zone Capture Notifications**: When your team captures a zone, you'll see a toast: "🎉 [Your Team] captured zone (X, Y)!" (auto-dismisses after 2.5 seconds)
9. **Zone Loss Warnings**: When your team loses a zone, you'll see: "⚠️ Zone (X, Y) taken by [Other Team]!" (auto-dismisses after 2.5 seconds)

#### Managing Your Credits

- **Starting Credits**: You begin with 5 pixel credits when you first join
- **Regeneration**: Credits regenerate automatically every 2 minutes (120 seconds)
- **Maximum Storage**: You can store up to 10 credits
- **Cooldown Timer**: 
  - The header shows a live countdown (e.g., "(1:45)") until your next credit
  - Timer updates every second
  - Hidden when you're at max credits (no cooldown active)
- **Strategic Use**: Plan your pixel placements carefully - don't waste credits!
- **Credit Display**: Current credits shown in header (e.g., "Credits: 7")
- **Regeneration Continues**: Credits regenerate even when you're not playing or offline

#### Navigating the Canvas

- **Pan/Move**: Click and drag anywhere on the canvas to move around
- **Zoom In**: 
  - Click the "+" button in the control panel
  - Or use mouse wheel scroll up
  - Zoom increases by 20% each time (×1.2)
- **Zoom Out**: 
  - Click the "−" button in the control panel
  - Or use mouse wheel scroll down
  - Zoom decreases by 20% each time (÷1.2)
- **Zoom Display**: Current zoom percentage shown between +/− buttons (e.g., "100%")
- **Reset View**: Click "Reset" button to center the canvas at 100% zoom (1x)
- **Mobile**: Use pinch-to-zoom and drag gestures on touch devices
- **Zoom Range**: Zoom from 50% (0.5x zoomed out) to 500% (5x zoomed in)
- **Smooth Navigation**: All pan and zoom actions are smooth and responsive

#### Controlling Territory

1. **Zone System**: The 100x100 canvas is divided into 100 zones (10×10 grid of zones, each zone is 10×10 pixels)
2. **Zone Control**: Your team controls a zone when you have MORE pixels in it than any other team
3. **Majority Rules**: 
   - Example: If Red has 30 pixels, Blue has 25, and Green has 20 in a zone, Red controls it
   - Ties: If two teams have equal pixels, the zone remains contested (no controller)
   - Empty zones: Zones with no pixels are neutral (no controller)
4. **Visual Indicators**: Controlled zones show:
   - **Colored Border**: 2px border in the controlling team's color
   - **Subtle Fill**: 12% opacity background tint in team color
   - **Team Indicator**: Small 8×8px colored square in top-left corner with team initial (R/B/G/Y)
5. **Zone Animations**: When a zone changes hands:
   - 1-second pulsing animation
   - Border thickness pulses from 2px to 4px
   - Fill opacity pulses from 12% to 30%
   - Smooth sine wave interpolation (4 cycles during animation)
6. **Strategic Focus**: Concentrate efforts on specific zones rather than scattering pixels randomly
7. **Defense**: Protect zones your team already controls by maintaining pixel majority
8. **Zone Updates**: Zone control recalculates immediately when pixels are placed in that zone

#### Using the Leaderboard

The leaderboard provides comprehensive statistics and rankings for both players and teams.

**Opening the Leaderboard:**
- Click the "🏆 Leaderboard" button in the control panel (bottom-right, purple button)
- The leaderboard opens as a modal overlay on desktop
- On mobile, it opens as a full-screen modal
- Click the backdrop (dark area) or close button (×) to close

**Player Rankings Tab (👤 Players):**
- **Default View**: Opens to this tab by default
- **Top 10 Players**: Ranked by total pixels placed
- **Display Format**: Each player shows:
  - Rank number (or medal for top 3: 🥇 🥈 🥉)
  - Team color indicator (small colored circle)
  - Username
  - Total pixels placed
- **Current User Highlight**: Your entry is highlighted in purple
- **Outside Top 10**: If you're ranked below 10, you'll see:
  - Top 10 players
  - "..." separator
  - Your entry at the bottom

**Team Standings Tab (👥 Teams):**
- **All 4 Teams**: Shows Red, Blue, Green, and Yellow teams
- **Ranking**: Teams ranked by zones controlled (primary) and total pixels (tiebreaker)
- **Display Format**: Each team shows:
  - Rank number (or medal for top 3: 🥇 🥈 🥉)
  - Team badge (colored square)
  - Team name
  - Zones controlled with percentage
  - Total pixels with percentage
  - Progress bars showing relative strength
- **Your Team Highlight**: Your team is highlighted with purple border and star (⭐)
- **Progress Bars**: Visual representation of team dominance
  - Zones controlled bar (percentage of total zones)
  - Total pixels bar (percentage of all pixels)
  - Animated width transitions

**Leaderboard Features:**
- **Auto-Refresh**: Updates every 10 seconds automatically
- **Manual Refresh**: Click "🔄 Refresh" button to update immediately
- **Your Rank**: Footer shows "Your rank: #X" for quick reference
- **Responsive Design**: Beautiful modal on desktop, full-screen on mobile

#### Coordinating with Your Team

- **Discuss Strategy**: Click the "💬 Discuss Strategy" button (orange) in the control panel
  - Opens the Reddit post comments in a new tab
  - Coordinate with teammates on which zones to attack or defend
  - Share strategies and organize coordinated efforts
- **Leaderboard Insights**: Use team standings to identify:
  - Which zones your team controls
  - Which zones are contested
  - Which teams are threats
- **Persistent World**: Your team's progress continues even when you're offline
- **24/7 Gameplay**: Players worldwide contribute at all times
- **Real-Time Notifications**: Get instant feedback when zones change hands

### Winning Strategies

1. **Understand Scoring**: Score = (Zones × 100) + Pixels. Zones are worth 100 points each, so controlling zones is crucial!
2. **Watch the Clock**: Monitor the season countdown timer to plan final pushes
3. **Focus on Zones**: Don't scatter pixels randomly - concentrate on controlling specific zones (each zone is worth 100 points!)
4. **Coordinate with Team**: Use Reddit comments to organize attacks and defenses
5. **Defend Territory**: Protect zones your team already controls - losing a zone costs 100 points
6. **Strategic Timing**: Save credits for coordinated pushes with teammates, especially near season end
7. **Monitor Leaderboard**: Track which zones need attention and which teams are threats
8. **Final Hour Push**: Coordinate with teammates for a concentrated effort in the last hour
9. **Zone Math**: Controlling 15 zones = 1,500 points. That's worth 1,500 individual pixels!
10. **Persistent Effort**: Success comes from consistent play throughout the season

### Season System

**How Seasons Work:**
- Each season lasts a configurable duration (default: 7 days)
- The season countdown timer is always visible in the header
- **Scoring System**: Team score = (Zones Controlled × 100) + Total Pixels
  - Example: 15 zones + 1,234 pixels = 1,500 + 1,234 = 2,734 points
  - Zones are worth significantly more than individual pixels
  - Encourages strategic zone control over random pixel placement
- When a season ends:
  1. The winning team is determined by highest score
  2. A winner announcement modal appears for all players
  3. Final standings and statistics are saved to season history
  4. The canvas resets to blank
  5. A new season automatically begins
  6. Team assignments are preserved (you stay on your team)

**Season Countdown Timer:**
- **Normal State** (>24h remaining): Gray background, ⏱️ icon, shows days and hours
- **Warning State** (<24h remaining): Yellow background, ⏱️ icon, shows hours and minutes
- **Urgent State** (<1h remaining): Orange background, ⏰ icon, shows minutes and seconds
- **Critical State** (<5m remaining): Red background, 🚨 icon, pulsing animation, shows minutes and seconds
- **Ending State** (0 time): Red background, shows "Season Ending..."

**Winner Announcement:**
When a season ends, all players see a spectacular full-screen celebration modal featuring:
- **Confetti Animation**: 20 colorful confetti pieces falling from the top with random colors and timing
- **Trophy Animation**: Large bouncing trophy (🏆) at the top
- **Winner Display**: 
  - "Season X Winner!" headline with pulsing animation
  - Winning team name in huge text with their team color
  - Final score in gold (e.g., "1,234 Points")
- **Final Standings Table**: Complete rankings with:
  - Medals for top 3 teams (🥇🥈🥉)
  - Team names, scores, zones controlled, and player counts
  - Responsive design (hides some columns on mobile)
- **Season Statistics**: Three stat cards showing:
  - 🎨 Total pixels placed across all teams
  - 👥 Total players who participated
  - ⭐ Top player with username and pixel count
- **Auto-Close**: Modal automatically closes after 10 seconds
- **Manual Close**: Click anywhere or press the × button to close immediately
- **Countdown**: Shows "Closing in Xs..." at the bottom

**Season History:**
- View past season winners and statistics (last 10 seasons)
- See final team standings from previous seasons
- Track your team's performance across seasons
- View detailed statistics for each completed season:
  - Winning team with final score
  - Complete final standings for all teams
  - Total pixels placed across all teams
  - Total players who participated
  - Top player with username and pixel count
  - Closest zone battle (smallest margin)
- Access via API endpoint `/api/season/history`
- Season history persists across game resets

## Technical Details

### Built With

- **Platform**: Reddit Devvit Web
- **Frontend**: React 19, TypeScript 5.8, Vite
- **Backend**: Express, Node.js 22.2.0
- **Database**: Redis (via Devvit)
- **Styling**: Tailwind CSS
- **Canvas**: HTML5 Canvas with OffscreenCanvas optimization

### Architecture

- **Client**: React app with hooks for state management
- **Server**: Express API with Redis services
- **Shared**: TypeScript types for type safety
- **Real-Time**: Polling-based updates (1-second canvas, 10-second leaderboard)
- **Optimization**: Chunk-based rendering, viewport culling, batch updates

### Performance

- **60fps Rendering**: Smooth animations and interactions
- **Optimistic Updates**: 0ms perceived latency for pixel placement
- **Efficient Polling**: Only fetches updates since last poll
- **Chunk-Based**: Only dirty chunks re-render
- **Viewport Culling**: Only visible chunks rendered

## Development

### Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Deploy to Reddit
npm run launch
```

### Project Structure

```
src/
├── client/          # React frontend
│   ├── components/  # UI components (Canvas, Leaderboard, etc.)
│   ├── hooks/       # Custom React hooks
│   └── main.tsx     # Entry point
├── server/          # Express backend
│   ├── services/    # Business logic (Canvas, Credits, Teams, etc.)
│   ├── middleware/  # Auth, validation, rate limiting
│   └── index.ts     # API routes
└── shared/          # Shared types and constants
```

### Key Files

- `src/client/App.tsx`: Main game component
- `src/client/components/Canvas.tsx`: Canvas rendering with optimizations
- `src/client/components/Leaderboard.tsx`: Leaderboard modal
- `src/server/index.ts`: API endpoints
- `src/server/services/`: Redis-backed game services

## Credits

Built with ❤️ using Reddit's Devvit platform & Kiro AI.

## License

MIT License - See LICENSE file for details
