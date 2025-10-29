/**
 * Reddit Post Service
 * 
 * Creates automated Reddit posts for season events including
 * season start announcements, warnings, and winner announcements.
 */

import type { RedditClient } from '@devvit/web/server';
import type { SeasonMetadata, SeasonHistory } from '../../shared/types/season.js';

export interface TeamStanding {
  teamId: string;
  teamName: string;
  score: number;
  zonesControlled: number;
  playerCount: number;
}

export class RedditPostService {
  constructor(
    private reddit: RedditClient,
    private subredditName: string
  ) {}

  /**
   * Post season start announcement
   * @param season - Season metadata
   */
  async postSeasonStart(season: SeasonMetadata): Promise<void> {
    try {
      console.log(`Creating season start post for season ${season.seasonNumber}`);

      const endDate = new Date(season.endTime);
      const durationDays = Math.floor(season.duration / (24 * 60 * 60 * 1000));

      const title = `🎮 Season ${season.seasonNumber} Has Begun! 🎮`;
      const body = this.generateSeasonStartPost(season, endDate, durationDays);

      await this.reddit.submitPost({
        title,
        text: body,
        subredditName: this.subredditName,
      });

      console.log(`Season start post created for season ${season.seasonNumber}`);
    } catch (error) {
      console.error(`Failed to create season start post for season ${season.seasonNumber}:`, error);
      throw new Error('Failed to create season start post');
    }
  }

  /**
   * Post 24 hour warning with current standings
   * @param season - Season metadata
   * @param standings - Current team standings
   */
  async post24HourWarning(season: SeasonMetadata, standings: TeamStanding[]): Promise<void> {
    try {
      console.log(`Creating 24h warning post for season ${season.seasonNumber}`);

      const title = `⏰ 24 Hours Left in Season ${season.seasonNumber}! ⏰`;
      const body = this.generate24HourWarningPost(season, standings);

      await this.reddit.submitPost({
        title,
        text: body,
        subredditName: this.subredditName,
      });

      console.log(`24h warning post created for season ${season.seasonNumber}`);
    } catch (error) {
      console.error(`Failed to create 24h warning post for season ${season.seasonNumber}:`, error);
      throw new Error('Failed to create 24h warning post');
    }
  }

  /**
   * Post 1 hour final warning
   * @param season - Season metadata
   * @param standings - Current team standings
   */
  async post1HourWarning(season: SeasonMetadata, standings: TeamStanding[]): Promise<void> {
    try {
      console.log(`Creating 1h warning post for season ${season.seasonNumber}`);

      const title = `🚨 FINAL HOUR! Season ${season.seasonNumber} Ends Soon! 🚨`;
      const body = this.generate1HourWarningPost(season, standings);

      await this.reddit.submitPost({
        title,
        text: body,
        subredditName: this.subredditName,
      });

      console.log(`1h warning post created for season ${season.seasonNumber}`);
    } catch (error) {
      console.error(`Failed to create 1h warning post for season ${season.seasonNumber}:`, error);
      throw new Error('Failed to create 1h warning post');
    }
  }

  /**
   * Post winner announcement with full statistics
   * @param history - Complete season history with winner and stats
   */
  async postWinnerAnnouncement(history: SeasonHistory): Promise<void> {
    try {
      console.log(`Creating winner announcement for season ${history.seasonNumber}`);

      const title = `🏆 Season ${history.seasonNumber} Winner: ${history.winningTeam.name}! 🏆`;
      const body = this.generateWinnerAnnouncementPost(history);

      await this.reddit.submitPost({
        title,
        text: body,
        subredditName: this.subredditName,
      });

      console.log(`Winner announcement created for season ${history.seasonNumber}`);
    } catch (error) {
      console.error(`Failed to create winner announcement for season ${history.seasonNumber}:`, error);
      throw new Error('Failed to create winner announcement');
    }
  }

