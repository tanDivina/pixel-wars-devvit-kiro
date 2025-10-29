import type { Team, GameConfig } from '../../shared/types/game';

interface ControlPanelProps {
  config: GameConfig | null;
  userTeam: Team | null;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
  onToggleLeaderboard: () => void;
  currentZoom: number;
}

export const ControlPanel = ({
  config,
  userTeam,
  onZoomIn,
  onZoomOut,
  onResetView,
  onToggleLeaderboard,
  currentZoom,
}: ControlPanelProps) => {
  return (
    <div className="bg-gray-800 text-white p-3 flex items-center justify-between gap-4 flex-wrap">
      {/* Left: Instructions */}
      <div className="text-sm opacity-90 flex-1 min-w-0">
        <span className="hidden sm:inline">
          Click to place pixels • Drag to pan • Use +/- to zoom
        </span>
        <span className="sm:hidden">Tap to place • Drag to pan</span>
      </div>

      {/* Center: Team Stats (Desktop only) */}
      {config && userTeam && (
        <div className="hidden md:flex items-center gap-4 text-sm">
          {config.teams.map((team) => {
            const isUserTeam = team.id === userTeam.id;
            return (
              <div
                key={team.id}
                className={`flex items-center gap-2 ${
                  isUserTeam ? 'opacity-100 font-semibold' : 'opacity-60'
                }`}
              >
                <div
                  className="w-3 h-3 rounded"
                  style={{ backgroundColor: team.color }}
                />
                <span>{team.name}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Right: Controls */}
      <div className="flex items-center gap-2">
        {/* Zoom Controls - Optimized touch targets (min 44x44px) */}
        <div className="flex items-center gap-1 bg-gray-700 rounded-lg p-1">
          <button
            onClick={onZoomOut}
            className="w-10 h-10 sm:w-8 sm:h-8 flex items-center justify-center hover:bg-gray-600 active:bg-gray-500 rounded transition-colors touch-manipulation"
            title="Zoom out (or use pinch gesture)"
            aria-label="Zoom out"
          >
            <span className="text-xl sm:text-lg leading-none">−</span>
          </button>
          <div className="px-2 text-xs opacity-75 min-w-[3rem] text-center" aria-live="polite">
            {Math.round(currentZoom * 100)}%
          </div>
          <button
            onClick={onZoomIn}
            className="w-10 h-10 sm:w-8 sm:h-8 flex items-center justify-center hover:bg-gray-600 active:bg-gray-500 rounded transition-colors touch-manipulation"
            title="Zoom in (or use pinch gesture)"
            aria-label="Zoom in"
          >
            <span className="text-xl sm:text-lg leading-none">+</span>
          </button>
        </div>

        {/* Reset View - Optimized touch target */}
        <button
          onClick={onResetView}
          className="px-4 h-10 sm:h-8 bg-gray-700 hover:bg-gray-600 active:bg-gray-500 rounded-lg text-sm transition-colors touch-manipulation"
          title="Reset view to center (double-tap canvas also works)"
          aria-label="Reset view to center"
        >
          <span className="hidden sm:inline">Reset</span>
          <span className="sm:hidden">↺</span>
        </button>

        {/* Leaderboard Toggle - Optimized touch target */}
        <button
          onClick={onToggleLeaderboard}
          className="px-4 h-10 sm:h-8 bg-purple-600 hover:bg-purple-700 active:bg-purple-800 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1 touch-manipulation"
          title="View leaderboard and team standings"
          aria-label="Open leaderboard"
        >
          <span className="text-lg sm:text-base">🏆</span>
          <span className="hidden sm:inline">Leaderboard</span>
        </button>
      </div>
    </div>
  );
};
