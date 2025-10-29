# 🎨 Pixel Wars - Team Territory Battle

A massively multiplayer competitive pixel art game built with Devvit for Reddit. Join one of four teams and battle for control of a shared canvas in real-time seasonal competitions!

## 🎯 TL;DR

**What**: Team-based pixel placement game with zone control mechanics  
**How**: Click to place pixels (1 credit each), control zones by majority, win seasons by highest score  
**Why Play**: Strategic depth, instant feedback, timed seasons, team coordination, 60 FPS performance  
**Platform**: Runs directly in Reddit posts on mobile and desktop  
**Tech**: React + TypeScript + Express + Redis, optimized for 10,000+ pixels and 100+ players

## 🎮 What is Pixel Wars?

Pixel Wars is a massively multiplayer strategic team-based game where players place colored pixels on a shared 100x100 canvas to control territory zones. Inspired by Reddit's legendary r/place, Pixel Wars adds competitive structure with team battles, zone control mechanics, and timed seasons with clear winners.

**Core Concept**: Three teams (Red 🔴, Blue 🔵, Green 🟢) compete to dominate a grid divided into 100 strategic zones (10x10 each). Place pixels strategically to control zones, climb the leaderboard, and lead your team to victory before the season ends!

**What You Do:**
- **Place Pixels**: Click the canvas to place colored pixels for your team (costs 1 credit per pixel)
- **Control Zones**: Dominate zones by having the most pixels in each 10x10 area
- **Earn Points**: Teams score points for zones controlled (100 points per zone) plus total pixels placed
- **Compete in Seasons**: Timed competitions with automatic winner detection and celebration
- **Coordinate Strategy**: Use Reddit comments to organize attacks and defenses with teammates
- **Climb Leaderboards**: Track your personal rank and your team's standing in real-time

## ✨ What Makes This Game Unique & Innovative

### 🎯 Strategic Zone Control System (Core Innovation)
Unlike traditional pixel art games where you just draw, Pixel Wars features a **zone-based territory control** mechanic. The canvas is divided into 100 zones, and teams must control the majority of pixels in each zone to claim it. This creates strategic gameplay where coordination and planning matter more than random pixel placement.

**Why This Matters:**
- **Strategic Depth**: Controlling a single zone (100 pixels) is worth 100 points, making focused attacks more valuable than scattered pixels
- **Team Coordination**: Players naturally organize to capture and defend specific zones
- **Dynamic Gameplay**: Zones constantly change hands, creating exciting back-and-forth battles
- **Clear Objectives**: Visual zone borders make it obvious where to focus efforts

**Visual Feedback:**
- Controlled zones display colored borders matching the team
- Animated pulsing effects when zones change hands
- Team indicators in zone corners show ownership
- Real-time zone control updates as pixels are placed

### ⚡ Instant Pixel Placement (Technical Innovation)
Your pixels appear **instantly** on the canvas (0ms perceived latency) using optimistic updates. The game provides immediate visual feedback through:
- Hover preview showing where your pixel will be placed
- Contextual instruction banners guiding your actions
- Toast notifications confirming placements
- Sound effects celebrating victories

**Technical Achievement:**
- Optimistic UI updates show pixels immediately
- Server validation happens in background
- Rollback on failure (rare)
- Creates responsive, satisfying gameplay experience
- No waiting for server round-trips

### ⏰ Competitive Season System (Engagement Innovation)
**Timed seasons** create urgency and excitement:
- Seasons run for configurable durations (default 7 days)
- Live countdown timer with dynamic styling based on urgency
- Automatic winner detection and celebration
- Full-screen winner modal with confetti and trophy animations
- Canvas resets for fresh competition each season
- Season history tracks past champions

**Why Seasons Work:**
- **Clear Goals**: Players know exactly when the competition ends
- **Fresh Starts**: New seasons give everyone a chance to win
- **Urgency**: Countdown timer creates excitement as time runs out
- **Celebration**: Winner announcements make victories feel meaningful
- **Retention**: Players return for new seasons to compete again

