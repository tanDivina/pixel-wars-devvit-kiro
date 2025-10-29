# Implementation Plan

- [x] 1. Create season data models and Redis storage structure

  - Define TypeScript interfaces for SeasonMetadata, SeasonSettings, and SeasonHistory
  - Create Redis key constants and helper functions for season data access
  - Implement Redis storage methods with proper error handling
  - _Requirements: 1.1, 1.5, 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 2. Implement core SeasonService class

  - Create SeasonService class with Redis dependency injection
  - Implement getCurrentSeason() method to retrieve active season metadata
  - Implement getTimeRemaining() method to calculate time left in season
  - Implement getSettings() and updateSettings() methods for configuration
  - Add proper error handling and logging
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 8.1, 8.2, 8.3_

- [x] 3. Implement season initialization logic

  - Create initialize() method to set up season system on app start
  - Detect first-time setup vs existing season
  - Create default Season 1 if no season exists
  - Load existing season metadata if present
  - Set default settings (7-day duration, auto-posts enabled)
  - Write unit tests for initialization scenarios
  - _Requirements: 2.8, 8.2, 8.3, 8.4_

- [x] 4. Implement season lifecycle methods

  - Create startNewSeason() method to initialize new season
  - Implement season number increment logic
  - Set start time and calculate end time based on duration
  - Store season metadata in Redis
  - Write unit tests for season creation
  - _Requirements: 2.1, 2.6, 8.1, 8.4_

- [x] 5. Implement game state reset functionality

  - Create resetGameState() method in SeasonService
  - Clear canvas pixels (reset to blank)
  - Reset all team scores to zero
  - Reset zone control data
  - Preserve player team assignments
  - Use Redis pipelining for batch operations
  - Write unit tests for reset logic
  - _Requirements: 2.2, 2.3, 2.4, 2.5, 10.1_

- [x] 6. Implement winner calculation logic

  - Create calculateWinner() method to determine season winner
  - Calculate final team standings (scores, zones, player counts)
  - Identify winning team with highest score
  - Calculate season statistics (total pixels, top player, closest zone)
  - Return SeasonHistory object with all data
  - Write unit tests for winner calculation edge cases
  - _Requirements: 2.7, 6.2, 6.3, 6.4_

- [x] 7. Implement season history storage and retrieval

  - Create saveHistory() method to store completed season data
  - Implement getSeasonHistory() method to retrieve past seasons
  - Maintain season history index in Redis
  - Limit storage to last 10 seasons
  - Handle history retrieval when no seasons exist
  - Write unit tests for history operations
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 10.5_

- [x] 8. Implement season end orchestration

  - Create endSeason() method to coordinate season transition
  - Implement distributed lock to prevent concurrent resets
  - Call calculateWinner() to get final results
  - Call saveHistory() to store season data
  - Call resetGameState() to clear canvas
  - Call startNewSeason() to begin next season
  - Handle errors gracefully with proper logging
  - Write integration tests for full season lifecycle
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 10.3, 10.5_

- [x] 9. Create SchedulerService for Devvit scheduler integration

  - Create SchedulerService class with scheduler dependency
  - Implement scheduleSeasonEnd() to schedule end-of-season job
  - Implement scheduleWarnings() for 24h and 1h warning jobs
  - Implement cancelSeasonJobs() to remove old jobs
  - Add job tracking in Redis
  - Write unit tests for scheduler operations
  - _Requirements: 7.1, 7.2, 7.4, 10.4_

- [x] 10. Implement scheduler job handlers

  - Create handleSeasonEnd() method to process season end trigger
  - Create handleWarning() method for warning post triggers
  - Verify season number matches before executing
  - Call SeasonService.endSeason() from handler
  - Implement retry logic for failed jobs
  - Write unit tests for job handlers
  - _Requirements: 7.2, 7.3, 7.5, 7.6, 10.6_

- [x] 11. Register Devvit scheduler jobs in main.ts

  - Add Devvit.addSchedulerJob() for 'season-end' job
  - Add Devvit.addSchedulerJob() for 'warning-24h' job
  - Add Devvit.addSchedulerJob() for 'warning-1h' job
  - Wire up job handlers to SeasonService methods
  - Test job registration and execution
  - _Requirements: 7.1, 7.2_

- [x] 12. Create RedditPostService for automated posts

  - Create RedditPostService class with Reddit API dependency
  - Implement postSeasonStart() method with template
  - Implement post24HourWarning() method with standings
  - Implement post1HourWarning() method with standings
  - Implement postWinnerAnnouncement() method with full stats
  - Add error handling for Reddit API failures
  - Write unit tests for post generation
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.8, 10.2_

- [x] 13. Create Reddit post templates

  - Design engaging post template for season start
  - Design template for 24h warning with standings table
  - Design template for 1h final warning
  - Design celebratory winner announcement template
  - Include emojis, formatting, and clear sections
  - Test templates with sample data
  - _Requirements: 4.5, 4.6, 4.8_

