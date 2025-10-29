# Pixel Wars Testing Checklist

## 🚀 Pre-Testing Setup

- [ ] Run `npm run dev` in terminal
- [ ] Wait for all builds to complete
- [ ] Open playtest URL in browser
- [ ] Have mobile device ready for testing

## 🎮 Core Gameplay

### Initial Load
- [ ] Splash screen appears with team stats
- [ ] "Join the Battle" button is visible
- [ ] Team standings show correctly
- [ ] Active player count displays

### Tutorial (First Time)
- [ ] Tutorial overlay appears automatically
- [ ] Can navigate through 6 steps
- [ ] "Back" button works
- [ ] "Skip" button dismisses tutorial
- [ ] "Let's Play!" completes tutorial
- [ ] Tutorial doesn't show again after completion

### Game Initialization
- [ ] Username displays in header
- [ ] Team assignment shows (Red/Blue/Green)
- [ ] Team badge displays with correct color
- [ ] Starting credits show (5)
- [ ] Canvas loads with existing pixels
- [ ] Help button (❓) is visible

### Pixel Placement
- [ ] Click canvas to place pixel
- [ ] Success toast appears
- [ ] Credits decrease by 1
- [ ] Cooldown timer starts
- [ ] Pixel appears on canvas immediately
- [ ] Canvas updates with other players' pixels
- [ ] Error toast when no credits available

### Credit System
- [ ] Credits display correctly
- [ ] Cooldown timer counts down (MM:SS format)
- [ ] Credits regenerate after 2 minutes
- [ ] Max credits cap at 10
- [ ] Timer disappears when credits are full

## 🎨 UI Components

### Header
- [ ] Title "Pixel Wars" displays
- [ ] Username shows correctly
- [ ] Team badge has correct color
- [ ] Team name displays
- [ ] Credits counter updates
- [ ] Cooldown timer updates every second
- [ ] Help button opens tutorial
- [ ] Responsive on mobile

### Canvas
- [ ] 100x100 grid renders
- [ ] Pixels display with team colors
- [ ] Zone overlays show (if implemented)
- [ ] Click to place works
- [ ] Drag to pan works
- [ ] Smooth panning
- [ ] No lag or stuttering

### Control Panel
- [ ] Instructions display
- [ ] Team badges show (desktop)
- [ ] User's team is highlighted
- [ ] Zoom controls visible
- [ ] Current zoom % displays
- [ ] Leaderboard button visible
- [ ] Responsive on mobile

### Zoom Controls
- [ ] Click + to zoom in
- [ ] Click - to zoom out
- [ ] Zoom % updates correctly
- [ ] Canvas scales smoothly
- [ ] Reset button centers view
- [ ] Zoom range: 50% to 500%
- [ ] Mouse wheel zoom works (if implemented)

### Leaderboard Modal
- [ ] Click 🏆 button to open
- [ ] Modal appears with backdrop
- [ ] Click backdrop to close
- [ ] Click X button to close
- [ ] Two tabs: Players and Teams
- [ ] Default tab is Players

#### Players Tab
- [ ] Top 10 players display
- [ ] Medals for top 3 (🥇🥈🥉)
- [ ] Player names show
- [ ] Pixel counts show
- [ ] Team colors display
- [ ] Current user is highlighted
- [ ] User rank shows in footer
- [ ] If rank > 10, user shows at bottom with "..."

#### Teams Tab
- [ ] All 4 teams display
- [ ] Teams ranked correctly
- [ ] Medals for top 3 teams
- [ ] Team badges with colors
- [ ] Zones controlled shows
- [ ] Total pixels shows
- [ ] Percentages calculate correctly
- [ ] Progress bars animate
- [ ] User's team is highlighted

#### Leaderboard Features
- [ ] Refresh button works
- [ ] Auto-refreshes every 10 seconds
- [ ] Loading state (if applicable)
- [ ] Smooth animations
- [ ] Responsive on mobile

