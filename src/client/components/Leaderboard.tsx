import { useState } from 'react';
import { useLeaderboard } from '../hooks/useLeaderboard';
import type { Team } from '../../shared/types/game';

interface LeaderboardProps {
  isOpen: boolean;
  onClose: () => void;
  userTeam: Team | null;
  username: string | null;
}

type TabType = 'players' | 'teams';

export const Leaderboard = ({ isOpen, onClose, userTeam, username }: LeaderboardProps) => {
  const { players, teams, userRank, loading, refresh } = useLeaderboard();
  const [activeTab, setActiveTab] = useState<TabType>('players');

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 animate-fadeIn"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-4 md:inset-auto md:right-4 md:top-4 md:bottom-4 md:w-96 bg-white rounded-lg shadow-2xl z-50 flex flex-col animate-fadeIn">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-t-lg flex items-center justify-between">
          <h2 className="text-2xl font-bold">🏆 Leaderboard</h2>
          <button
            onClick={onClose}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center text-white hover:text-gray-200 active:text-gray-300 text-3xl leading-none transition-colors touch-manipulation"
            aria-label="Close leaderboard"
            title="Close leaderboard"
          >
            ×
          </button>
        </div>

        {/* Tabs - Optimized touch targets */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('players')}
            className={`flex-1 py-4 px-4 font-semibold transition-colors touch-manipulation min-h-[48px] ${
              activeTab === 'players'
                ? 'text-purple-600 border-b-2 border-purple-600'
                : 'text-gray-500 hover:text-gray-700 active:text-gray-900'
            }`}
            aria-label="View player rankings"
            aria-current={activeTab === 'players' ? 'page' : undefined}
          >
            👤 Players
          </button>
          <button
            onClick={() => setActiveTab('teams')}
            className={`flex-1 py-4 px-4 font-semibold transition-colors touch-manipulation min-h-[48px] ${
              activeTab === 'teams'
                ? 'text-purple-600 border-b-2 border-purple-600'
                : 'text-gray-500 hover:text-gray-700 active:text-gray-900'
            }`}
            aria-label="View team standings"
            aria-current={activeTab === 'teams' ? 'page' : undefined}
          >
            👥 Teams
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-gray-500">Loading...</div>
            </div>
          ) : activeTab === 'players' ? (
            <PlayerRankings
              players={players}
              userRank={userRank}
              username={username}
              userTeam={userTeam}
            />
          ) : (
            <TeamStandings teams={teams} userTeam={userTeam} />
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-3 bg-gray-50 rounded-b-lg flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {userRank > 0 ? (
              <span title="Your current rank among all players">
                Your rank: <span className="font-bold">#{userRank}</span>
              </span>
            ) : (
              <span className="text-gray-500 text-xs">Place a pixel to get ranked!</span>
            )}
          </div>
          <button
            onClick={refresh}
            className="min-h-[44px] px-3 text-sm text-purple-600 hover:text-purple-700 active:text-purple-800 font-semibold transition-colors touch-manipulation"
            aria-label="Refresh leaderboard data"
            title="Refresh leaderboard data"
          >
            🔄 Refresh
          </button>
        </div>
      </div>
    </>
  );
};

interface PlayerRankingsProps {
  players: Array<{
    username: string;
    pixelsPlaced: number;
    rank: number;
    team: string;
  }>;
  userRank: number;
  username: string | null;
  userTeam: Team | null;
}

