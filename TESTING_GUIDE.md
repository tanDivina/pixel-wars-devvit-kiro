# 🎮 Pixel Wars Testing Guide

## 🚀 Starting the Development Server

### Step 1: Start Dev Mode
```bash
npm run dev
```

This command will:
1. Build the client (React app)
2. Build the server (Express API)
3. Start Devvit playtest mode
4. Create/use test subreddit (r/orik_app_dev)

### Step 2: Open the Playtest URL
Look for output like:
```
Uploaded to https://www.reddit.com/r/orik_app_dev?playtest=orik-app
```

Open that URL in your browser.

---

## ✅ Testing Checklist

### 🎨 Splash Screen
- [ ] Splash screen loads with "PIXEL WARS" title
- [ ] Shows team standings with colors
- [ ] Shows active player count
- [ ] Shows total pixels count
- [ ] "⚔️ Join the Battle" button is visible
- [ ] Button click opens the game

### 🎯 Game Initialization
- [ ] Game loads without errors
- [ ] You're assigned to a team (Red/Blue/Green/Yellow)
- [ ] Your username appears in header
- [ ] Team badge shows in header
- [ ] Starting credits show (should be 5)
- [ ] Canvas renders with 100x100 grid

### 📚 Tutorial (First Time)
- [ ] Tutorial overlay appears automatically
- [ ] Can navigate through 6 steps
- [ ] "Back" button works
- [ ] "Skip" button closes tutorial
- [ ] "Let's Play!" button on final step
- [ ] Can reopen via "❓ Help" button

### 🖱️ Canvas Interaction
- [ ] Click on canvas places a pixel
- [ ] Pixel appears in your team color
- [ ] Credit count decreases by 1
- [ ] Success toast appears
- [ ] Drag to pan the canvas
- [ ] Canvas moves smoothly

### ⚡ Credit System
- [ ] Credits start at 5
- [ ] Placing pixel reduces credits
- [ ] Countdown timer appears when < 10 credits
- [ ] Timer counts down (e.g., "1:59", "1:58")
- [ ] Credits regenerate after 2 minutes
- [ ] Can't place pixel with 0 credits
- [ ] Error toast shows when no credits

### 🔍 Zoom Controls
- [ ] "+" button zooms in
- [ ] "−" button zooms out
- [ ] Zoom percentage updates (e.g., "120%")
- [ ] "Reset" button centers view
- [ ] Zoom range: 50% to 500%

### 🏆 Leaderboard
- [ ] Click "🏆 Leaderboard" button
- [ ] Modal opens with backdrop
- [ ] "Players" tab shows top 10
- [ ] Your username is highlighted
- [ ] Team colors show for each player
- [ ] Medal icons for top 3 (🥇🥈🥉)
- [ ] "Teams" tab shows all 4 teams
- [ ] Progress bars show team strength
- [ ] Your team is highlighted
- [ ] "Refresh" button updates data
- [ ] Click backdrop closes modal
- [ ] "×" button closes modal

### 🗺️ Zone Control
- [ ] Zones show on canvas (10x10 grids)
- [ ] Controlled zones have colored borders
- [ ] Zone ownership updates in real-time
- [ ] Zone colors match team colors

### 🔄 Real-Time Updates
- [ ] Canvas polls for updates every second
- [ ] Other players' pixels appear
- [ ] Zone control updates automatically
- [ ] Leaderboard refreshes every 10 seconds

### 🔔 Toast Notifications
- [ ] Success toast on pixel placement
- [ ] Error toast when no credits
- [ ] Toasts auto-dismiss after 3 seconds
- [ ] Can manually close toasts
- [ ] Multiple toasts stack properly

### 📱 Mobile Responsive
- [ ] Open on mobile device or resize browser
- [ ] Header adapts to small screen
- [ ] Control panel is usable
- [ ] Leaderboard modal fits screen
- [ ] Touch controls work (tap, drag, pinch)
- [ ] Instructions change for mobile

### ⚠️ Error Handling
- [ ] Network errors show user-friendly messages
- [ ] Failed pixel placement shows error
- [ ] Can retry after errors
- [ ] Loading states show properly

---

## 🐛 Common Issues & Solutions

### Issue: "Failed to initialize game"
**Solution**: Make sure Redis is running and server started properly

### Issue: Canvas not rendering
**Solution**: Check browser console for errors, try refreshing

### Issue: Pixels not appearing
**Solution**: Check network tab, verify `/api/place-pixel` returns success

### Issue: Leaderboard empty
**Solution**: Place some pixels first, then check leaderboard

### Issue: Tutorial not showing
**Solution**: Clear localStorage and refresh (it only shows once)

---

## 🎯 Key Features to Demonstrate

### 1. Team Collaboration
- Place pixels to claim territory
- Work with your team to control zones
- See your team's progress in leaderboard

### 2. Strategic Gameplay
- Limited credits force strategic decisions
- Zone control requires majority pixels
- Coordinate with team via Reddit comments

### 3. Real-Time Competition
- See other players' moves instantly
- Watch zones change hands
- Compete for top player rank

### 4. Polished UX
- Smooth animations
- Clear feedback
- Intuitive controls
- Mobile-friendly

---

## 📊 Performance Testing

### Test with Multiple Users
1. Open game in multiple browser tabs/windows
2. Use different Reddit accounts (or incognito)
3. Place pixels simultaneously
4. Verify all updates appear correctly

### Test Canvas Performance
1. Zoom in/out rapidly
2. Pan around quickly
3. Place many pixels
4. Check for lag or stuttering

### Test Mobile Performance
1. Open on actual mobile device
2. Test touch gestures
3. Check rendering speed
4. Verify battery usage is reasonable

---

## 🎉 Success Criteria

Your game is working if:
- ✅ Players can join and place pixels
- ✅ Credits regenerate properly
- ✅ Leaderboard shows rankings
- ✅ Zone control updates correctly
- ✅ Real-time updates work
- ✅ Mobile experience is smooth
- ✅ No critical errors in console

---

## 📝 Notes for Testing

### Browser Console
Keep browser console open (F12) to see:
- API calls and responses
- Any JavaScript errors
- Network requests
- Performance metrics

### Network Tab
Monitor network tab to verify:
- `/api/init` succeeds
- `/api/place-pixel` returns success
- `/api/canvas-updates` polls every second
- `/api/leaderboard` refreshes every 10 seconds

### Redis Data
You can inspect Redis data using:
```bash
# If you have redis-cli installed
redis-cli
> KEYS *
> HGETALL config:post_id
> HGETALL canvas:post_id
```

---

## 🚀 Ready to Deploy?

Once testing is complete and everything works:

1. **Build for production**:
   ```bash
   npm run build
   ```

2. **Deploy to Reddit**:
   ```bash
   npm run launch
   ```

3. **Wait for review** (if subreddit has >200 members)

4. **Share with community!**

---

**Happy Testing! 🎮**
