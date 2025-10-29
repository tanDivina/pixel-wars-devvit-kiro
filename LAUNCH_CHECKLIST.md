# 🚀 Launch Checklist

## Pre-Launch Testing

### 1. Clean Build
```bash
# Stop dev server (Ctrl+C)
rm -rf dist
npm run build
npm run dev
```

### 2. Visual Polish Check
- [ ] Splash screen shows gradient title
- [ ] Sword icon (⚔️) bounces
- [ ] Team badge glows in header
- [ ] Favicon shows in browser tab
- [ ] Success message shows team name

### 3. Core Gameplay
- [ ] Can place pixels
- [ ] Credits decrease
- [ ] Credits regenerate
- [ ] Countdown timer works
- [ ] Real-time updates work

### 4. UI Components
- [ ] Leaderboard opens
- [ ] Leaderboard shows data
- [ ] Toast notifications work
- [ ] Toast close button works
- [ ] Zoom controls work
- [ ] Tutorial shows (first time)

### 5. Mobile Test
- [ ] Open on mobile device
- [ ] Touch controls work
- [ ] Layout is responsive
- [ ] All buttons are tappable
- [ ] No horizontal scroll

### 6. Error Handling
- [ ] Try placing pixel with 0 credits
- [ ] Check error messages are clear
- [ ] Verify retry works

---

## Launch Steps

### Step 1: Final Build
```bash
npm run build
```

**Check for:**
- ✅ No build errors
- ✅ Client builds successfully
- ✅ Server builds successfully

### Step 2: Deploy
```bash
npm run launch
```

**What happens:**
1. Uploads to Reddit
2. Creates new version
3. Submits for review (if needed)

### Step 3: Wait for Approval
- Check email for confirmation
- Review typically takes 1-2 days
- For subreddits with >200 members

### Step 4: Share
- Post in your subreddit
- Share with community
- Announce on Reddit

---

## Post-Launch

### Monitor
- [ ] Check for errors in logs
- [ ] Watch player feedback
- [ ] Monitor performance
- [ ] Track engagement

### Respond
- [ ] Answer questions
- [ ] Fix critical bugs
- [ ] Thank players
- [ ] Gather feedback

### Iterate
- [ ] Note feature requests
- [ ] Plan improvements
- [ ] Update based on feedback

---

## Hackathon Submission

### Required
- [ ] Working game deployed
- [ ] README with description
- [ ] Clear instructions
- [ ] Demo video (optional but recommended)

### Recommended
- [ ] Screenshots
- [ ] Feature highlights
- [ ] Technical details
- [ ] Innovation points

### Submission Text Template

```
# Pixel Wars - Team Territory Battle

A massively multiplayer territory control game where teams compete to dominate a shared canvas.

## What It Does
- 4 teams compete for control of a 100x100 pixel canvas
- Strategic zone-based territory control
- Credit system prevents spam (2-minute cooldown)
- Real-time updates show other players' moves
- Leaderboards track top players and teams

## Innovation
- Zone control mechanics (not just pixel art)
- Automatic team balancing
- Performance-optimized rendering
- Mobile-first responsive design
- Comprehensive error handling

## Technical Highlights
- TypeScript with strict mode
- React + Express + Redis
- Chunk-based canvas rendering
- Rate limiting & validation
- Real-time polling system

## Try It
[Link to your Reddit post]

Built with Kiro's spec-driven development workflow!
```

---

## Emergency Fixes

### If Build Fails
```bash
rm -rf node_modules dist
npm install
npm run build
```

### If Dev Server Won't Start
```bash
# Kill any running processes
pkill -f "npm run dev"
# Clean and restart
rm -rf dist
npm run dev
```

### If Devvit Errors
```bash
# Check Devvit version
devvit --version
# Update if needed
npm install -g devvit
```

---

## Success Criteria

### Minimum (Must Have)
- ✅ Game loads without errors
- ✅ Players can place pixels
- ✅ Credits regenerate
- ✅ Leaderboard works
- ✅ Mobile responsive

### Good (Should Have)
- ✅ Smooth animations
- ✅ Clear feedback
- ✅ Tutorial works
- ✅ No console errors
- ✅ Fast load time

### Excellent (Nice to Have)
- ✅ Visual polish
- ✅ Team badges glow
- ✅ Engaging messages
- ✅ Professional feel
- ✅ Wow factor

---

## 🎉 You're Ready!

Your game has:
✅ All core features  
✅ Visual polish  
✅ Mobile support  
✅ Error handling  
✅ Professional quality  

**Time to launch and win!** 🚀🏆
