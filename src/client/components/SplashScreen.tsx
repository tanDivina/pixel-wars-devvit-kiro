import { useEffect, useState } from 'react';
import type { TeamStats } from '../../shared/types/game';

interface SplashScreenProps {
  onJoinBattle: () => void;
}

export const SplashScreen = ({ onJoinBattle }: SplashScreenProps) => {
  const [splashData, setSplashData] = useState<{
    teamStats: TeamStats[];
    activePlayers: number;
  } | null>(null);
  const [seasonData, setSeasonData] = useState<{
    seasonNumber: number;
    timeRemaining: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch splash data
        const splashResponse = await fetch('/api/splash-data');
        const splashDataResult = await splashResponse.json();
        
        if (splashDataResult.type === 'splash-data') {
          setSplashData({
            teamStats: splashDataResult.teamStats,
            activePlayers: splashDataResult.activePlayers,
          });
        }

        // Fetch season data
        const seasonResponse = await fetch('/api/season/current');
        if (seasonResponse.ok) {
          const seasonDataResult = await seasonResponse.json();
          setSeasonData({
            seasonNumber: seasonDataResult.seasonNumber,
            timeRemaining: seasonDataResult.timeRemaining,
          });
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
        // Trigger fade-in animation after data loads
        setTimeout(() => setIsVisible(true), 50);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  // Sort teams by total pixels (descending)
  const sortedTeams = splashData?.teamStats
    ? [...splashData.teamStats].sort((a, b) => b.totalPixels - a.totalPixels)
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4 overflow-hidden">
      <div 
        className={`max-w-4xl w-full transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        {/* Main Title */}
        <div className="text-center mb-8">
          <div className="mb-4">
            <span className="text-7xl md:text-8xl animate-bounce-subtle">⚔️</span>
          </div>
          <h1 className="text-6xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 mb-4 tracking-tight animate-pulse-slow">
            PIXEL WARS
          </h1>
          {seasonData && (
            <div className="text-lg md:text-xl text-yellow-400 mb-2 font-semibold">
              Season {seasonData.seasonNumber} • {formatTimeRemaining(seasonData.timeRemaining)} remaining
            </div>
          )}
          <p className="text-xl md:text-2xl text-gray-300 animate-fade-in-delay">
            🎨 Claim territory • 🏆 Dominate • 👥 Lead your team
          </p>
        </div>

        {/* Season Info Banner */}
        {seasonData && (
          <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-sm rounded-lg p-6 border border-yellow-500/50 mb-8 animate-fade-in">
            <div className="text-center">
              <div className="text-3xl mb-2">⏱️</div>
              <h3 className="text-xl font-bold text-yellow-400 mb-2">Season {seasonData.seasonNumber} Active</h3>
              <p className="text-gray-300 mb-3">
                Compete for glory! The team with the highest score wins when the season ends.
              </p>
              <div className="flex justify-center gap-8 text-sm">
                <div>
                  <div className="text-gray-400">Time Remaining</div>
                  <div className="text-white font-bold">{formatTimeRemaining(seasonData.timeRemaining)}</div>
                </div>
                <div>
                  <div className="text-gray-400">Scoring</div>
                  <div className="text-white font-bold">Zones × 100 + Pixels</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Active Players Card */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700 hover:border-green-500/50 transition-all duration-300 hover:scale-105 animate-slide-in-left">
            <div className="text-center">
              <div className="text-5xl font-bold text-white mb-2 animate-count-up">
                {splashData?.activePlayers || 0}
              </div>
              <div className="text-gray-400 text-lg">Active Players</div>
              <div className="mt-2 text-sm text-green-400 animate-pulse">● Live Now</div>
            </div>
          </div>

          {/* Total Pixels Card */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700 hover:border-blue-500/50 transition-all duration-300 hover:scale-105 animate-slide-in-right">
            <div className="text-center">
              <div className="text-5xl font-bold text-white mb-2 animate-count-up">
                {sortedTeams.reduce((sum, team) => sum + team.totalPixels, 0).toLocaleString()}
              </div>
              <div className="text-gray-400 text-lg">Pixels Placed</div>
              <div className="mt-2 text-sm text-gray-500">This Season</div>
            </div>
          </div>
        </div>

        {/* Team Standings */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700 mb-8 animate-fade-in-up">
          <h2 className="text-2xl font-bold text-white mb-4 text-center">Team Standings</h2>
          <div className="space-y-3">
            {sortedTeams.map((team, index) => {
              const totalPixels = sortedTeams.reduce((sum, t) => sum + t.totalPixels, 0);
              const percentage = totalPixels > 0 ? (team.totalPixels / totalPixels) * 100 : 0;

              return (
                <div 
                  key={team.teamId} 
                  className="relative group hover:scale-102 transition-transform duration-300"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Background bar with animation */}
                  <div
                    className="absolute inset-0 rounded-lg opacity-20 transition-all duration-500 animate-expand-width"
                    style={{
                      backgroundColor: team.color,
                      width: `${percentage}%`,
                      animationDelay: `${index * 150}ms`,
                    }}
                  />
                  
                  {/* Pulsing glow effect for team color */}
                  <div
                    className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-30 transition-opacity duration-300 animate-pulse-glow"
                    style={{
                      backgroundColor: team.color,
                      boxShadow: `0 0 20px ${team.color}`,
                    }}
                  />
                  
                  {/* Content */}
                  <div className="relative flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl font-bold text-gray-400 w-8 animate-fade-in">
                        #{index + 1}
                      </div>
                      <div
                        className="w-8 h-8 rounded-full border-2 border-white shadow-lg animate-pulse-color"
                        style={{ 
                          backgroundColor: team.color,
                          boxShadow: `0 0 10px ${team.color}`,
                        }}
                      />
                      <div>
                        <div className="text-lg font-bold text-white">
                          {team.teamName}
                        </div>
                        <div className="text-sm text-gray-400">
                          {team.playerCount} {team.playerCount === 1 ? 'player' : 'players'}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-white">
                        {team.totalPixels.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-400">
                        {percentage.toFixed(1)}% • {team.zonesControlled} zones
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Join Battle Button */}
        <div className="text-center animate-bounce-subtle">
          <button
            onClick={onJoinBattle}
            className="group relative inline-flex items-center justify-center px-12 py-6 text-2xl font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 hover:scale-110 active:scale-95 animate-pulse-button"
          >
            <span className="relative z-10">⚔️ Join the Battle</span>
            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300 animate-shimmer" />
            
            {/* Animated border glow */}
            <div className="absolute inset-0 rounded-lg opacity-75 blur-xl bg-gradient-to-r from-blue-600 to-purple-600 animate-pulse-glow" />
          </button>
          <p className="mt-4 text-gray-400 text-sm animate-fade-in-delay-2">
            Click to start placing pixels and claim territory for your team
          </p>
        </div>

        {/* How to Play */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-6 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🎨</span>
              <span>Place Pixels</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🏆</span>
              <span>Control Zones</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">👥</span>
              <span>Team Strategy</span>
            </div>
          </div>
          
          {/* Community Note */}
          <div className="mt-6 text-xs text-gray-500 animate-fade-in-delay-2">
            💬 Coordinate with your team in the comments • Built for Reddit communities
          </div>
        </div>
      </div>
    </div>
  );
};


/**
 * Format time remaining for display
 */
function formatTimeRemaining(ms: number): string {
  const days = Math.floor(ms / (24 * 60 * 60 * 1000));
  const hours = Math.floor((ms % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
  const minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));

  if (days > 0) {
    return `${days}d ${hours}h`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
}
