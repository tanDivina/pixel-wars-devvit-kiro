# Implementation Plan

- [x] 1. Set up shared types and game configuration

  - Create TypeScript interfaces for all game data models (Team, PixelData, ZoneData, PlayerRanking, TeamRanking, GameConfig)
  - Define API request/response types for all endpoints
  - Create constants file for default game configuration
  - _Requirements: All requirements depend on these foundational types_

- [x] 2. Implement Redis data layer and utilities

  - [x] 2.1 Create Redis key pattern utilities
    - Write helper functions to generate consistent Redis keys for canvas, users, leaderboards, zones
    - Implement key pattern validation
    - Write unit tests for key generation
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6_
  - [x] 2.2 Implement canvas state management
    - Create functions to get/set pixel data in Redis hash
    - Implement canvas updates log using sorted sets
    - Write functions to query canvas changes by timestamp
    - Create unit tests for canvas operations
    - _Requirements: 1.5, 1.6, 4.1, 4.2, 4.3, 4.4_
  - [x] 2.3 Implement user credit system
    - Create functions to get/set user pixel credits
    - Implement cooldown timer logic with timestamp storage
    - Write credit regeneration calculation functions
    - Create unit tests for credit operations
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_
  - [x] 2.4 Implement leaderboard data structures
    - Create functions to update player scores in sorted sets
    - Implement team ranking calculations
    - Write functions to fetch top N players and teams
    - Create unit tests for leaderboard operations
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7_

- [x] 3. Implement team assignment logic

  - Create team assignment algorithm based on user activity
  - Implement team balancing for new users
  - Write functions to store and retrieve team assignments
  - Create unit tests for team assignment
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

- [x] 4. Implement zone control calculations

  - Create function to divide canvas into zones
  - Implement zone ownership calculation by pixel majority
  - Write efficient zone control update logic
  - Create Lua script for atomic zone calculations
  - Write unit tests for zone control
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

- [x] 5. Implement server API endpoints

  - [x] 5.1 Create /api/init endpoint
    - Implement user initialization logic
    - Fetch or assign team for user
    - Get user credits and cooldown state
    - Fetch current canvas state
    - Calculate zone control data
    - Return complete game state
    - Write integration tests
    - _Requirements: 1.1, 2.1, 2.2, 2.3, 2.4, 3.1, 3.4, 4.4_
  - [x] 5.2 Create /api/place-pixel endpoint
    - Implement coordinate validation
    - Check user has available credits
    - Deduct credit and update cooldown
    - Update canvas state in Redis
    - Update user statistics
    - Trigger zone control recalculation
    - Implement error handling for all edge cases
    - Write integration tests
    - _Requirements: 1.2, 1.3, 1.4, 1.5, 3.2, 3.3, 10.1, 10.2, 10.5_
  - [x] 5.3 Create /api/canvas-updates endpoint
    - Implement timestamp-based delta queries
    - Fetch changed pixels from sorted set
    - Calculate zone updates if needed
    - Optimize response size
    - Write integration tests
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.6, 11.3_
  - [x] 5.4 Create /api/leaderboard endpoint
    - Fetch top 10 players from sorted set
    - Calculate team rankings by territory
    - Get current user's rank
    - Format and return leaderboard data
    - Write integration tests
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7_
  - [x] 5.5 Create /api/splash-data endpoint
    - Generate miniature canvas preview image
    - Calculate team statistics
    - Count active players
    - Return splash screen data
    - Write integration tests
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [x] 6. Implement rate limiting and security

  - Create rate limiter middleware using Redis
  - Implement request validation for all endpoints
  - Add input sanitization
  - Write security tests
  - _Requirements: 10.5, 11.4_

- [x] 7. Create client-side hooks

  - [x] 7.1 Implement useGameState hook
    - Create state management for game data
    - Implement initialization logic (fetch /api/init)
    - Add polling mechanism for canvas updates
    - Implement placePixel function
    - Handle loading and error states
    - Write unit tests
    - _Requirements: 1.1, 1.2, 1.5, 1.6, 4.1, 4.5, 4.6_
  - [x] 7.2 Implement useLeaderboard hook
    - Create state for player and team rankings
    - Implement periodic leaderboard fetching
    - Add refresh functionality
    - Write unit tests
    - _Requirements: 5.1, 5.2, 5.3_
  - [x] 7.3 Implement usePixelCredits hook
    - Create countdown timer logic
    - Calculate time remaining until next credit
    - Update UI every second
    - Write unit tests
    - _Requirements: 3.4, 3.5_

