/**
 * WinnerModal Component
 * 
 * Full-screen modal displaying season winner with celebration animations,
 * final standings, and season statistics.
 */

import { useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';

interface WinnerModalProps {
  isOpen: boolean;
  seasonNumber: number;
  winningTeam: {
    id: string;
    name: string;
    color: string;
    finalScore: number;
  };
  finalStandings: Array<{
    teamId: string;
    teamName: string;
    score: number;
    zonesControlled: number;
    playerCount: number;
  }>;
  statistics: {
    totalPixelsPlaced: number;
    totalPlayers: number;
    topPlayer: {
      username: string;
      teamId: string;
      pixelsPlaced: number;
    };
  };
  onClose: () => void;
  autoCloseDelay?: number; // milliseconds, default 10000
}

export const WinnerModal: React.FC<WinnerModalProps> = ({
  isOpen,
  seasonNumber,
  winningTeam,
  finalStandings,
  statistics,
  onClose,
  autoCloseDelay = 10000,
}) => {
  const [timeRemaining, setTimeRemaining] = useState(autoCloseDelay / 1000);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setTimeRemaining(autoCloseDelay / 1000);
      setIsClosing(false);
      return;
    }

    // Auto-close timer
    const closeTimer = setTimeout(() => {
      handleClose();
    }, autoCloseDelay);

    // Countdown timer
    const countdownInterval = setInterval(() => {
      setTimeRemaining((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => {
      clearTimeout(closeTimer);
      clearInterval(countdownInterval);
    };
  }, [isOpen, autoCloseDelay]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 300); // Match animation duration
  };

  if (!isOpen) return null;

  return (
    <div
      className={twMerge(
        'fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm transition-opacity duration-300',
        isClosing ? 'opacity-0' : 'opacity-100'
      )}
      onClick={handleClose}
    >
      <div
        className={twMerge(
          'relative max-w-4xl w-full mx-4 bg-gray-900 rounded-2xl shadow-2xl overflow-hidden transition-transform duration-300',
          isClosing ? 'scale-95' : 'scale-100'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Confetti Background Effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                top: `-${Math.random() * 20}%`,
                backgroundColor: ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#F38181'][
                  Math.floor(Math.random() * 5)
                ],
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${3 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 text-white/60 hover:text-white transition-colors text-2xl"
          title="Close"
        >
          ✕
        </button>

        {/* Content */}
        <div className="relative p-8 text-white">
          {/* Trophy Animation */}
          <div className="flex justify-center mb-6">
            <div className="text-8xl animate-bounce">🏆</div>
          </div>

          {/* Winner Announcement */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-2 animate-pulse">
              Season {seasonNumber} Winner!
            </h1>
            <div
              className="text-5xl md:text-6xl font-black mb-4 drop-shadow-lg"
              style={{ color: winningTeam.color }}
            >
              {winningTeam.name}
            </div>
            <div className="text-2xl md:text-3xl font-semibold text-yellow-400">
              {winningTeam.finalScore.toLocaleString()} Points
            </div>
          </div>

          {/* Final Standings */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-center">Final Standings</h2>
            <div className="bg-gray-800 rounded-lg p-4 overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="pb-2 pr-4">Rank</th>
                    <th className="pb-2 pr-4">Team</th>
                    <th className="pb-2 pr-4 text-right">Score</th>
                    <th className="pb-2 pr-4 text-right hidden sm:table-cell">Zones</th>
                    <th className="pb-2 text-right hidden md:table-cell">Players</th>
                  </tr>
                </thead>
                <tbody>
                  {finalStandings.map((team, index) => (
                    <tr
                      key={team.teamId}
                      className={twMerge(
                        'border-b border-gray-700/50',
                        index === 0 && 'bg-yellow-500/10'
                      )}
                    >
                      <td className="py-3 pr-4">
                        <span className="text-2xl">
                          {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`}
                        </span>
                      </td>
                      <td className="py-3 pr-4 font-semibold">{team.teamName}</td>
                      <td className="py-3 pr-4 text-right font-bold">
                        {team.score.toLocaleString()}
                      </td>
                      <td className="py-3 pr-4 text-right hidden sm:table-cell">
                        {team.zonesControlled}
                      </td>
                      <td className="py-3 text-right hidden md:table-cell">
                        {team.playerCount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Season Statistics */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-4 text-center">Season Statistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-800 rounded-lg p-4 text-center">
                <div className="text-3xl mb-2">🎨</div>
                <div className="text-2xl font-bold text-blue-400">
                  {statistics.totalPixelsPlaced.toLocaleString()}
                </div>
                <div className="text-sm text-gray-400">Total Pixels</div>
              </div>
              <div className="bg-gray-800 rounded-lg p-4 text-center">
                <div className="text-3xl mb-2">👥</div>
                <div className="text-2xl font-bold text-green-400">
                  {statistics.totalPlayers}
                </div>
                <div className="text-sm text-gray-400">Total Players</div>
              </div>
              <div className="bg-gray-800 rounded-lg p-4 text-center">
                <div className="text-3xl mb-2">⭐</div>
                <div className="text-lg font-bold text-yellow-400">
                  u/{statistics.topPlayer.username}
                </div>
                <div className="text-sm text-gray-400">
                  Top Player ({statistics.topPlayer.pixelsPlaced} pixels)
                </div>
              </div>
            </div>
          </div>

          {/* Auto-close Countdown */}
          <div className="text-center text-sm text-gray-400">
            Closing in {timeRemaining}s... (click anywhere to close now)
          </div>
        </div>
      </div>

      {/* CSS for confetti animation */}
      <style>{`
        @keyframes confetti {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        .animate-confetti {
          animation: confetti linear infinite;
        }
      `}</style>
    </div>
  );
};