### 💰 Balanced Credit Economy (Game Design Innovation)
A **credit regeneration system** prevents spam while keeping gameplay engaging:
- Start with 5 credits
- Earn 1 credit every 2 minutes (max 10)
- Each pixel costs 1 credit
- Live countdown timer shows when next credit arrives
- Forces strategic thinking about where to place pixels

**Design Philosophy:**
- **Anti-Spam**: Prevents single players from dominating through rapid clicking
- **Strategic Depth**: Limited resources force meaningful decisions
- **Accessibility**: Casual players can compete without constant attention
- **Fairness**: Everyone regenerates credits at the same rate
- **Engagement**: Players return regularly to use accumulated credits

### 🚀 Performance Optimized (Technical Excellence)
Advanced rendering techniques ensure smooth 60 FPS performance even with 10,000 pixels:
- Chunk-based rendering with OffscreenCanvas
- Viewport culling (only render visible areas)
- Dirty-rectangle updates (only redraw changed pixels)
- Batch pixel updates for efficiency
- RequestAnimationFrame for smooth animations

**Performance Achievements:**
- **60 FPS**: Smooth gameplay even with thousands of pixels
- **Instant Response**: Canvas updates feel immediate
- **Mobile Optimized**: Works smoothly on phones and tablets
- **Scalable**: Can handle 100+ simultaneous players
- **Efficient**: Minimal battery drain on mobile devices

### 📱 Mobile-First Design (Platform Innovation)
Built for Reddit's mobile-first audience (70%+ of Reddit users are on mobile):
- Fully responsive touch controls
- Touch-friendly UI with proper hit targets (44x44px minimum)
- Optimized canvas rendering for mobile devices
- Works seamlessly on phones, tablets, and desktop
- Pinch-to-zoom and drag gestures
- Contextual instructions adapt for mobile vs desktop

**Mobile Considerations:**
- **Touch Targets**: All buttons meet 44x44px accessibility standard
- **Gestures**: Native pinch-to-zoom and drag feel natural
- **Performance**: Optimized rendering for mobile GPUs
- **Layout**: Responsive design adapts to any screen size
- **Battery**: Efficient rendering minimizes power consumption

### 🎮 Reddit Integration (Community Innovation)
Seamlessly integrated with Reddit's social features:
- **"Discuss Strategy" Button**: Opens post comments for team coordination
- **Reddit Authentication**: Automatic login through Reddit accounts
- **Subreddit Integration**: Runs directly in Reddit posts
- **Community Building**: Natural team rivalries and coordination
- **Social Sharing**: Easy to share victories and strategies

**Community Features:**
- Coordinate attacks in Reddit comments
- Share strategies and tactics with teammates
- Celebrate victories together
- Build team identity and culture
- Cross-post achievements to other subreddits

### 🏆 Innovation Summary

Pixel Wars combines multiple innovations to create a unique multiplayer experience:

1. **Strategic Depth**: Zone control system adds strategy beyond simple pixel placement
2. **Technical Excellence**: 60 FPS performance with instant pixel placement
3. **Engagement Design**: Seasons and credit economy keep players returning
4. **Mobile-First**: Built for Reddit's mobile audience from day one
5. **Community-Driven**: Reddit integration enables natural team coordination
6. **Polished UX**: Sound effects, animations, and visual feedback create satisfying gameplay
7. **Accessibility**: Tutorial system and contextual guidance welcome new players

**The Result**: A massively multiplayer game that's easy to learn, hard to master, and deeply engaging for Reddit communities.

## 🕹️ How to Play

### Getting Started

1. **Join the Battle**
   - Open the Pixel Wars post on Reddit
   - See the animated splash screen with live team stats
   - Click "⚔️ Join the Battle" to enter full-screen mode
   - You'll be automatically assigned to a team (Red, Blue, or Green)