### Toast Notifications
- [ ] Success toast on pixel placement
- [ ] Error toast when no credits
- [ ] Error toast on failed placement
- [ ] Toasts auto-dismiss after 3 seconds
- [ ] Can manually close with X
- [ ] Multiple toasts stack vertically
- [ ] Correct colors for each type
- [ ] Icons display (✓✕ℹ⚠)

## 📱 Mobile Testing

### Responsive Design
- [ ] Header adapts for mobile
- [ ] Canvas fills screen
- [ ] Control panel is compact
- [ ] Leaderboard is full-screen modal
- [ ] Instructions are simplified
- [ ] Team stats hidden on mobile
- [ ] All buttons are touch-friendly

### Touch Interactions
- [ ] Tap to place pixel
- [ ] Drag to pan canvas
- [ ] Pinch to zoom (if implemented)
- [ ] Tap zoom buttons
- [ ] Tap leaderboard button
- [ ] Swipe to dismiss modals (if implemented)
- [ ] No accidental clicks

### Mobile Performance
- [ ] Canvas renders smoothly
- [ ] No lag when panning
- [ ] Toasts display correctly
- [ ] Modal animations smooth
- [ ] No layout shifts
- [ ] Text is readable

## 🔄 Real-Time Features

### Canvas Updates
- [ ] Other players' pixels appear
- [ ] Updates happen every second
- [ ] No flickering
- [ ] Smooth transitions
- [ ] Zone control updates

### Leaderboard Updates
- [ ] Rankings update automatically
- [ ] Manual refresh works
- [ ] User rank updates
- [ ] Team standings update

### Credit Regeneration
- [ ] Timer counts down accurately
- [ ] Credits regenerate on schedule
- [ ] Timer resets after regeneration
- [ ] No timing issues

## 🎯 Edge Cases

### No Credits
- [ ] Can't place pixel
- [ ] Error toast shows
- [ ] Clear error message
- [ ] Timer shows when next credit

### Network Issues
- [ ] Error handling for failed requests
- [ ] Retry functionality
- [ ] User-friendly error messages
- [ ] Graceful degradation

### Empty States
- [ ] Leaderboard with no players
- [ ] Canvas with no pixels
- [ ] Appropriate messages display

### Boundary Testing
- [ ] Can't place pixel outside canvas
- [ ] Zoom limits enforced (50%-500%)
- [ ] Credit cap at 10
- [ ] Proper validation

## 🎨 Visual Polish

### Animations
- [ ] Smooth fade-ins
- [ ] Progress bar animations
- [ ] Modal transitions
- [ ] Toast animations
- [ ] No janky animations

### Colors
- [ ] Team colors correct
- [ ] UI colors consistent
- [ ] Good contrast
- [ ] Readable text
- [ ] Accessible colors

### Layout
- [ ] No overlapping elements
- [ ] Proper spacing
- [ ] Aligned elements
- [ ] Consistent padding
- [ ] Professional appearance

## 🔍 Browser Testing

### Desktop Browsers
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

### Mobile Browsers
- [ ] iOS Safari
- [ ] Android Chrome
- [ ] Mobile Firefox

### Screen Sizes
- [ ] Mobile (< 640px)
- [ ] Tablet (640-768px)
- [ ] Desktop (> 768px)
- [ ] Large desktop (> 1920px)

## 🐛 Bug Tracking

### Issues Found
```
Issue #1:
- Description:
- Steps to reproduce:
- Expected behavior:
- Actual behavior:
- Priority: High/Medium/Low

Issue #2:
...
```

## ✅ Sign-Off

### Functionality
- [ ] All core features work
- [ ] No critical bugs
- [ ] Performance is acceptable
- [ ] UI is polished

### Ready for Deployment
- [ ] All tests passed
- [ ] Mobile tested
- [ ] Cross-browser tested
- [ ] Documentation updated

---

**Testing Status**: ⬜ Not Started | 🟡 In Progress | ✅ Complete

**Tester**: _______________
**Date**: _______________
**Build Version**: _______________