const PlayerRankings = ({ players, userRank, username, userTeam }: PlayerRankingsProps) => {
  if (players.length === 0) {
    return (
      <div className="text-center py-8 px-4">
        <div className="text-4xl mb-3">🎨</div>
        <div className="text-gray-700 font-semibold mb-2">No players yet!</div>
        <div className="text-gray-500 text-sm">
          Be the first to place a pixel and claim your spot on the leaderboard.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {players.map((player) => {
        const isCurrentUser = player.username === username;
        const teamColor = getTeamColor(player.team);

        return (
          <div
            key={player.username}
            className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
              isCurrentUser
                ? 'bg-purple-50 border-2 border-purple-300'
                : 'bg-gray-50 hover:bg-gray-100'
            }`}
          >
            {/* Rank */}
            <div className="flex-shrink-0 w-8 text-center">
              {player.rank <= 3 ? (
                <span className="text-2xl">
                  {player.rank === 1 ? '🥇' : player.rank === 2 ? '🥈' : '🥉'}
                </span>
              ) : (
                <span className="text-lg font-bold text-gray-600">#{player.rank}</span>
              )}
            </div>

            {/* Team Color */}
            <div
              className="w-4 h-4 rounded-full flex-shrink-0"
              style={{ backgroundColor: teamColor }}
            />

            {/* Username */}
            <div className="flex-1 min-w-0">
              <div className={`font-semibold truncate ${isCurrentUser ? 'text-purple-700' : ''}`}>
                {player.username}
                {isCurrentUser && ' (You)'}
              </div>
              <div className="text-sm text-gray-600">{player.pixelsPlaced} pixels</div>
            </div>
          </div>
        );
      })}

      {/* Current user if not in top 10 */}
      {userRank > 10 && username && userTeam && (
        <>
          <div className="text-center text-gray-400 py-2">...</div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-purple-50 border-2 border-purple-300">
            <div className="flex-shrink-0 w-8 text-center">
              <span className="text-lg font-bold text-gray-600">#{userRank}</span>
            </div>
            <div
              className="w-4 h-4 rounded-full flex-shrink-0"
              style={{ backgroundColor: userTeam.color }}
            />
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-purple-700 truncate">{username} (You)</div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

interface TeamStandingsProps {
  teams: Array<{
    teamId: string;
    teamName: string;
    zonesControlled: number;
    totalPixels: number;
    rank: number;
  }>;
  userTeam: Team | null;
}

const TeamStandings = ({ teams, userTeam }: TeamStandingsProps) => {
  if (teams.length === 0) {
    return (
      <div className="text-center py-8 px-4">
        <div className="text-4xl mb-3">🏆</div>
        <div className="text-gray-700 font-semibold mb-2">No team data yet!</div>
        <div className="text-gray-500 text-sm">
          Start placing pixels to see team standings and territory control.
        </div>
      </div>
    );
  }

  const totalZones = teams.reduce((sum, team) => sum + team.zonesControlled, 0);
  const totalPixels = teams.reduce((sum, team) => sum + team.totalPixels, 0);

  return (
    <div className="space-y-4">
      {teams.map((team) => {
        const isUserTeam = team.teamId === userTeam?.id;
        const teamColor = getTeamColor(team.teamId);
        const zonePercentage = totalZones > 0 ? (team.zonesControlled / totalZones) * 100 : 0;
        const pixelPercentage = totalPixels > 0 ? (team.totalPixels / totalPixels) * 100 : 0;

        return (
          <div
            key={team.teamId}
            className={`p-4 rounded-lg transition-colors ${
              isUserTeam
                ? 'bg-purple-50 border-2 border-purple-300'
                : 'bg-gray-50 hover:bg-gray-100'
            }`}
          >
            {/* Team Header */}
            <div className="flex items-center gap-3 mb-3">
              {/* Rank */}
              <div className="flex-shrink-0 w-8 text-center">
                {team.rank <= 3 ? (
                  <span className="text-2xl">
                    {team.rank === 1 ? '🥇' : team.rank === 2 ? '🥈' : '🥉'}
                  </span>
                ) : (
                  <span className="text-lg font-bold text-gray-600">#{team.rank}</span>
                )}
              </div>

              {/* Team Badge */}
              <div
                className="w-6 h-6 rounded flex-shrink-0"
                style={{ backgroundColor: teamColor }}
              />

              {/* Team Name */}
              <div className="flex-1">
                <div className={`font-bold text-lg ${isUserTeam ? 'text-purple-700' : ''}`}>
                  {team.teamName}
                  {isUserTeam && ' ⭐'}
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="space-y-2">
              {/* Zones */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Zones Controlled</span>
                  <span className="font-semibold">
                    {team.zonesControlled} ({zonePercentage.toFixed(1)}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${zonePercentage}%`,
                      backgroundColor: teamColor,
                    }}
                  />
                </div>
              </div>

              {/* Pixels */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Total Pixels</span>
                  <span className="font-semibold">
                    {team.totalPixels.toLocaleString()} ({pixelPercentage.toFixed(1)}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${pixelPercentage}%`,
                      backgroundColor: teamColor,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Helper function to get team color
const getTeamColor = (teamId: string): string => {
  const colors: Record<string, string> = {
    red: '#FF4444',
    blue: '#4444FF',
    green: '#44FF44',
    yellow: '#FFFF44',
  };
  return colors[teamId.toLowerCase()] || '#888888';
};
