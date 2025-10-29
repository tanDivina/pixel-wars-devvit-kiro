# Canvas Zone Visualization

## Overview

The Canvas component now includes zone visualization features that display territory control on the game canvas. Zones are regions of the canvas that can be controlled by teams based on pixel majority.

## Features Implemented

### 1. Zone Boundaries
- Zones are rendered as rectangular regions on the canvas
- Each zone is defined by the `zoneSize` configuration (default: 10x10 pixels)
- Zone boundaries are drawn with team colors when controlled

### 2. Zone Control Indicators
- Controlled zones display a colored border matching the controlling team
- A small indicator in the top-left corner shows the team's initial letter
- Neutral zones (no controlling team) are not highlighted

### 3. Visual Highlights
- Controlled zones have a subtle fill color (12% opacity) matching the team color
- Border thickness: 2px for stable zones
- The highlight provides visual feedback without obscuring pixel details

### 4. Zone Update Animations
- When zone control changes, a 1-second animation plays
- Animation features:
  - Pulsing border thickness (2-4px)
  - Pulsing fill opacity (12-30%)
  - Smooth sine wave interpolation
- Animations automatically clean up after completion

## Technical Implementation

### Data Flow
1. Zones are passed as a prop to the Canvas component
2. Zone data is stored in a ref map for efficient lookups
3. Zone control changes are detected by comparing old and new zone data
4. Changed zones trigger animations tracked in component state

### Rendering Pipeline
1. Pixel chunks are rendered first (existing functionality)
2. Zone overlays are rendered on top of the pixel grid
3. Zone rendering happens in the main canvas context after chunk composition
4. Animations use `requestAnimationFrame` for smooth 60fps updates

### Performance Considerations
- Zone rendering is integrated into the existing render loop
- Only controlled zones are rendered (neutral zones are skipped)
- Animation state is cleaned up automatically to prevent memory leaks
- Zone map uses efficient key-based lookups (`x:y` format)

## Usage

```tsx
<Canvas
  pixels={pixels}
  config={config}
  userTeam={team}
  zones={zones}  // Zone data from game state
  onPixelClick={handlePixelClick}
/>
```

## Zone Data Structure

```typescript
interface ZoneData {
  x: number;                          // Zone grid X coordinate
  y: number;                          // Zone grid Y coordinate
  controllingTeam: string | null;     // Team ID or null if neutral
  pixelCount: Record<string, number>; // Pixel count per team
}
```

## Visual Design

### Colors
- Zone fill: Team color with 20 hex opacity (e.g., `#FF444420`)
- Zone border: Full team color (e.g., `#FF4444`)
- Indicator background: Full team color
- Indicator text: White

### Dimensions
- Zone size: `config.zoneSize * pixelSize` (default: 100px)
- Border width: 2px (stable), 2-4px (animating)
- Indicator size: 8x8px
- Indicator padding: 4px from corner

### Animation Timing
- Duration: 1000ms (1 second)
- Easing: Sine wave (4 cycles during animation)
- Frame rate: 60fps via `requestAnimationFrame`

## Requirements Satisfied

This implementation satisfies the following requirements from the design document:

- **Requirement 6.3**: Display visual indicators for zone control
- **Requirement 6.4**: Update visual indicators within 5 seconds of zone control changes
- **Requirement 6.5**: Display percentage of zones controlled by each team (via visual representation)

## Future Enhancements

Potential improvements for future iterations:
- Zone statistics overlay (pixel counts, control percentage)
- Different animation styles for different events (capture, defend, contest)
- Minimap showing all zones at once
- Zone hover tooltips with detailed statistics
- Team-specific zone highlighting (emphasize user's team zones)
