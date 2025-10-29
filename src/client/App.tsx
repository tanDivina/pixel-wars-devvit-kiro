import { useState, useCallback, useRef, useEffect } from 'react';
import { useGameState } from './hooks/useGameState';
import { usePixelCredits } from './hooks/usePixelCredits';
import { useToast } from './hooks/useToast';
import { useSoundEffects } from './hooks/useSoundEffects';
import { Canvas } from './components/Canvas';
import { Tutorial } from './components/Tutorial';
import { Leaderboard } from './components/Leaderboard';
import { ControlPanel } from './components/ControlPanel';
import { ToastContainer } from './components/Toast';
import { TeamBadge } from './components/TeamBadge';
import { SplashScreen } from './components/SplashScreen';
import { CountdownTimer } from './components/CountdownTimer';
import { WinnerModal } from './components/WinnerModal';
import { SeasonAdmin } from './components/SeasonAdmin';
import type { SeasonCurrentResponse, SeasonHistoryResponse } from '../shared/types/api';

export const App = () => {
  const {
    username,
    team,
    pixelCredits,
    nextCreditTime,
    canvas,
    zones,
    config,
    loading,
    error,
    placePixel,
    clearError,
  } = useGameState();

  const { formattedTime, hasTimeRemaining } = usePixelCredits(nextCreditTime);
  const { toasts, removeToast, addToast, error: showError } = useToast();
  const { playPixelPlace, playZoneCapture, playCreditRegeneration, playError } = useSoundEffects();
  const [, setShowTutorial] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [currentZoom, setCurrentZoom] = useState(1);
  const [showSplash, setShowSplash] = useState(true);
  const [hasShownWelcome, setHasShownWelcome] = useState(false);
  const [previousZones, setPreviousZones] = useState<typeof zones>([]);
  const [previousCredits, setPreviousCredits] = useState(pixelCredits);
  const [seasonData, setSeasonData] = useState<SeasonCurrentResponse | null>(null);
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  const [winnerData, setWinnerData] = useState<SeasonHistoryResponse['history'][0] | null>(null);
  
  // Canvas control refs
  const canvasControlsRef = useRef<{
    zoomIn: () => void;
    zoomOut: () => void;
    resetView: () => void;
  } | null>(null);

  // Fetch season data
  useEffect(() => {
    const fetchSeasonData = async () => {
      try {
        const response = await fetch('/api/season/current');
        if (response.ok) {
          const data = await response.json();
          setSeasonData(data);
        }
      } catch (error) {
        console.error('Failed to fetch season data:', error);
      }
    };

    fetchSeasonData();
    // Poll every 10 seconds for updates
    const interval = setInterval(fetchSeasonData, 10000);
    return () => clearInterval(interval);
  }, []);

  // Handle season end - fetch winner data
  const handleSeasonEnd = useCallback(async () => {
    try {
      // Fetch the most recent season history
      const response = await fetch('/api/season/history');
      if (response.ok) {
        const data: SeasonHistoryResponse = await response.json();
        if (data.history && data.history.length > 0) {
          // Get the most recent completed season
          const latestSeason = data.history[0];
          if (latestSeason) {
            setWinnerData(latestSeason);
            setShowWinnerModal(true);
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch winner data:', error);
    }
  }, []);

  const handlePixelClick = async (x: number, y: number) => {
    // Pre-flight validation with helpful messages
    if (pixelCredits <= 0) {
      const timeLeft = formattedTime || 'soon';
      showError(`⏳ Out of credits! Next pixel in ${timeLeft}`, 'no_credits');
      playError();
      return;
    }
    
    // Check if coordinates are valid
    if (!config || x < 0 || x >= config.canvasWidth || y < 0 || y >= config.canvasHeight) {
      showError('❌ Invalid position. Click within the canvas.', 'invalid_coordinates');
      playError();
      return;
    }
    
    try {
      const result = await placePixel(x, y);
      if (result) {
        // Play success sound
        playPixelPlace();
        // Success message with shorter duration (1.5s)
        const id = addToast(`🎨 Pixel placed at (${x}, ${y}) for ${team?.name}!`, 'success');
        setTimeout(() => removeToast(id), 1500);
      } else {
        playError();
        showError('❌ Failed to place pixel. Please try again.', 'unknown');
      }
    } catch (err) {
      // Network or server error
      console.error('Pixel placement error:', err);
      playError();
      showError('🌐 Connection issue. Check your internet and try again.', 'network_error');
    }
  };

  const handleZoomChange = useCallback((zoom: number) => {
    setCurrentZoom(zoom);
  }, []);

  // Detect zone captures
  useEffect(() => {
    if (!team || zones.length === 0 || previousZones.length === 0) {
      setPreviousZones(zones);
      return;
    }

    // Check for newly captured zones
    zones.forEach((zone) => {
      const prevZone = previousZones.find((z) => z.x === zone.x && z.y === zone.y);
      
      // Zone changed hands to your team
      if (prevZone && prevZone.controllingTeam !== team.id && zone.controllingTeam === team.id) {
        playZoneCapture();
        const id = addToast(`🎉 ${team.name} captured zone (${zone.x}, ${zone.y})!`, 'success');
        setTimeout(() => removeToast(id), 2500);
      }
      
      // Zone lost by your team
      if (prevZone && prevZone.controllingTeam === team.id && zone.controllingTeam !== team.id && zone.controllingTeam !== null) {
        const losingTeam = config?.teams.find((t) => t.id === zone.controllingTeam);
        const id = addToast(`⚠️ Zone (${zone.x}, ${zone.y}) taken by ${losingTeam?.name}!`, 'warning');
        setTimeout(() => removeToast(id), 2500);
      }
    });

    setPreviousZones(zones);
  }, [zones, team, previousZones, config, addToast, removeToast, playZoneCapture]);

  // Show welcome message once after joining
  useEffect(() => {
    if (!showSplash && !loading && username && !hasShownWelcome && team) {
      setHasShownWelcome(true);
      const id = addToast(`👋 Welcome ${username}! You're on ${team.name}!`, 'info');
      setTimeout(() => removeToast(id), 3000);
    }
  }, [showSplash, loading, username, hasShownWelcome, team, addToast, removeToast]);

  // Detect credit regeneration
  useEffect(() => {
    if (pixelCredits > previousCredits && previousCredits >= 0) {
      playCreditRegeneration();
    }
    setPreviousCredits(pixelCredits);
  }, [pixelCredits, previousCredits, playCreditRegeneration]);

  // Show splash screen while loading or if user hasn't joined yet
  if (showSplash || loading) {
    return <SplashScreen onJoinBattle={() => setShowSplash(false)} />;
  }

  // Safety check - if no config, show loading with helpful message
  if (!config || !team) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
        <div className="text-6xl mb-4 animate-pulse">🎮</div>
        <div className="text-2xl font-bold text-gray-800 mb-2">Loading Pixel Wars...</div>
        <div className="text-gray-600">Setting up your team and canvas</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 gap-4 p-4">
        <div className="text-6xl mb-2">⚠️</div>
        <div className="text-2xl font-bold text-gray-800 mb-2">Oops! Something went wrong</div>
        <div className="text-lg text-red-600 max-w-md text-center">{error}</div>
        <div className="text-sm text-gray-600 max-w-md text-center mb-4">
          This might be a temporary connection issue. Try refreshing the page or clicking retry below.
        </div>
        <button
          onClick={clearError}
          className="px-6 py-3 min-h-[48px] bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors font-semibold touch-manipulation"
          aria-label="Retry loading the game"
        >
          🔄 Retry
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Tutorial Overlay */}
      <Tutorial team={team} onComplete={() => setShowTutorial(false)} />

      {/* Leaderboard Modal */}
      <Leaderboard
        isOpen={showLeaderboard}
        onClose={() => setShowLeaderboard(false)}
        userTeam={team}
        username={username}
      />

      {/* Winner Modal */}
      {winnerData && (
        <WinnerModal
          isOpen={showWinnerModal}
          seasonNumber={winnerData.seasonNumber}
          winningTeam={winnerData.winningTeam}
          finalStandings={winnerData.finalStandings}
          statistics={winnerData.statistics}
          onClose={() => {
            setShowWinnerModal(false);
            // Refresh season data after modal closes
            fetch('/api/season/current')
              .then((res) => res.json())
              .then((data) => setSeasonData(data))
              .catch((err) => console.error('Failed to refresh season data:', err));
          }}
        />
      )}

      {/* Header */}
      <div className="bg-gray-800 text-white p-4 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">Pixel Wars</h1>
          {seasonData && (
            <div 
              className="text-sm hidden md:block cursor-help" 
              title={`Season ${seasonData.seasonNumber} - Compete for the highest score!`}
            >
              <span className="opacity-75">Season {seasonData.seasonNumber}</span>
            </div>
          )}
          {username && (
            <div className="text-sm hidden sm:block">
              <span className="opacity-75">Player:</span> {username}
            </div>
          )}
        </div>
        <div className="flex items-center gap-4 sm:gap-6 flex-wrap">
          {seasonData && (
            <CountdownTimer 
              endTime={seasonData.endTime}
              onSeasonEnd={handleSeasonEnd}
            />
          )}
          {team && (
            <div title={`You're on ${team.name}! Work together to control the most territory.`}>
              <TeamBadge team={team} size="md" showName glow />
            </div>
          )}
          <div 
            className="flex items-center gap-2 cursor-help" 
            title={`You have ${pixelCredits} pixel credit${pixelCredits !== 1 ? 's' : ''}. ${hasTimeRemaining ? `Next credit in ${formattedTime}` : 'Credits regenerate every 2 minutes (max 10)'}`}
          >
            <span className="text-sm opacity-75">Credits:</span>
            <span className="text-xl font-bold">{pixelCredits}</span>
            {hasTimeRemaining && (
              <span className="text-sm opacity-75 hidden sm:inline">({formattedTime})</span>
            )}
          </div>
          <button
            onClick={() => setShowTutorial(true)}
            className="min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center text-sm opacity-75 hover:opacity-100 active:opacity-100 transition-opacity touch-manipulation"
            title="Show tutorial and game instructions"
            aria-label="Show help and tutorial"
          >
            <span className="text-lg sm:text-base">❓</span>
            <span className="hidden sm:inline ml-1">Help</span>
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 flex flex-col items-center bg-gray-100 p-4 overflow-hidden">
        {/* Instructions Banner - Context-aware guidance */}
        <div className="w-full flex justify-center mb-2 mt-2">
          {pixelCredits > 0 && (
            <div className="px-4 py-3 bg-blue-500 text-white rounded-lg shadow-lg animate-fadeIn max-w-2xl text-center">
              <span className="font-semibold text-base sm:text-lg">
                👆 Click or tap on the canvas to place a pixel for {team?.name}!
              </span>
              <div className="text-xs sm:text-sm opacity-90 mt-1">
                {pixelCredits} credit{pixelCredits !== 1 ? 's' : ''} available • Hover to preview placement
              </div>
            </div>
          )}
          {pixelCredits === 0 && (
            <div className="px-4 py-3 bg-orange-500 text-white rounded-lg shadow-lg animate-fadeIn max-w-2xl text-center">
              <span className="font-semibold text-base sm:text-lg">
                ⏳ Out of credits! Next pixel in {formattedTime}
              </span>
              <div className="text-xs sm:text-sm opacity-90 mt-1">
                Credits regenerate automatically • Use this time to plan your strategy!
              </div>
            </div>
          )}
        </div>
        
        {/* Canvas Container */}
        <div className="flex-1 flex items-center justify-center w-full">
          <Canvas
            pixels={canvas}
            config={config}
            userTeam={team}
            zones={zones}
            onPixelClick={handlePixelClick}
            onZoomChange={handleZoomChange}
            controlsRef={canvasControlsRef}
          />
        </div>
      </div>

      {/* Control Panel */}
      <ControlPanel
        config={config}
        userTeam={team}
        onZoomIn={() => canvasControlsRef.current?.zoomIn()}
        onZoomOut={() => canvasControlsRef.current?.zoomOut()}
        onResetView={() => canvasControlsRef.current?.resetView()}
        onToggleLeaderboard={() => setShowLeaderboard(!showLeaderboard)}
        currentZoom={currentZoom}
      />

      {/* Season Admin (Dev Only) */}
      <SeasonAdmin />
    </div>
  );
};
