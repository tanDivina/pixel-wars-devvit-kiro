# Custom Splash Screen Guide for Pixel Wars

## Overview

The splash screen is the first thing players see in their Reddit feed. For Pixel Wars, we need engaging visuals that communicate the team-based pixel art battle concept.

## Required Assets

You need to replace these two files:
- `assets/default-splash.png` - Background image
- `assets/default-icon.png` - Game logo/icon

## Design Specifications

### Background Image (`default-splash.png`)
- **Recommended Size**: 1200x630px (Reddit post preview size)
- **Format**: PNG with transparency support
- **Style**: Vibrant, game-themed, inviting

### Icon/Logo (`default-icon.png`)
- **Recommended Size**: 512x512px (square)
- **Format**: PNG with transparency
- **Style**: Clear, recognizable logo

## Design Concept for Pixel Wars

### Background Image Ideas:

**Option 1: Battle Scene**
- Show a pixelated canvas with three colored zones (red, blue, green)
- Include pixel art elements suggesting a battle
- Add subtle grid lines to show the canvas structure
- Use vibrant team colors: #EF4444 (red), #3B82F6 (blue), #10B981 (green)

**Option 2: Team Showcase**
- Three sections showing each team's color
- Pixel art characters or symbols for each team
- Dynamic, action-oriented composition
- Include "VS" or battle elements

**Option 3: Canvas Grid**
- Large pixelated grid background
- Show pixels being placed in real-time
- Zone boundaries visible
- Team colors prominently displayed

### Icon/Logo Ideas:

**Option 1: Pixel Sword**
- Pixelated sword or battle icon
- Three colors (red, blue, green) incorporated
- Simple, recognizable at small sizes

**Option 2: Canvas Grid**
- 3x3 grid representing the zones
- Each section a different team color
- Clean, geometric design

**Option 3: Team Emblem**
- Three colored pixels arranged in a battle formation
- Pixel art style
- Bold and eye-catching

## Text Overlays

### Splash Screen Header
**Current**: "Pixel Wars"
**Suggestions**:
- "⚔️ PIXEL WARS"
- "PIXEL WARS: Battle for the Canvas"
- "Join the Pixel Battle!"

### Splash Screen Description
**Current**: Generic description
**Suggestions**:
- "Choose your team. Place pixels. Dominate zones. Win the season!"
- "Red vs Blue vs Green - Which team will you join?"
- "Real-time team battles on a shared canvas"
- "Strategic pixel placement meets territory control"

### Post Titles (Dynamic per post)
**Suggestions**:
- "⚔️ Pixel Wars - Season [X] is LIVE!"
- "Join the Battle! Red vs Blue vs Green"
- "Pixel Wars: Can your team dominate the canvas?"
- "New Season Starting - Choose Your Side!"

## Implementation

### Step 1: Create Custom Assets

You'll need to create or commission:
1. **Background image** (1200x630px PNG)
2. **Logo/icon** (512x512px PNG)

### Step 2: Replace Files

```bash
# Replace the background
# Save your new image as: assets/default-splash.png

# Replace the icon
# Save your new logo as: assets/default-icon.png
```

### Step 3: Update Post Configuration

The splash screen text is configured in your post creation. Update these in `src/server/core/post.ts`:

```typescript
// Example customization
const postConfig = {
  title: "⚔️ Pixel Wars - Season 1 Battle Royale",
  splash: {
    header: "⚔️ PIXEL WARS",
    description: "Choose your team. Place pixels. Dominate zones. Win the season!",
    buttonText: "Join the Battle"
  }
};
```

## Design Tools

### Free Tools:
- **Canva** - Easy drag-and-drop design
- **Figma** - Professional design tool (free tier)
- **GIMP** - Free Photoshop alternative
- **Pixlr** - Online photo editor

### Pixel Art Tools:
- **Piskel** - Free online pixel art editor
- **Aseprite** - Professional pixel art tool ($)
- **Lospec** - Pixel art resources and palettes

### AI Tools:
- **DALL-E** - Generate background concepts
- **Midjourney** - Create game-themed artwork
- **Stable Diffusion** - Free AI image generation

## Color Palette for Pixel Wars

Use these exact colors for consistency:

