import { useCallback, useEffect, useState, useRef } from 'react';
import type {
  InitResponse,
  PlacePixelResponse,
  CanvasUpdatesResponse,
} from '../../shared/types/api';
import type { Team, PixelData, ZoneData, GameConfig } from '../../shared/types/game';
import { POLLING_INTERVAL } from '../../shared/constants/config';

interface GameState {
  postId: string | null;
  username: string | null;
  team: Team | null;
  pixelCredits: number;
  nextCreditTime: number;
  canvas: PixelData[];
  zones: ZoneData[];
  config: GameConfig | null;
  loading: boolean;
  error: string | null;
}

export const useGameState = () => {
  const [state, setState] = useState<GameState>({
    postId: null,
    username: null,
    team: null,
    pixelCredits: 0,
    nextCreditTime: 0,
    canvas: [],
    zones: [],
    config: null,
    loading: true,
    error: null,
  });

  const lastUpdateRef = useRef<number>(0);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize game
  useEffect(() => {
    const init = async () => {
      try {
        const res = await fetch('/api/init');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: InitResponse = await res.json();
        if (data.type !== 'init') throw new Error('Unexpected response');

        setState({
          postId: data.postId,
          username: data.username,
          team: data.team,
          pixelCredits: data.pixelCredits,
          nextCreditTime: data.nextCreditTime,
          canvas: data.canvas,
          zones: data.zones,
          config: data.config,
          loading: false,
          error: null,
        });

        lastUpdateRef.current = Date.now();
      } catch (err) {
        console.error('Failed to init game', err);
        setState((prev) => ({
          ...prev,
          loading: false,
          error: err instanceof Error ? err.message : 'Failed to initialize game',
        }));
      }
    };
    void init();
  }, []);

  // Poll for canvas updates
  useEffect(() => {
    if (!state.postId || state.loading) return;

    const pollUpdates = async () => {
      try {
        const res = await fetch(`/api/canvas-updates?since=${lastUpdateRef.current}`);
        if (!res.ok) return; // Silently fail polling errors

        const data: CanvasUpdatesResponse = await res.json();
        if (data.type !== 'canvas-updates') return;

        if (data.pixels.length > 0 || data.zones.length > 0) {
          setState((prev) => {
            // Merge new pixels with existing canvas
            const canvasMap = new Map(prev.canvas.map((p) => [`${p.x}:${p.y}`, p]));
            for (const pixel of data.pixels) {
              canvasMap.set(`${pixel.x}:${pixel.y}`, pixel);
            }

            return {
              ...prev,
              canvas: Array.from(canvasMap.values()),
              zones: data.zones.length > 0 ? data.zones : prev.zones,
            };
          });
        }

        lastUpdateRef.current = data.timestamp;
      } catch (err) {
        console.error('Failed to poll updates', err);
      }
    };

    // Start polling
    pollingIntervalRef.current = setInterval(pollUpdates, POLLING_INTERVAL);

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [state.postId, state.loading]);

  // Place pixel
  const placePixel = useCallback(
    async (x: number, y: number) => {
      if (!state.postId || !state.team) {
        console.error('No postId or team – cannot place pixel');
        return false;
      }

      // Optimistic update - add pixel immediately
      const optimisticPixel: PixelData = {
        x,
        y,
        teamId: state.team.id,
        timestamp: Date.now(),
      };

      setState((prev) => {
        const canvasMap = new Map(prev.canvas.map((p) => [`${p.x}:${p.y}`, p]));
        canvasMap.set(`${x}:${y}`, optimisticPixel);
        return {
          ...prev,
          canvas: Array.from(canvasMap.values()),
        };
      });

      try {
        const res = await fetch('/api/place-pixel', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ x, y }),
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: PlacePixelResponse = await res.json();

        if (data.success) {
          setState((prev) => ({
            ...prev,
            pixelCredits: data.pixelCredits,
            nextCreditTime: data.nextCreditTime,
          }));
          return true;
        } else {
          // Revert optimistic update on failure
          setState((prev) => {
            const canvasMap = new Map(prev.canvas.map((p) => [`${p.x}:${p.y}`, p]));
            canvasMap.delete(`${x}:${y}`);
            return {
              ...prev,
              canvas: Array.from(canvasMap.values()),
              error: data.error || 'Failed to place pixel',
            };
          });
          return false;
        }
      } catch (err) {
        console.error('Failed to place pixel', err);
        // Revert optimistic update on error
        setState((prev) => {
          const canvasMap = new Map(prev.canvas.map((p) => [`${p.x}:${p.y}`, p]));
          canvasMap.delete(`${x}:${y}`);
          return {
            ...prev,
            canvas: Array.from(canvasMap.values()),
            error: err instanceof Error ? err.message : 'Failed to place pixel',
          };
        });
        return false;
      }
    },
    [state.postId, state.team]
  );

  // Clear error
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    postId: state.postId,
    placePixel,
    clearError,
  } as const;
};