2. **Understand the Interface**
   
   **Header (Top Bar):**
   - Game title and season number
   - **Season countdown timer** (shows time remaining with urgency-based styling)
   - Your team badge (glowing colored square)
   - **Credit counter** (e.g., "Credits: 7")
   - Credit cooldown timer (e.g., "(1:45)" until next credit)
   - Help button (❓) to access tutorial
   
   **Canvas (Center):**
   - 100x100 pixel grid (10,000 total pixels)
   - Colored pixels show team territories
   - Zone overlays with animated borders
   - Hover preview shows where your pixel will be placed
   
   **Control Panel (Bottom Bar):**
   - Instructions for controls
   - Zoom controls (+/− buttons with percentage)
   - Reset view button
   - **"💬 Discuss Strategy"** button (opens Reddit comments)
   - **"🏆 Leaderboard"** button (shows rankings)

### Core Gameplay

#### Placing Pixels

1. **Hover over the canvas** to see a semi-transparent preview in your team's color
2. **Click or tap** to place a pixel (costs 1 credit)
3. **Pixel appears instantly** on the canvas
4. **Success notification** confirms placement
5. **Credit counter updates** immediately
6. **Cooldown timer starts** if you were at max credits

**Contextual Guidance:**
- **When you have credits**: Blue banner shows "👆 Click on the canvas to place a pixel for [Your Team]!"
- **When out of credits**: Orange banner shows "⏳ Out of credits! Next pixel in [time]"

#### Managing Credits

- **Starting Credits**: 5 credits when you join
- **Regeneration**: 1 credit every 2 minutes (120 seconds)
- **Maximum Storage**: 10 credits
- **Live Timer**: Header shows countdown to next credit (e.g., "(1:45)")
- **Strategic Use**: Plan your placements carefully!

#### Controlling Zones

1. **Zone System**: Canvas divided into 100 zones (10×10 grid, each zone is 10×10 pixels)
2. **Zone Control**: Team with most pixels in a zone controls it
3. **Visual Indicators**:
   - Colored border (2px) in controlling team's color
   - Subtle background tint (12% opacity)
   - Team indicator in corner (colored square with team initial)
4. **Zone Animations**: When zones change hands:
   - 1-second pulsing animation
   - Border thickness pulses
   - Fill opacity pulses
5. **Notifications**:
   - Zone capture: "🎉 [Your Team] captured zone (X, Y)!"
   - Zone loss: "⚠️ Zone (X, Y) taken by [Other Team]!"

#### Navigating the Canvas

- **Pan**: Click and drag to move around
- **Zoom In**: Click "+" button or scroll up (increases by 20%)
- **Zoom Out**: Click "−" button or scroll down (decreases by 20%)
- **Reset View**: Click "Reset" to center at 100% zoom
- **Mobile**: Use pinch-to-zoom and drag gestures
- **Zoom Range**: 50% (0.5x) to 500% (5x)

#### Using the Leaderboard

**Opening:**
- Click "🏆 Leaderboard" button in control panel
- Opens as modal overlay (desktop) or full-screen (mobile)

**Player Rankings Tab (👤 Players):**
- Top 10 players ranked by pixels placed
- Medals for top 3 (🥇🥈🥉)
- Team color indicators
- Your entry highlighted in purple
- Shows your rank even if outside top 10

**Team Standings Tab (👥 Teams):**
- All 4 teams ranked by zones controlled
- Medals for top 3 teams
- Zones controlled with percentage
- Total pixels with percentage
- Animated progress bars
- Your team highlighted with star (⭐)

**Features:**
- Auto-refresh every 10 seconds
- Manual refresh button
- Your rank shown in footer

#### Coordinating with Team

- **Discuss Strategy**: Click "💬 Discuss Strategy" button (orange)
  - Opens Reddit post comments in new tab
  - Coordinate attacks and defenses with teammates
  - Share strategies and organize efforts
- **Leaderboard Insights**: Identify contested zones and threats
- **Persistent World**: Your team's progress continues 24/7
- **Real-Time Updates**: Canvas updates every second

