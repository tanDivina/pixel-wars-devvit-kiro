# 🚀 Pixel Wars - Quick Start Guide

## ⚡ Start Testing in 3 Steps

### 1️⃣ Start Development Server
```bash
npm run dev
```

### 2️⃣ Open the Playtest URL
Look for this line in the output:
```
Uploaded to https://www.reddit.com/r/orik_app_dev?playtest=orik-app
```
Click or copy that URL into your browser.

### 3️⃣ Play the Game!
- Click "⚔️ Join the Battle" on the splash screen
- Follow the tutorial (or skip it)
- Start placing pixels!

---

## 🎮 What to Test

### Must Test
- ✅ Place pixels on the canvas
- ✅ Watch credits regenerate
- ✅ Open the leaderboard
- ✅ Use zoom controls (+/-)
- ✅ Try on mobile (or resize browser)

### Nice to Test
- ✅ Tutorial walkthrough
- ✅ Toast notifications
- ✅ Zone control visualization
- ✅ Real-time updates (open in 2 tabs)

---

## 🐛 If Something Breaks

### Check Browser Console
Press F12 and look for errors in the Console tab.

### Check Network Tab
Make sure these API calls succeed:
- `/api/init` - Game initialization
- `/api/place-pixel` - Pixel placement
- `/api/canvas-updates` - Real-time updates
- `/api/leaderboard` - Rankings

### Common Fixes
- **Game won't load**: Refresh the page
- **Pixels won't place**: Check you have credits
- **Leaderboard empty**: Place some pixels first
- **Tutorial won't show**: Clear localStorage and refresh

---

## 📱 Mobile Testing

### On Your Phone
1. Open the playtest URL on your mobile device
2. Test touch controls (tap, drag, pinch-to-zoom)
3. Check that everything fits on screen

### Or Resize Browser
1. Open Chrome DevTools (F12)
2. Click the device toolbar icon (Ctrl+Shift+M)
3. Select a mobile device (iPhone, Pixel, etc.)
4. Test the responsive layout

---

## ✅ Success Checklist

Your game is working if you can:
- [x] See the splash screen
- [x] Join the game and get assigned a team
- [x] Place pixels on the canvas
- [x] See your credits decrease and regenerate
- [x] Open and use the leaderboard
- [x] Zoom and pan the canvas
- [x] See toast notifications

---

## 🎉 Ready to Deploy?

Once everything works:

```bash
# Build for production
npm run build

# Deploy to Reddit
npm run launch
```

---

## 📚 More Info

- **Full Testing Guide**: See `TESTING_GUIDE.md`
- **UI Features**: See `UI_COMPLETION_SUMMARY.md`
- **Game Status**: See `PIXEL_WARS_STATUS.md`
- **README**: See `README.md` for game overview

---

**Have fun testing! 🎮**
