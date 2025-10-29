# Pixel Wars UI Layout Guide

## 📐 Screen Layout

```
┌─────────────────────────────────────────────────────────────┐
│  HEADER (Gray-800)                                          │
│  ┌──────────┬──────────────┬─────────────────────────────┐ │
│  │ Pixel    │ Player:      │ [Team Badge] Red Team       │ │
│  │ Wars     │ username     │ Credits: 7 (1:45)  ❓ Help  │ │
│  └──────────┴──────────────┴─────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                    CANVAS AREA (Gray-100)                   │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │                                                       │ │
│  │                                                       │ │
│  │              100x100 Pixel Grid                      │ │
│  │           (with zone overlays)                       │ │
│  │                                                       │ │
│  │                                                       │ │
│  │                                                  [+]  │ │
│  │                                                  [-]  │ │
│  │                                              [Reset]  │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  CONTROL PANEL (Gray-800)                                   │
│  ┌──────────────────────┬──────────────┬─────────────────┐ │
│  │ Instructions         │ Team Badges  │ [-] 100% [+]    │ │
│  │ Click • Drag • Zoom  │ 🔴🔵🟢🟡      │ Reset  🏆 Board │ │
│  └──────────────────────┴──────────────┴─────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## 🏆 Leaderboard Modal (When Open)

```
┌─────────────────────────────────────────────────────────────┐
│ [Backdrop - Semi-transparent Black]                         │
│                                                             │
│     ┌─────────────────────────────────────────────┐       │
│     │ 🏆 Leaderboard                           [×] │       │
│     ├─────────────────────────────────────────────┤       │
│     │ [👤 Players] [👥 Teams]                     │       │
│     ├─────────────────────────────────────────────┤       │
│     │                                             │       │
│     │  🥇 [🔴] player1          100 pixels        │       │
│     │  🥈 [🔵] player2           80 pixels        │       │
│     │  🥉 [🟢] player3           60 pixels        │       │
│     │  #4 [🟡] player4           50 pixels        │       │
│     │  ...                                        │       │
│     │                                             │       │
│     ├─────────────────────────────────────────────┤       │
│     │ Your rank: #1              🔄 Refresh       │       │
│     └─────────────────────────────────────────────┘       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 🎨 Toast Notifications (Top-Right)

```
                                    ┌─────────────────────────┐
                                    │ ✓ Pixel placed!      [×]│
                                    └─────────────────────────┘
                                    ┌─────────────────────────┐
                                    │ ✕ No credits left!   [×]│
                                    └─────────────────────────┘
```

## 📱 Mobile Layout (< 768px)

```
┌───────────────────────┐
│ HEADER (Compact)      │
│ Pixel Wars            │
│ [🔴] Red  Credits: 7  │
│ ❓                     │
├───────────────────────┤
│                       │
│   CANVAS (Full)       │
│                       │
│                  [+]  │
│                  [-]  │
│              [Reset]  │
│                       │
├───────────────────────┤
│ CONTROL PANEL         │
│ Tap • Drag            │
│ [-] 100% [+] 🏆       │
└───────────────────────┘
```

## 🎯 Component Hierarchy

```
App
├── ToastContainer
│   └── Toast (multiple)
├── Tutorial (overlay)
├── Leaderboard (modal)
│   ├── PlayerRankings
│   └── TeamStandings
├── Header
│   ├── Title
│   ├── Username
│   ├── Team Badge
│   ├── Credits Display
│   └── Help Button
├── Canvas
│   ├── Pixel Grid
│   ├── Zone Overlays
│   └── Zoom Controls (internal)
└── ControlPanel
    ├── Instructions
    ├── Team Stats
    ├── Zoom Controls
    ├── Reset Button
    └── Leaderboard Toggle
```

## 🎨 Color Scheme

### Teams
- 🔴 Red: `#FF4444`
- 🔵 Blue: `#4444FF`
- 🟢 Green: `#44FF44`

### UI Elements
- Header/Footer: `bg-gray-800` (dark gray)
- Canvas Area: `bg-gray-100` (light gray)
- Leaderboard: `bg-white` with `purple-600` accents
- User Highlight: `bg-purple-50` with `border-purple-300`

### Toast Types
- Success: `bg-green-500`
- Error: `bg-red-500`
- Info: `bg-blue-500`
- Warning: `bg-yellow-500`

## 🖱️ Interactive Elements

### Clickable Areas
1. **Canvas**: Click to place pixel
2. **Zoom Buttons**: +/- to zoom
3. **Reset Button**: Center view
4. **Leaderboard Button**: Open/close modal
5. **Help Button**: Show tutorial
6. **Tab Buttons**: Switch leaderboard tabs
7. **Refresh Button**: Update leaderboard
8. **Close Buttons**: Dismiss modals/toasts

### Hover States
- All buttons have `hover:` states
- Canvas shows cursor changes
- Leaderboard items highlight on hover

### Focus States
- Keyboard navigation supported
- Clear focus indicators
- Tab order logical

## 📏 Responsive Breakpoints

### Mobile (< 640px)
- Single column layout
- Simplified instructions
- Hidden team stats in control panel
- Full-width leaderboard modal

### Tablet (640px - 768px)
- Compact layout
- Some team stats visible
- Adjusted spacing

### Desktop (> 768px)
- Full layout with all features
- Team stats in control panel
- Sidebar-style leaderboard
- Optimal spacing

## 🎭 Animations

### Fade In
- Tutorial overlay
- Leaderboard modal
- Toast notifications

### Slide In
- Splash screen elements
- Tutorial steps

### Pulse
- Team badges on splash
- Zone control changes

### Progress Bars
- Team standings
- Animated width transitions

## 🔧 State Management

### App Level
- `showTutorial`: boolean
- `showLeaderboard`: boolean
- `currentZoom`: number
- `toasts`: Toast[]

### Canvas Level
- `scale`: number
- `offset`: {x, y}
- `isDragging`: boolean

### Leaderboard Level
- `activeTab`: 'players' | 'teams'
- `players`: PlayerRanking[]
- `teams`: TeamRanking[]
- `loading`: boolean

## 🎮 User Flows

### First Time User
1. See splash screen
2. Click "Join the Battle"
3. See tutorial overlay (6 steps)
4. Complete tutorial
5. Start playing

### Placing a Pixel
1. Click canvas location
2. See success toast
3. Credits decrease
4. Cooldown timer starts
5. Canvas updates

### Checking Leaderboard
1. Click 🏆 button
2. Modal opens
3. See player rankings
4. Switch to teams tab
5. See team standings
6. Click X to close

### Zooming Canvas
1. Click + to zoom in
2. See zoom % update
3. Canvas scales
4. Click - to zoom out
5. Click Reset to center

---

**Visual Guide Complete!** 🎨
Use this as reference for understanding the UI layout and interactions.