### Winning Strategies

1. **Focus on Zones**: Each zone is worth 100 points! Controlling zones matters more than individual pixels
2. **Watch the Clock**: Monitor season countdown timer to plan final pushes
3. **Coordinate**: Use Reddit comments to organize with teammates
4. **Defend Territory**: Protect zones your team already controls
5. **Strategic Timing**: Save credits for coordinated pushes
6. **Monitor Leaderboard**: Track which zones need attention
7. **Final Hour Push**: Coordinate concentrated effort before season ends
8. **Zone Math**: 15 zones = 1,500 points (worth 1,500 individual pixels!)

### Season System

**How Seasons Work:**
- Each season lasts a configurable duration (default: 7 days)
- **Scoring**: Team score = (Zones × 100) + Total Pixels
- Season countdown timer always visible in header
- When season ends:
  1. Winner determined by highest score
  2. Winner announcement modal appears
  3. Final standings saved to history
  4. Canvas resets to blank
  5. New season automatically begins

**Season Countdown Timer:**
- **>24h**: Gray background, shows days and hours
- **<24h**: Yellow background, shows hours and minutes
- **<1h**: Orange background, shows minutes and seconds
- **<5m**: Red background, pulsing animation, critical state
- **0 time**: "Season Ending..."

**Winner Announcement:**
Full-screen celebration modal featuring:
- Confetti animation falling from top
- Bouncing trophy (🏆)
- Winning team name in their color
- Final score in gold
- Complete final standings table
- Season statistics (total pixels, players, top player)
- Auto-closes after 10 seconds

**Season History:**
- View past season winners (last 10 seasons)
- See final standings and statistics
- Track your team's performance across seasons

## 🎯 Game Features

- ✅ **3 Teams**: Red, Blue, Green with auto-balancing
- ✅ **100x100 Canvas**: 10,000 pixels of strategic territory
- ✅ **100 Zones**: 10x10 grid for zone control
- ✅ **Credit System**: Balanced economy prevents spam
- ✅ **Real-Time Updates**: Canvas updates every second
- ✅ **Seasonal Competition**: Timed seasons with winners
- ✅ **Leaderboards**: Player and team rankings
- ✅ **Sound Effects**: Audio feedback for actions
- ✅ **Mobile Optimized**: Touch-friendly responsive design
- ✅ **Interactive Tutorial**: First-time user onboarding
- ✅ **Winner Celebrations**: Animated victory announcements
- ✅ **Season History**: Track past champions
- ✅ **Optimistic Updates**: Instant pixel placement (0ms latency)
- ✅ **Zone Animations**: Pulsing effects when zones change hands
- ✅ **Reddit Integration**: "Discuss Strategy" button links to comments

## 🚀 Quick Start (For Developers)

```bash
# Install dependencies
npm install

# Start development server (runs client, server, and Devvit playtest)
npm run dev

# Visit the playtest URL provided by Devvit
# Example: https://www.reddit.com/r/orik-app_dev?playtest=orik-app
```

### Development Tools

**Season Admin Panel (Playtest Mode Only):**
- Appears in bottom-right corner during development/testing
- "🚀 Start Next Season" button to manually advance seasons
- Only visible when URL contains 'playtest' or on localhost
- Hidden from regular users on published app
- Useful for testing season transitions and winner announcements

