# UX Testing Guide - Task 24.3

## Quick Testing Checklist

This guide helps you verify all UX improvements implemented in Task 24.3.

## 1. Tutorial Testing

### Desktop Testing
1. Open the game for the first time (clear localStorage if needed)
2. Verify tutorial appears automatically
3. Check each step:
   - [ ] Step 1: Welcome message with team badge
   - [ ] Step 2: Pixel placement instructions with hover tip
   - [ ] Step 3: Credits system with timer tip
   - [ ] Step 4: Territory control with zone border tip
   - [ ] Step 5: Seasons with scoring formula
   - [ ] Step 6: Leaderboard with real-time updates tip
   - [ ] Step 7: Controls with desktop/mobile split
4. Verify each step has:
   - [ ] Clear title with emoji
   - [ ] Descriptive content
   - [ ] Blue tip box with helpful advice
   - [ ] Progress dots showing current step
5. Test navigation:
   - [ ] "Next" button advances to next step
   - [ ] "Back" button returns to previous step (not on first step)
   - [ ] "Skip" button closes tutorial
   - [ ] "Let's Play!" button on last step
6. Verify buttons are:
   - [ ] Easy to click (48px height)
   - [ ] Have hover effects
   - [ ] Have active states (press feedback)

### Mobile Testing
1. Open on mobile device (iOS or Android)
2. Verify tutorial is readable and scrollable
3. Check button touch targets:
   - [ ] All buttons are easy to tap (48px minimum)
   - [ ] No accidental taps on adjacent buttons
   - [ ] Clear visual feedback on tap
4. Test with one hand:
   - [ ] Can reach all buttons comfortably
   - [ ] Text is readable without zooming

## 2. Error Message Testing

### Credit Exhaustion
1. Place pixels until credits reach 0
2. Try to place another pixel
3. Verify error message:
   - [ ] Shows "⏳ Out of credits! Next pixel in [time]"
   - [ ] Includes time remaining
   - [ ] Appears as red toast notification
   - [ ] Auto-dismisses after 3 seconds

### Invalid Coordinates
1. Try to click outside canvas boundaries (if possible)
2. Verify error message:
   - [ ] Shows "❌ Invalid position. Click within the canvas."
   - [ ] Clear and actionable
   - [ ] Red toast notification

### Network Error Simulation
1. Disconnect internet
2. Try to place a pixel
3. Verify error message:
   - [ ] Shows "🌐 Connection issue. Check your internet and try again."
   - [ ] Helpful guidance
   - [ ] Red toast notification

### Error Screen
1. Force an error (disconnect during load)
2. Verify error screen shows:
   - [ ] ⚠️ emoji
   - [ ] "Oops! Something went wrong" heading
   - [ ] Error details
   - [ ] Helpful explanation
   - [ ] Retry button (48px height)
   - [ ] Retry button works

## 3. Tooltip Testing

### Header Tooltips
Hover over each element and verify tooltip appears:
- [ ] Season indicator: "Season X - Compete for the highest score!"
- [ ] Team badge: "You're on [Team]! Work together..."
- [ ] Credits display: Shows credits, regeneration time, max credits
- [ ] Help button: "Show tutorial and game instructions"

### Control Panel Tooltips
- [ ] Zoom out button: "Zoom out (or use pinch gesture)"
- [ ] Zoom in button: "Zoom in (or use pinch gesture)"
- [ ] Reset button: "Reset view to center (double-tap canvas also works)"
- [ ] Leaderboard button: "View leaderboard and team standings"

### Leaderboard Tooltips
- [ ] Rank display: "Your current rank among all players"
- [ ] Refresh button: "Refresh leaderboard data"

### Tooltip Quality Check
For each tooltip:
- [ ] Appears on hover
- [ ] Text is concise and helpful
- [ ] Cursor changes to help icon (where appropriate)
- [ ] Doesn't block important UI elements

## 4. Touch Target Testing

### Mobile Device Testing (Required)
Test on actual mobile device (not just browser resize):

#### Header
- [ ] Help button: Easy to tap, 44x44px minimum
- [ ] No accidental taps on adjacent elements

#### Control Panel
- [ ] Zoom out button: 40x40px, easy to tap
- [ ] Zoom in button: 40x40px, easy to tap
- [ ] Reset button: 40px height, easy to tap
- [ ] Leaderboard button: 40px height, easy to tap
- [ ] All buttons have clear active states

#### Tutorial
- [ ] Back button: 48px height, easy to tap
- [ ] Skip button: 48px height, easy to tap
- [ ] Next button: 48px height, easy to tap
- [ ] No accidental taps between buttons

#### Leaderboard
- [ ] Close button: 44x44px, easy to tap
- [ ] Tab buttons: 48px height, easy to tap
- [ ] Refresh button: 44px height, easy to tap

### Touch Target Quality Check
For each interactive element:
- [ ] Minimum 44x44px (48px for primary actions)
- [ ] Clear visual feedback on tap
- [ ] No tap highlight artifacts
- [ ] Scale animation on press (0.98 scale)
- [ ] Easy to tap with thumb
- [ ] Adequate spacing from other elements

## 5. Instructions Banner Testing

### With Credits
1. Ensure you have credits available
2. Verify banner shows:
   - [ ] "👆 Click or tap on the canvas to place a pixel for [Team]!"
   - [ ] Shows credit count
   - [ ] Shows "Hover to preview placement" tip
   - [ ] Blue background
   - [ ] Readable on mobile and desktop