- [ ] 8. Build Canvas component

  - [x] 8.1 Create basic canvas rendering
    - Set up HTML5 Canvas element
    - Implement pixel grid rendering
    - Add coordinate system
    - Write rendering tests
    - _Requirements: 1.1, 1.7_
  - [x] 8.2 Implement pan and zoom controls
    - Add mouse drag for panning
    - Implement mouse wheel zoom
    - Add touch gesture support (pinch-to-zoom, drag)
    - Implement smooth animations
    - Write interaction tests
    - _Requirements: 1.7, 1.8, 8.6_
  - [x] 8.3 Implement pixel click handling
    - Add click/tap event listeners
    - Convert screen coordinates to canvas coordinates
    - Show pixel preview on hover
    - Trigger placePixel callback
    - Write interaction tests
    - _Requirements: 1.2, 1.3, 1.4_
  - [x] 8.4 Optimize canvas rendering
    - Implement viewport culling
    - Add canvas chunking for large grids
    - Use OffscreenCanvas for background rendering
    - Batch pixel updates
    - Test performance with large canvas
    - _Requirements: 11.1, 11.2, 11.5_
  - [x] 8.5 Add zone visualization
    - Render zone boundaries
    - Display zone control indicators
    - Add visual highlights for controlled zones
    - Implement zone update animations
    - _Requirements: 6.3, 6.4, 6.5_

- [x] 9. Build Header component

  - Header integrated into App.tsx with all core features
  - Display username and team information
  - Show pixel credits with icon
  - Add countdown timer display
  - Help button for tutorial access
  - Responsive design for mobile
  - _Requirements: 2.4, 3.4, 3.5, 9.1_

- [x] 10. Build ControlPanel component

  - Create bottom panel layout
  - Add zoom in/out buttons with current zoom display
  - Implement reset view button
  - Display mini team stats (desktop only)
  - Add leaderboard toggle button
  - Make responsive for mobile
  - _Requirements: 1.7, 8.3, 8.4_

- [x] 11. Build Leaderboard component

  - [x] 11.1 Create leaderboard modal/panel
    - Design responsive layout (modal on mobile, sidebar on desktop)
    - Implement open/close animations with backdrop
    - Add tab navigation (Players/Teams)
    - Refresh button for manual updates
    - _Requirements: 5.1, 5.2, 8.3, 8.4, 8.5_
  - [x] 11.2 Implement player rankings tab
    - Display top 10 players with ranks
    - Show pixels placed for each player
    - Highlight current user with special styling
    - Add team color indicators
    - Medal icons for top 3 players
    - Show current user even if outside top 10
    - _Requirements: 5.1, 5.3, 5.7_
  - [x] 11.3 Implement team standings tab
    - Display team rankings with medals
    - Show zones controlled and total pixels
    - Add visual team color badges with animations
    - Progress bars showing relative team strength
    - Percentage calculations for zones and pixels
    - Highlight user's team
    - _Requirements: 5.2, 5.6, 6.5_
  - [x] 11.4 Implement personal stats section
    - Display user's rank in footer
    - User rank shown in both tabs
    - Current user highlighted in rankings
    - _Requirements: 5.3, 5.7_

- [x] 12. Build Tutorial component

  - [x] 12.1 Create tutorial overlay system
    - Design modal overlay with steps
    - Implement step navigation (next/previous)
    - Add skip and complete buttons
    - Store completion state in localStorage
    - Write component tests
    - _Requirements: 12.1, 12.2, 12.3_
  - [x] 12.2 Create tutorial content
    - Write welcome message with team assignment
    - Explain pixel placement mechanics
    - Describe cooldown system
    - Explain territory control objectives
    - Introduce leaderboard and competition
    - Add visual aids and examples
    - _Requirements: 12.1, 12.2, 12.4, 12.5, 12.6_

- [x] 13. Build SplashScreen component

  - [x] 13.1 Create splash screen layout
    - Design engaging visual layout
    - Add miniature canvas preview
    - Create prominent "Join Battle" button
    - Display team standings
    - Show active player count
    - Make responsive for mobile and desktop
    - Write component tests
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_
  - [x] 13.2 Add splash screen animations
    - Implement attention-grabbing animations
    - Add team color pulsing effects
    - Create smooth transitions
    - Optimize for performance
    - _Requirements: 7.4_

- [x] 14. Build main GameUI component

  - Integrate all components (Header, Canvas, ControlPanel, Leaderboard, Tutorial)
  - Implement responsive layout with breakpoints
  - Add mobile-first design patterns
  - Handle modal/overlay management (Tutorial, Leaderboard)
  - Coordinate global state via hooks
  - Canvas controls exposed via ref
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7_