**Build Commands:**
```bash
npm run build          # Build client and server for production
npm run deploy         # Upload to Reddit
npm run launch         # Build, deploy, and publish for review
npm run check          # Run type-check, lint, and prettier
```

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript 5.8, Tailwind CSS
- **Backend**: Express, Node.js
- **Platform**: Devvit (Reddit's developer platform)
- **Storage**: Redis
- **Build**: Vite
- **Testing**: Vitest

## 📦 Project Structure

```
src/
├── client/          # React frontend
│   ├── components/  # UI components (Canvas, Leaderboard, etc.)
│   ├── hooks/       # Custom React hooks
│   └── App.tsx      # Main application
├── server/          # Express backend
│   ├── services/    # Game logic (canvas, credits, seasons, etc.)
│   ├── middleware/  # Auth, validation, rate limiting
│   └── index.ts     # Server entry point
└── shared/          # Shared types and constants
```

## 🎨 Canvas Rendering

The canvas uses advanced optimization techniques for smooth 60 FPS performance:

### Chunk-Based Rendering
- Canvas divided into 50x50 pixel chunks
- Only dirty chunks re-render when pixels change
- OffscreenCanvas for background rendering
- Reduces main thread blocking

### Viewport Culling
- Only visible chunks are rendered
- Calculates viewport bounds based on pan/zoom
- Dramatically improves performance with large canvases

### Dirty-Rectangle Updates
- Tracks which pixels changed
- Only redraws changed areas
- Batch pixel updates into single render cycle
- Uses requestAnimationFrame for smooth animations

### Zone Overlays
- Rendered on top of pixel layer
- Animated borders when zones change hands
- Team indicators in zone corners
- Subtle background tints for ownership

## 🔊 Sound Effects

Optional audio feedback using Web Audio API:
- **Pixel Placement**: Soft "pop" sound (800Hz + 1200Hz blend)
- **Zone Capture**: Victory chime (C5-E5-G5 major chord)
- **Credit Regeneration**: Subtle "ding" (1200Hz)
- **Error**: Low buzz (200Hz sawtooth wave)
- Programmatically generated (no audio files needed)
- User-initiated (audio context initializes on first interaction)

## 📱 Mobile Optimization

Built with mobile-first design principles:
- Touch-friendly controls (44x44px minimum hit targets)
- Responsive layout adapts to screen size
- Pinch-to-zoom and drag gestures
- Optimized canvas rendering for mobile devices
- Contextual instructions adapt for mobile
- Full-screen modal leaderboard on mobile

## 🎓 Tutorial System

Interactive 6-step guided walkthrough:
1. **Welcome**: Introduction and team assignment
2. **Your Mission**: How to place pixels and control zones
3. **Pixel Credits**: Understanding the credit system
4. **Territory Zones**: How zone control works
5. **Competitive Seasons**: Understanding seasons and scoring
6. **Win Together**: Team coordination and leaderboards
7. **Controls**: Canvas navigation (click, drag, zoom)

- Automatically appears for first-time players
- Access anytime via "❓ Help" button
- Navigate with Next/Back buttons or skip
- Tutorial state saved (won't show again)

## 🏆 Leaderboard System

Comprehensive rankings for players and teams:

### Player Rankings
- Top 10 players by pixels placed
- Medals for top 3 (🥇🥈🥉)
- Team color indicators
- Current user highlighted
- Shows your rank even if outside top 10

### Team Standings
- All 4 teams ranked by zones controlled
- Medals for top 3 teams
- Zones controlled with percentage
- Total pixels with percentage
- Animated progress bars
- Your team highlighted with star

### Features
- Auto-refresh every 10 seconds
- Manual refresh button
- Responsive modal design
- Your rank in footer

## 🔐 Security & Performance

### Middleware
- **Authentication**: Automatic Reddit user authentication
- **Validation**: Request validation for all endpoints
- **Rate Limiting**: Redis-based request throttling
  - Pixel placement: 10 requests per minute
  - General API: 60 requests per minute

### Error Handling
- Graceful error recovery
- User-friendly error messages
- Optimistic updates with rollback on failure
- Network error handling

### Performance
- Chunk-based canvas rendering
- Viewport culling
- Dirty-rectangle updates
- Batch pixel updates
- RequestAnimationFrame for smooth animations
- Optimized Redis operations

## 📄 License

MIT License - See LICENSE file for details

---

**Built with ❤️ using Devvit, React, TypeScript, and lots of pixels**

**Play now on Reddit!** 🎮