### Without Credits
1. Exhaust all credits
2. Verify banner shows:
   - [ ] "⏳ Out of credits! Next pixel in [time]"
   - [ ] Shows regeneration time
   - [ ] Shows strategic planning tip
   - [ ] Orange background
   - [ ] Readable on mobile and desktop

## 6. Empty State Testing

### Player Rankings Empty State
1. Open leaderboard before any pixels are placed
2. Go to Players tab
3. Verify empty state shows:
   - [ ] 🎨 emoji
   - [ ] "No players yet!" heading
   - [ ] Helpful message about placing first pixel
   - [ ] Centered and readable

### Team Standings Empty State
1. Open leaderboard before any pixels are placed
2. Go to Teams tab
3. Verify empty state shows:
   - [ ] 🏆 emoji
   - [ ] "No team data yet!" heading
   - [ ] Helpful message about placing pixels
   - [ ] Centered and readable

## 7. Loading State Testing

### Initial Load
1. Refresh the page
2. Verify loading screen shows:
   - [ ] 🎮 emoji (pulsing animation)
   - [ ] "Loading Pixel Wars..." heading
   - [ ] "Setting up your team and canvas" message
   - [ ] Clean, centered layout
   - [ ] Professional appearance

## 8. Accessibility Testing

### Keyboard Navigation
1. Use Tab key to navigate through all interactive elements
2. Verify:
   - [ ] All buttons are reachable
   - [ ] Focus indicators are visible (2px blue outline)
   - [ ] Tab order is logical
   - [ ] Enter/Space activates buttons
   - [ ] Escape closes modals

### Screen Reader Testing (Optional)
1. Use screen reader (NVDA, JAWS, or VoiceOver)
2. Verify:
   - [ ] All buttons have proper labels
   - [ ] Aria-labels are descriptive
   - [ ] Current state is announced
   - [ ] Error messages are announced

### Color Contrast
1. Check all text against backgrounds
2. Verify:
   - [ ] Body text meets WCAG AA (4.5:1)
   - [ ] Large text meets WCAG AA (3:1)
   - [ ] Interactive elements are distinguishable

## 9. Responsive Design Testing

### Breakpoint Testing
Test at these viewport widths:
- [ ] 320px (small mobile)
- [ ] 375px (iPhone)
- [ ] 768px (tablet)
- [ ] 1024px (desktop)
- [ ] 1920px (large desktop)

### Mobile Portrait (320px - 767px)
- [ ] Tutorial is readable
- [ ] Buttons are tappable
- [ ] Text doesn't overflow
- [ ] Instructions banner fits
- [ ] Leaderboard is modal overlay

### Tablet (768px - 1023px)
- [ ] Layout adapts appropriately
- [ ] Touch targets remain adequate
- [ ] Leaderboard can be sidebar or modal

### Desktop (1024px+)
- [ ] Full layout with all features
- [ ] Hover states work properly
- [ ] Tooltips appear correctly
- [ ] Leaderboard is sidebar

## 10. Cross-Browser Testing

### Required Browsers
- [ ] Chrome (desktop)
- [ ] Firefox (desktop)
- [ ] Safari (desktop)
- [ ] Safari (iOS mobile)
- [ ] Chrome (Android mobile)

### For Each Browser
- [ ] Tutorial displays correctly
- [ ] Error messages appear
- [ ] Tooltips work
- [ ] Touch targets are adequate (mobile)
- [ ] Animations are smooth
- [ ] No console errors

## 11. Performance Testing

### Animation Performance
- [ ] Tutorial animations are smooth
- [ ] Button press animations don't lag
- [ ] Toast notifications animate smoothly
- [ ] Loading screen animation is smooth
- [ ] No janky scrolling

### Touch Response
- [ ] Buttons respond immediately to tap
- [ ] No delay in visual feedback
- [ ] Smooth transitions
- [ ] No accidental double-taps

## 12. Edge Cases

### Long Text
- [ ] Long usernames don't break layout
- [ ] Long team names are handled
- [ ] Error messages wrap properly

### Rapid Interactions
- [ ] Multiple rapid taps don't break UI
- [ ] Toast notifications stack properly
- [ ] Tutorial navigation handles rapid clicks

### Orientation Changes (Mobile)
- [ ] Layout adapts to portrait/landscape
- [ ] No content is cut off
- [ ] Touch targets remain adequate

## Testing Sign-Off

### Tester Information
- Name: _______________
- Date: _______________
- Device: _______________
- Browser: _______________

### Overall Assessment
- [ ] All critical issues resolved
- [ ] All tooltips working
- [ ] All touch targets adequate
- [ ] All error messages clear
- [ ] Tutorial is helpful
- [ ] Ready for production

### Notes
_______________________________________
_______________________________________
_______________________________________

## Quick Test Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Type check
npm run check

# Clear localStorage (for tutorial testing)
# In browser console:
localStorage.clear()
location.reload()
```

## Common Issues and Solutions

### Tutorial doesn't appear
- Clear localStorage: `localStorage.clear()`
- Refresh the page

### Tooltips don't show
- Ensure you're hovering, not clicking
- Check browser console for errors

### Touch targets feel small
- Test on actual device, not browser resize
- Verify minimum 44x44px in DevTools

### Error messages don't appear
- Check browser console for errors
- Verify toast container is rendering
- Check z-index stacking

## Success Criteria

All UX improvements are considered successful when:
- ✅ Tutorial is clear and helpful
- ✅ Error messages are user-friendly
- ✅ Tooltips provide helpful context
- ✅ All touch targets meet 44x44px minimum
- ✅ Responsive design works on all devices
- ✅ Accessibility standards are met
- ✅ No console errors
- ✅ Smooth performance on mobile