```css
/* Team Colors */
Red Team:    #EF4444
Blue Team:   #3B82F6
Green Team:  #10B981

/* Backgrounds */
Dark:        #1F2937
Light:       #F3F4F6

/* Accents */
Gold:        #F59E0B (for winners)
Gray:        #6B7280 (for UI elements)
```

## Example Prompts for AI Generation

### For Background Image:
```
"Pixel art style battle scene with three teams (red, blue, green) fighting for control of a grid canvas, vibrant colors, game aesthetic, 1200x630px, high quality"

"Three colored pixel armies (red, blue, green) on a grid battlefield, strategic territory control game, modern pixel art style, dynamic composition"

"Pixelated canvas divided into zones with red, blue, and green pixels competing for space, game splash screen, energetic and inviting"
```

### For Logo/Icon:
```
"Simple pixel art logo for a team battle game, three colors (red, blue, green), sword or battle icon, 512x512px, clean design"

"Minimalist pixel art emblem showing three teams competing, geometric design, bold colors, game icon"

"Pixelated 3x3 grid with red, blue, and green sections, simple game logo, recognizable at small sizes"
```

## Best Practices Checklist

### ✅ Do:
- [x] Create engaging, vibrant background
- [x] Use team colors prominently (red, blue, green)
- [x] Make logo recognizable at small sizes
- [x] Include clear call-to-action text
- [x] Test on both desktop and mobile
- [x] Use high-quality images (no pixelation unless intentional)
- [x] Personalize post titles for each season
- [x] Include season number or date when relevant

### ❌ Don't:
- [ ] Keep default template assets
- [ ] Use generic stock photos
- [ ] Make text too small to read
- [ ] Overcomplicate the design
- [ ] Use colors that clash with team colors
- [ ] Forget to test on mobile devices

## Dynamic Splash Screens (Advanced)

For future enhancements, consider:

### Season-Specific Backgrounds
```typescript
// Different background for each season
const seasonBackgrounds = {
  1: 'assets/season-1-splash.png',
  2: 'assets/season-2-splash.png',
  // etc.
};
```

### Difficulty Indicators
```typescript
// Show current competition level
const splashText = {
  header: "⚔️ PIXEL WARS",
  description: `Season ${seasonNumber} - ${difficulty} Competition`,
  badge: difficulty // "Casual", "Competitive", "Intense"
};
```

### Live Stats
```typescript
// Show current season stats
const splashText = {
  header: "⚔️ PIXEL WARS",
  description: `${activePlayers} players battling now!`,
  stats: `Red: ${redScore} | Blue: ${blueScore} | Green: ${greenScore}`
};
```

## Testing Your Splash Screen

1. **Create a test post** in your subreddit
2. **View on desktop** - Check Reddit feed view
3. **View on mobile** - Check mobile app view
4. **Share link** - Check social media preview
5. **Get feedback** - Ask friends for first impressions

## Quick Win: Text-Only Improvements

If you can't create custom graphics immediately, improve the text:

### Current Post Title:
"Pixel Wars Game"

### Better Post Titles:
- "⚔️ Pixel Wars - Join the Battle! Red vs Blue vs Green"
- "🎨 Pixel Wars Season 1 - Choose Your Team and Dominate!"
- "⚡ LIVE NOW: Pixel Wars - Strategic Team Battle Game"

### Current Description:
Generic game description

### Better Descriptions:
- "Three teams. One canvas. Infinite strategy. Which side will you choose? 🔴🔵🟢"
- "Place pixels. Control zones. Win seasons. Join the most strategic battle on Reddit!"
- "Real-time team competition meets pixel art. Every pixel counts. Every zone matters."

## Resources

### Inspiration:
- r/place archives - See what worked
- Other Devvit games - Check their splash screens
- Mobile game app icons - Study what catches attention

### Assets:
- **Pixel Art Palettes**: lospec.com/palette-list
- **Free Icons**: flaticon.com, icons8.com
- **Stock Images**: unsplash.com, pexels.com
- **Pixel Fonts**: dafont.com (search "pixel")

## Next Steps

1. **Decide on design direction** (battle scene, team showcase, or grid)
2. **Create or commission assets** (or use AI generation)
3. **Replace files** in `assets/` directory
4. **Update post text** for better engagement
5. **Test on Reddit** with a new post
6. **Iterate based on feedback**

---

**Remember**: The splash screen is your first impression. Make it count! 🎨⚔️