- [x] 14. Integrate RedditPostService with season lifecycle

  - Call postSeasonStart() when new season begins
  - Schedule warning posts via SchedulerService
  - Call postWinnerAnnouncement() when season ends
  - Handle post failures gracefully (log but continue)
  - Store failed posts for manual retry
  - Write integration tests for post flow
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.7, 10.2_

- [x] 15. Create season API endpoints

  - Create GET /api/season/current endpoint
  - Create GET /api/season/history endpoint
  - Create GET /api/season/settings endpoint (moderator only)
  - Create POST /api/season/settings endpoint (moderator only)
  - Add authentication check for moderator endpoints
  - Return proper JSON responses with error handling
  - Write unit tests for all endpoints
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [x] 16. Create CountdownTimer React component

  - Create CountdownTimer component with endTime prop
  - Implement time formatting logic (days/hours/minutes/seconds)
  - Add conditional styling for urgency (< 24h, < 1h, < 5m)
  - Implement pulsing animation for final minutes
  - Poll server every 10 seconds for time sync
  - Call onSeasonEnd callback when countdown reaches zero
  - Write component tests
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 17. Integrate CountdownTimer into game UI

  - Add CountdownTimer to App.tsx header
  - Fetch current season data on component mount
  - Pass endTime to CountdownTimer component
  - Handle season end event to show winner modal
  - Update UI styling for countdown placement
  - Test countdown display on different screen sizes
  - _Requirements: 3.1, 3.6_

- [x] 18. Create WinnerModal React component

  - Create full-screen modal component
  - Display winning team with color and trophy animation
  - Show final standings for all teams
  - Display season statistics (pixels, duration, top player)
  - Add celebration animations (confetti, glow effects)
  - Implement auto-close after 10 seconds
  - Add manual close button
  - Write component tests
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7_

- [x] 19. Integrate WinnerModal into game flow

  - Show WinnerModal when season ends
  - Fetch season history for ended season
  - Display modal for 10 seconds then auto-close
  - Transition to new season after modal closes
  - Handle case where player joins during winner display
  - Test modal appearance and transitions
  - _Requirements: 6.1, 6.6, 6.7_

- [x] 20. Create SeasonHistory React component

  - Create SeasonHistory component to display past seasons
  - Show list of last 10 completed seasons
  - Display season number, dates, winner, and scores
  - Add expandable details for each season
  - Show "No completed seasons yet" when empty
  - Add current season indicator
  - Write component tests
  - _Requirements: 5.2, 5.3, 5.4, 5.5, 5.6_

- [x] 21. Add Season History tab to Leaderboard

  - Add "Season History" tab to Leaderboard component
  - Integrate SeasonHistory component into tab
  - Fetch season history data from API
  - Handle loading and error states
  - Test tab switching and data display
  - _Requirements: 5.2_

- [x] 22. Update SplashScreen with season information

  - Add current season number to splash screen
  - Display time remaining in current season
  - Update styling to accommodate season info
  - Test splash screen with season data
  - _Requirements: 3.6_

- [x] 23. Implement moderator settings UI

  - Add season settings to devvit.json configuration
  - Create settings form for season duration selection
  - Add toggle for automated Reddit posts
  - Add toggles for 24h and 1h warnings
  - Implement settings save handler
  - Display current settings to moderators
  - Test settings updates and persistence
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 24. Add distributed locking for season transitions

  - Implement acquireLock() and releaseLock() methods
  - Use Redis SET NX EX for lock acquisition
  - Set 60-second TTL on locks
  - Prevent concurrent season end execution
  - Handle lock acquisition failures gracefully
  - Write unit tests for locking mechanism
  - _Requirements: 10.3_

- [x] 25. Implement edge case handling

  - Handle pixel placement during season transition
  - Handle Reddit API unavailability during posts
  - Skip 24h warning for seasons shorter than 1 hour
  - Handle negative time remaining (clock skew)
  - Handle app restart mid-season
  - Write tests for all edge cases
  - _Requirements: 10.1, 10.2, 10.4, 10.6_

- [x] 26. Write comprehensive integration tests

  - Test complete season lifecycle (start to end)
  - Test season transition (season 1 to season 2)
  - Test automated post creation at correct times
  - Test history persistence across seasons
  - Test app restart with active season
  - Test concurrent season end attempts
  - _Requirements: All_

- [x] 27. Perform manual testing with short seasons

  - Set 1-hour season duration for testing
  - Verify countdown displays correctly
  - Verify warning posts appear at correct times
  - Verify season ends and resets properly
  - Verify winner modal appears
  - Verify new season starts automatically
  - Document any issues found
  - _Requirements: All_

- [x] 28. Update documentation
  - Add season system documentation to README
  - Document moderator settings configuration
  - Document API endpoints for season data
  - Add troubleshooting guide for common issues
  - Create migration guide for existing games
  - _Requirements: All_
