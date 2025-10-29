# SplashScreen Animations

This document describes the animations used in the SplashScreen component for an engaging user experience.

## Animation Categories

### 1. Entrance Animations

**Purpose**: Smoothly introduce elements when the splash screen loads

- `animate-fade-in-delay`: Subtitle fades in with slight upward movement (0.3s delay)
- `animate-fade-in-delay-2`: Help text fades in (0.6s delay)
- `animate-slide-in-left`: Active players card slides in from left (0.2s delay)
- `animate-slide-in-right`: Total pixels card slides in from right (0.2s delay)
- `animate-fade-in-up`: Team standings section fades in with upward movement (0.4s delay)

### 2. Attention-Grabbing Animations

**Purpose**: Draw user attention to key elements

- `animate-pulse-slow`: Title pulses gently (3s cycle)
- `animate-bounce-subtle`: Join Battle button bounces subtly (2s cycle, 1s delay)
- `animate-pulse-button`: Button shadow pulses between blue and purple (2s cycle)

### 3. Team Color Pulsing Effects

**Purpose**: Highlight team colors and create visual interest

- `animate-pulse-color`: Team color badges pulse with glow effect (2s cycle)
- `animate-pulse-glow`: Hover glow effect on team standings (2s cycle)
- `animate-expand-width`: Team progress bars animate from 0 to final width (1s, staggered by 150ms per team)

### 4. Interactive Hover Effects

**Purpose**: Provide feedback on interactive elements

- Stats cards: `hover:scale-105` + border color change
- Team standings: `hover:scale-102` + pulsing glow overlay
- Join Battle button: `hover:scale-110` + shimmer effect

### 5. Smooth Transitions

**Purpose**: Ensure all state changes are smooth

- Main container: 1s fade-in with upward movement
- All hover effects: 300ms transition duration
- Border colors: 300ms transition
- Opacity changes: 300ms transition

## Performance Optimizations

1. **CSS-based animations**: All animations use CSS transforms and opacity for GPU acceleration
2. **Staggered delays**: Team standings animate with 100-150ms delays to avoid overwhelming the user
3. **Reduced motion**: Consider adding `prefers-reduced-motion` media query support for accessibility
4. **Will-change hints**: Could be added for frequently animated elements

## Animation Timing

```
0ms    - Page loads, loading state shown
50ms   - Data loaded, fade-in begins
200ms  - Stats cards slide in
300ms  - Title subtitle appears
400ms  - Team standings fade in
600ms  - Help text appears
1000ms - Join Battle button starts bouncing
```

## Customization

To adjust animation speeds, modify the duration values in `src/client/index.css`:

- Fast animations: 0.3-0.6s
- Medium animations: 0.8-1s
- Slow animations: 2-3s (for continuous effects)

## Browser Compatibility

All animations use standard CSS3 properties supported by:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari 14+, Chrome Android 90+)
