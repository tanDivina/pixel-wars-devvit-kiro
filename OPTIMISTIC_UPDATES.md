# ⚡ Optimistic Updates - Instant Pixel Placement

## Issue
Pixels appeared with a delay (up to 1 second) after clicking because they had to wait for:
1. Server response
2. Polling to fetch updates

## Solution: Optimistic Updates

Add the pixel to the canvas immediately when clicked, then confirm with server.

### How It Works

#### 1. Immediate Update
```typescript
// Add pixel to canvas right away
const optimisticPixel = {
  x, y,
  teamId: state.team.id,
  timestamp: Date.now(),
};
setState(prev => ({
  ...prev,
  canvas: [...prev.canvas, optimisticPixel]
}));
```

#### 2. Server Confirmation
```typescript
// Send to server
const response = await fetch('/api/place-pixel', { ... });
```

#### 3. Handle Success
```typescript
if (success) {
  // Update credits
  setState(prev => ({
    ...prev,
    pixelCredits: data.pixelCredits,
    nextCreditTime: data.nextCreditTime,
  }));
}
```

#### 4. Handle Failure
```typescript
if (failed) {
  // Remove the optimistic pixel
  setState(prev => ({
    ...prev,
    canvas: prev.canvas.filter(p => !(p.x === x && p.y === y))
  }));
}
```

## Benefits

### Before
1. Click pixel
2. Wait for server (~100-300ms)
3. Wait for polling (~0-1000ms)
4. **Total delay: 100-1300ms**

### After
1. Click pixel
2. **Pixel appears instantly (0ms)**
3. Server confirms in background
4. If fails, pixel is removed

## User Experience

### Success Case (99% of the time)
- ✅ Click → Pixel appears instantly
- ✅ Feels responsive and snappy
- ✅ No perceived delay

### Failure Case (rare)
- ✅ Click → Pixel appears
- ❌ Server rejects (no credits, error)
- ✅ Pixel disappears
- ✅ Error toast shows reason

## Technical Details

### Optimistic Pixel
```typescript
{
  x: number,
  y: number,
  teamId: string,
  timestamp: number (current time)
}
```

### Canvas Update
- Uses Map for efficient pixel lookup
- Replaces existing pixel at same coordinates
- Maintains pixel order

### Rollback on Failure
- Removes optimistic pixel from canvas
- Shows error message
- User can try again

## Testing

Try these scenarios:
- [ ] Click pixel → appears instantly
- [ ] Click multiple pixels quickly → all appear
- [ ] Try placing with 0 credits → pixel appears then disappears with error
- [ ] Network delay → pixel still appears instantly

---

**Result**: ⚡ Instant, responsive pixel placement!
