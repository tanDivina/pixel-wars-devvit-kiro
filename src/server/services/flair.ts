/**
 * Flair Service
 * 
 * Manages user flair to show team membership in the subreddit.
 */

import type { RedditClient } from '@devvit/web/server';

export class FlairService {
  /**
   * Set user flair based on team
   * @param reddit - Reddit API client
   * @param subredditName - Name of the subreddit
   * @param username - Username to set flair for
   * @param teamName - Team name
   * @param teamColor - Team color (hex)
   */
  static async setTeamFlair(
    reddit: RedditClient,
    subredditName: string,
    username: string,
    teamName: string,
    teamColor: string
  ): Promise<void> {
    try {
      // Map team colors to Reddit flair CSS classes
      const flairClass = FlairService.getFlairClass(teamColor);
      
      await reddit.setUserFlair({
        subredditName,
        username,
        text: `${FlairService.getTeamEmoji(teamName)} ${teamName}`,
        cssClass: flairClass,
      });
      
      console.log(`✅ Set flair for ${username}: ${teamName}`);
    } catch (error) {
      // Don't throw - flair is a nice-to-have feature
      console.warn(`Failed to set flair for ${username}:`, error);
    }
  }

  /**
   * Get emoji for team
   */
  private static getTeamEmoji(teamName: string): string {
    const emojiMap: Record<string, string> = {
      'Red Team': '🔴',
      'Blue Team': '🔵',
      'Green Team': '🟢',
    };
    return emojiMap[teamName] || '⚪';
  }

  /**
   * Map team color to flair CSS class
   */
  private static getFlairClass(teamColor: string): string {
    // Reddit has predefined flair colors
    const colorMap: Record<string, string> = {
      '#EF4444': 'red',      // Red Team
      '#3B82F6': 'blue',     // Blue Team
      '#10B981': 'green',    // Green Team
    };
    return colorMap[teamColor] || 'default';
  }

  /**
   * Remove team flair from user
   */
  static async removeTeamFlair(
    reddit: RedditClient,
    subredditName: string,
    username: string
  ): Promise<void> {
    try {
      await reddit.setUserFlair({
        subredditName,
        username,
        text: '',
        cssClass: '',
      });
      
      console.log(`✅ Removed flair for ${username}`);
    } catch (error) {
      console.warn(`Failed to remove flair for ${username}:`, error);
    }
  }
}