  /**
   * Generate season start post content
   */
  private generateSeasonStartPost(
    season: SeasonMetadata,
    endDate: Date,
    durationDays: number
  ): string {
    return `
# Welcome to Season ${season.seasonNumber}!

The battle for territory has begun! All teams start fresh with a clean canvas.

## 📅 Season Details

- **Duration:** ${durationDays} day${durationDays !== 1 ? 's' : ''}
- **Ends:** ${endDate.toLocaleString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    })}

## 🎯 How to Win

- **Control Zones:** Each zone controlled = 100 points
- **Place Pixels:** Each pixel placed = 1 point
- **Team with highest score wins!**

## 🚀 Get Started

Jump into the game and start claiming territory for your team!

Good luck to all teams! May the best strategists win! 🎮

---

*This is an automated post. Season ${season.seasonNumber} is now live!*
`.trim();
  }

  /**
   * Generate 24 hour warning post content
   */
  private generate24HourWarningPost(season: SeasonMetadata, standings: TeamStanding[]): string {
    const standingsTable = this.formatStandingsTable(standings);

    return `
# ⏰ Only 24 Hours Remain! ⏰

Season ${season.seasonNumber} is entering its final day! Now is the time to make your move!

## 📊 Current Standings

${standingsTable}

## 🔥 Final Push

- Defend your zones!
- Capture new territory!
- Every pixel counts!

The season ends in **24 hours**. Don't miss your chance to secure victory!

---

*This is an automated post. Season ${season.seasonNumber} ends in 24 hours.*
`.trim();
  }

  /**
   * Generate 1 hour warning post content
   */
  private generate1HourWarningPost(season: SeasonMetadata, standings: TeamStanding[]): string {
    const standingsTable = this.formatStandingsTable(standings);

    return `
# 🚨 FINAL HOUR! 🚨

Season ${season.seasonNumber} ends in **ONE HOUR**! This is your last chance!

## 📊 Current Standings

${standingsTable}

## ⚡ Last Chance

The battle is almost over! Make every pixel count in these final moments!

- Can the leader hold on?
- Will there be a last-minute upset?
- Who will claim victory?

**The season ends in 60 minutes!**

---

*This is an automated post. Season ${season.seasonNumber} ends in 1 hour.*
`.trim();
  }

  /**
   * Generate winner announcement post content
   */
  private generateWinnerAnnouncementPost(history: SeasonHistory): string {
    const standingsTable = this.formatStandingsTable(history.finalStandings);
    const duration = Math.floor(history.duration / (24 * 60 * 60 * 1000));

    return `
# 🏆 Season ${history.seasonNumber} Results 🏆

## 🎉 Winner: ${history.winningTeam.name}! 🎉

Congratulations to **${history.winningTeam.name}** for dominating Season ${history.seasonNumber}!

### 🏅 Final Score: ${history.winningTeam.finalScore} points

## 📊 Final Standings

${standingsTable}

## 📈 Season Statistics

- **Total Pixels Placed:** ${history.statistics.totalPixelsPlaced.toLocaleString()}
- **Total Players:** ${history.statistics.totalPlayers}
- **Season Duration:** ${duration} day${duration !== 1 ? 's' : ''}
- **Top Player:** u/${history.statistics.topPlayer.username} (${history.statistics.topPlayer.pixelsPlaced} pixels)

## 🎮 What's Next?

Season ${history.seasonNumber + 1} is starting now! The canvas has been reset and all teams start fresh.

Will ${history.winningTeam.name} defend their title, or will a new champion emerge?

---

*This is an automated post. Season ${history.seasonNumber} has ended.*
`.trim();
  }

  /**
   * Format team standings as a markdown table
   */
  private formatStandingsTable(standings: TeamStanding[]): string {
    const rows = standings.map((team, index) => {
      const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
      return `| ${medal} | **${team.teamName}** | ${team.score} | ${team.zonesControlled} | ${team.playerCount} |`;
    });

    return `
| Rank | Team | Score | Zones | Players |
|------|------|-------|-------|---------|
${rows.join('\n')}
`.trim();
  }
}