- [x] 15. Implement error handling and user feedback

  - [x] 15.1 Create error notification system
    - Build toast notification component with multiple types
    - Implement error message display
    - Auto-dismiss after 3 seconds
    - Toast container for multiple notifications
    - useToast hook for easy integration
    - _Requirements: 15.1, 15.2, 15.3, 15.6_
  - [x] 15.2 Add success feedback
    - Toast notifications for successful pixel placement
    - Error toasts for failed actions
    - Info/warning toast types available
    - _Requirements: 15.4, 9.2_
  - [x] 15.3 Implement graceful error recovery
    - Error states in useGameState hook
    - Clear error functionality
    - User-friendly error messages
    - Retry button on critical errors
    - _Requirements: 4.5, 15.1, 15.6, 15.7_

- [ ] 16. Implement engagement features

  - Add subscribe button with Reddit integration
  - Create achievement notification system
  - Implement milestone tracking
  - Add shareable moment generation
  - Create "what's new" summary for returning users
  - Write feature tests
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6_

- [ ] 17. Implement community integration

  - Add link to post comment section
  - Create comment suggestion system for milestones
  - Implement team information display with subreddit links
  - Add engagement metric tracking
  - Write integration tests
  - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5, 14.6_

- [x] 18. Update app installation and post creation

  - /internal/on-app-install endpoint creates post and initializes config
  - /internal/menu/post-create allows moderators to create new game posts
  - Default game configuration initialized via ConfigService
  - Post creation with Pixel Wars branding and splash screen
  - Devvit.json configured with proper triggers and menu items
  - _Requirements: 2.6, 10.1_

- [ ] 19. Create custom splash screen assets

  - Design custom splash screen graphics
  - Create team color badges and icons
  - Generate default canvas preview
  - Optimize images for web
  - Update assets directory
  - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [ ] 20. Implement mobile optimizations

  - Add touch event optimizations
  - Implement momentum scrolling
  - Optimize canvas resolution for mobile
  - Add viewport meta tags
  - Test on iOS and Android devices
  - _Requirements: 8.1, 8.6, 8.7, 11.1_

- [ ] 21. Add performance monitoring

  - Implement client-side performance tracking
  - Add server-side response time logging
  - Create error tracking
  - Monitor memory usage
  - Set up analytics for engagement metrics
  - _Requirements: 11.1, 11.4, 11.5, 14.6_

- [ ] 22. Write comprehensive tests

  - [ ] 22.1 Write unit tests for all utilities
    - Test Redis key generation
    - Test coordinate validation
    - Test team assignment logic
    - Test zone control calculations
    - _Requirements: All requirements_
  - [ ] 22.2 Write integration tests for API endpoints
    - Test complete user flow (init → place pixel → poll)
    - Test concurrent pixel placements
    - Test credit regeneration
    - Test leaderboard updates
    - _Requirements: All requirements_
  - [ ] 22.3 Write component tests
    - Test Canvas interactions
    - Test UI component rendering
    - Test responsive behavior
    - Test error states
    - _Requirements: All requirements_

- [ ] 23. Perform cross-platform testing

  - Test on iOS Safari (mobile)
  - Test on Android Chrome (mobile)
  - Test on desktop Chrome, Firefox, Safari
  - Test different screen sizes and orientations
  - Fix any platform-specific issues
  - _Requirements: 7.6, 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7_

- [ ] 24. Optimize and polish

  - [ ] 24.1 Performance optimization pass
    - Profile and optimize canvas rendering
    - Optimize Redis queries
    - Reduce bundle size
    - Implement code splitting
    - Test with 100+ concurrent users
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6_
  - [ ] 24.2 Visual polish pass
    - Refine animations and transitions
    - Improve color scheme and contrast
    - Add loading states
    - Enhance mobile UI
    - Test accessibility
    - _Requirements: 7.4, 8.3, 8.4, 8.5, 12.4, 12.5_
  - [x] 24.3 UX polish pass
    - Improve tutorial clarity
    - Enhance error messages
    - Add helpful tooltips
    - Optimize touch targets
    - Test with real users
    - _Requirements: 12.1, 12.2, 12.4, 12.5, 12.6, 15.1, 15.2_

- [ ] 25. Final integration and deployment
  - Build production bundles
  - Test deployment process
  - Verify all features work in production
  - Create deployment documentation
  - Deploy to Reddit for review
  - _Requirements: All requirements_
