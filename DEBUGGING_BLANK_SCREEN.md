# 🔍 Debugging Blank Screen

## Steps to Debug

### 1. Open Browser Console
- Press `F12` (or right-click → Inspect)
- Click "Console" tab
- Look for red error messages

### 2. Check Network Tab
- Click "Network" tab in DevTools
- Refresh the page
- Look for failed requests (red)
- Check if `/api/init` succeeds

### 3. Common Issues

#### Issue: `/api/init` fails
**Symptoms**: Network error, 500 status
**Solution**: Check server logs, restart dev server

#### Issue: JavaScript error
**Symptoms**: Red error in console
**Solution**: Share the error message

#### Issue: Component not rendering
**Symptoms**: No errors, just blank
**Solution**: Check React DevTools

### 4. Quick Fixes

#### Try 1: Hard Refresh
```
Ctrl+Shift+R (Windows/Linux)
Cmd+Shift+R (Mac)
```

#### Try 2: Clear Cache
```
1. Open DevTools (F12)
2. Right-click refresh button
3. Click "Empty Cache and Hard Reload"
```

#### Try 3: Restart Dev Server
```bash
# Stop server (Ctrl+C)
rm -rf dist
npm run build
npm run dev
```

### 5. What to Check

- [ ] Browser console shows no errors
- [ ] Network tab shows `/api/init` succeeds (200 status)
- [ ] React DevTools shows App component
- [ ] No CORS errors
- [ ] Server is running

### 6. Share This Info

If still broken, share:
1. **Console errors** (screenshot or copy text)
2. **Network tab** (any failed requests?)
3. **What you see** (completely blank? loading spinner?)

---

## Current State

### What Should Happen
1. Splash screen loads
2. Shows team standings
3. Click "Join the Battle"
4. Game appears with canvas

### If Blank Screen
- Check console for errors
- Check if `/api/init` succeeded
- Try hard refresh
- Restart dev server

---

**Need help?** Share the console errors!
