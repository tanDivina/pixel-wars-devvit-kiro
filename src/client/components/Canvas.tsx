import { useRef, useEffect, useState, useCallback } from 'react';
import type { PixelData, Team, GameConfig, ZoneData } from '../../shared/types/game';

interface CanvasProps {
  pixels: PixelData[];
  config: GameConfig | null;
  userTeam: Team | null;
  zones: ZoneData[];
  onPixelClick: (x: number, y: number) => void;
  onZoomChange?: (zoom: number) => void;
  controlsRef?: React.MutableRefObject<{
    zoomIn: () => void;
    zoomOut: () => void;
    resetView: () => void;
  } | null>;
}

// Chunk size for canvas chunking optimization
const CHUNK_SIZE = 50;

// Helper to create chunks
interface Chunk {
  x: number;
  y: number;
  canvas: OffscreenCanvas | null;
  dirty: boolean;
}

export const Canvas = ({ pixels, config, userTeam, zones, onPixelClick, onZoomChange, controlsRef }: CanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hasMoved, setHasMoved] = useState(false);
  const [hoverPixel, setHoverPixel] = useState<{ x: number; y: number } | null>(null);
  const chunksRef = useRef<Map<string, Chunk>>(new Map());
  const pixelMapRef = useRef<Map<string, string>>(new Map());
  const zoneMapRef = useRef<Map<string, ZoneData>>(new Map());
  const animationFrameRef = useRef<number | null>(null);
  const pendingUpdatesRef = useRef<Set<string>>(new Set());
  const [zoneAnimations, setZoneAnimations] = useState<Map<string, number>>(new Map());

  const pixelSize = 10; // Size of each pixel in screen pixels

  // Build pixel map with batching
  useEffect(() => {
    if (!config) return;

    // Batch pixel updates
    const newPixelMap = new Map<string, string>();
    for (const pixel of pixels) {
      const key = `${pixel.x}:${pixel.y}`;
      newPixelMap.set(key, pixel.teamId);
      
      // Mark chunk as dirty if pixel changed
      const oldTeamId = pixelMapRef.current.get(key);
      if (oldTeamId !== pixel.teamId) {
        const chunkX = Math.floor(pixel.x / CHUNK_SIZE);
        const chunkY = Math.floor(pixel.y / CHUNK_SIZE);
        const chunkKey = `${chunkX}:${chunkY}`;
        pendingUpdatesRef.current.add(chunkKey);
        
        const chunk = chunksRef.current.get(chunkKey);
        if (chunk) {
          chunk.dirty = true;
        }
      }
    }
    
    pixelMapRef.current = newPixelMap;
  }, [pixels, config]);

  // Build zone map and track zone control changes for animations
  useEffect(() => {
    if (!config) return;

    const newZoneMap = new Map<string, ZoneData>();
    const newAnimations = new Map<string, number>();
    
    for (const zone of zones) {
      const key = `${zone.x}:${zone.y}`;
      newZoneMap.set(key, zone);
      
      // Check if zone control changed
      const oldZone = zoneMapRef.current.get(key);
      if (oldZone && oldZone.controllingTeam !== zone.controllingTeam) {
        // Start animation for this zone
        newAnimations.set(key, Date.now());
      }
    }
    
    zoneMapRef.current = newZoneMap;
    
    // Update animations if any zones changed control
    if (newAnimations.size > 0) {
      setZoneAnimations((prev) => {
        const updated = new Map(prev);
        newAnimations.forEach((time, key) => updated.set(key, time));
        return updated;
      });
    }
  }, [zones, config]);

  // Initialize chunks
  const initializeChunks = useCallback(() => {
    if (!config) return;

    const numChunksX = Math.ceil(config.canvasWidth / CHUNK_SIZE);
    const numChunksY = Math.ceil(config.canvasHeight / CHUNK_SIZE);

    chunksRef.current.clear();

    for (let cy = 0; cy < numChunksY; cy++) {
      for (let cx = 0; cx < numChunksX; cx++) {
        const chunkKey = `${cx}:${cy}`;
        
        // Check if OffscreenCanvas is supported
        let offscreenCanvas: OffscreenCanvas | null = null;
        if (typeof OffscreenCanvas !== 'undefined') {
          offscreenCanvas = new OffscreenCanvas(
            CHUNK_SIZE * pixelSize,
            CHUNK_SIZE * pixelSize
          );
        }

        chunksRef.current.set(chunkKey, {
          x: cx,
          y: cy,
          canvas: offscreenCanvas,
          dirty: true,
        });
      }
    }
  }, [config]);

  // Render a single chunk
  const renderChunk = useCallback(
    (chunk: Chunk) => {
      if (!config || !chunk.canvas) return;

      const ctx = chunk.canvas.getContext('2d');
      if (!ctx) return;

      // Clear chunk
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, chunk.canvas.width, chunk.canvas.height);

      // Draw grid lines for this chunk
      ctx.strokeStyle = '#e0e0e0';
      ctx.lineWidth = 0.5;
      
      const startX = chunk.x * CHUNK_SIZE;
      const startY = chunk.y * CHUNK_SIZE;
      const endX = Math.min(startX + CHUNK_SIZE, config.canvasWidth);
      const endY = Math.min(startY + CHUNK_SIZE, config.canvasHeight);

      // Vertical grid lines
      for (let x = startX; x <= endX; x++) {
        const localX = (x - startX) * pixelSize;
        ctx.beginPath();
        ctx.moveTo(localX, 0);
        ctx.lineTo(localX, (endY - startY) * pixelSize);
        ctx.stroke();
      }

      // Horizontal grid lines
      for (let y = startY; y <= endY; y++) {
        const localY = (y - startY) * pixelSize;
        ctx.beginPath();
        ctx.moveTo(0, localY);
        ctx.lineTo((endX - startX) * pixelSize, localY);
        ctx.stroke();
      }

      // Draw pixels in this chunk
      for (let y = startY; y < endY; y++) {
        for (let x = startX; x < endX; x++) {
          const teamId = pixelMapRef.current.get(`${x}:${y}`);
          if (teamId) {
            const team = config.teams.find((t) => t.id === teamId);
            if (team) {
              ctx.fillStyle = team.color;
              const localX = (x - startX) * pixelSize;
              const localY = (y - startY) * pixelSize;
              ctx.fillRect(localX, localY, pixelSize, pixelSize);
            }
          }
        }
      }

      chunk.dirty = false;
    },
    [config]
  );

  // Render zone overlays on main canvas
  const renderZones = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      if (!config) return;

      const now = Date.now();
      const zonePixelSize = config.zoneSize * pixelSize;

      // Render each zone
      zoneMapRef.current.forEach((zone, key) => {
        if (!zone.controllingTeam) return;

        const team = config.teams.find((t) => t.id === zone.controllingTeam);
        if (!team) return;

        const x = zone.x * zonePixelSize;
        const y = zone.y * zonePixelSize;

        // Check if zone is animating
        const animStartTime = zoneAnimations.get(key);
        const isAnimating = animStartTime && now - animStartTime < 1000; // 1 second animation
        
        // Calculate animation progress (0 to 1)
        const animProgress = isAnimating ? (now - animStartTime!) / 1000 : 1;

        // Draw zone highlight with subtle fill
        ctx.fillStyle = team.color + '20'; // 20 = ~12% opacity in hex
        if (isAnimating) {
          // Pulse effect during animation
          const pulseOpacity = Math.floor(0x20 + 0x30 * Math.sin(animProgress * Math.PI * 4));
          ctx.fillStyle = team.color + pulseOpacity.toString(16).padStart(2, '0');
        }
        ctx.fillRect(x, y, zonePixelSize, zonePixelSize);

        // Draw zone border
        ctx.strokeStyle = team.color;
        ctx.lineWidth = isAnimating ? 3 + Math.sin(animProgress * Math.PI * 4) : 2;
        ctx.strokeRect(x, y, zonePixelSize, zonePixelSize);

        // Draw control indicator in corner
        const indicatorSize = 8;
        const indicatorPadding = 4;
        ctx.fillStyle = team.color;
        ctx.fillRect(
          x + indicatorPadding,
          y + indicatorPadding,
          indicatorSize,
          indicatorSize
        );

        // Add team initial or icon
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 6px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(
          team.name.charAt(0),
          x + indicatorPadding + indicatorSize / 2,
          y + indicatorPadding + indicatorSize / 2
        );
      });
    },
    [config, zoneAnimations]
  );

  // Calculate visible chunks (viewport culling)
  const getVisibleChunks = useCallback(() => {
    if (!canvasRef.current || !config) return [];

    const canvas = canvasRef.current;
    const visibleChunks: Chunk[] = [];

    // Calculate viewport bounds in grid coordinates
    const viewportLeft = -offset.x / scale;
    const viewportTop = -offset.y / scale;
    const viewportRight = (canvas.width - offset.x) / scale;
    const viewportBottom = (canvas.height - offset.y) / scale;

    // Convert to chunk coordinates
    const minChunkX = Math.max(0, Math.floor(viewportLeft / (CHUNK_SIZE * pixelSize)));
    const minChunkY = Math.max(0, Math.floor(viewportTop / (CHUNK_SIZE * pixelSize)));
    const maxChunkX = Math.min(
      Math.ceil(config.canvasWidth / CHUNK_SIZE) - 1,
      Math.ceil(viewportRight / (CHUNK_SIZE * pixelSize))
    );
    const maxChunkY = Math.min(
      Math.ceil(config.canvasHeight / CHUNK_SIZE) - 1,
      Math.ceil(viewportBottom / (CHUNK_SIZE * pixelSize))
    );

    // Collect visible chunks
    for (let cy = minChunkY; cy <= maxChunkY; cy++) {
      for (let cx = minChunkX; cx <= maxChunkX; cx++) {
        const chunkKey = `${cx}:${cy}`;
        const chunk = chunksRef.current.get(chunkKey);
        if (chunk) {
          visibleChunks.push(chunk);
        }
      }
    }

    return visibleChunks;
  }, [config, offset, scale]);

  // Main render loop with requestAnimationFrame
  const render = useCallback(() => {
    if (!canvasRef.current || !config) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear main canvas
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Apply transformations
    ctx.save();
    ctx.translate(offset.x, offset.y);
    ctx.scale(scale, scale);

    // Get visible chunks (viewport culling)
    const visibleChunks = getVisibleChunks();

    // Render dirty chunks
    for (const chunk of visibleChunks) {
      if (chunk.dirty && chunk.canvas) {
        renderChunk(chunk);
      }
    }

    // Draw visible chunks to main canvas
    for (const chunk of visibleChunks) {
      if (chunk.canvas) {
        const x = chunk.x * CHUNK_SIZE * pixelSize;
        const y = chunk.y * CHUNK_SIZE * pixelSize;
        ctx.drawImage(chunk.canvas, x, y);
      }
    }

    // Render zone overlays on top
    renderZones(ctx);

    // Draw hover preview
    if (hoverPixel && userTeam) {
      ctx.fillStyle = userTeam.color;
      ctx.globalAlpha = 0.5;
      ctx.fillRect(
        hoverPixel.x * pixelSize,
        hoverPixel.y * pixelSize,
        pixelSize,
        pixelSize
      );
      ctx.globalAlpha = 1.0;
      
      // Draw border around hover pixel
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2 / scale;
      ctx.strokeRect(
        hoverPixel.x * pixelSize,
        hoverPixel.y * pixelSize,
        pixelSize,
        pixelSize
      );
    }

    ctx.restore();

    // Clear pending updates
    pendingUpdatesRef.current.clear();
  }, [config, scale, offset, getVisibleChunks, renderChunk, renderZones, hoverPixel, userTeam]);

  // Initialize chunks when config changes
  useEffect(() => {
    if (config) {
      initializeChunks();
    }
  }, [config, initializeChunks]);

  // Render with requestAnimationFrame
  useEffect(() => {
    if (!config) return;

    // Cancel previous frame
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    // Schedule render
    animationFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [config, render]);

  // Continuous animation loop for zone animations
  useEffect(() => {
    if (zoneAnimations.size === 0) return;

    const animate = () => {
      const now = Date.now();
      let hasActiveAnimations = false;

      // Check if any animations are still active
      const updatedAnimations = new Map(zoneAnimations);
      zoneAnimations.forEach((startTime, key) => {
        if (now - startTime >= 1000) {
          // Animation complete, remove it
          updatedAnimations.delete(key);
        } else {
          hasActiveAnimations = true;
        }
      });

      // Update animations map if any completed
      if (updatedAnimations.size !== zoneAnimations.size) {
        setZoneAnimations(updatedAnimations);
      }

      // Continue animation loop if there are active animations
      if (hasActiveAnimations) {
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [zoneAnimations]);

  // Handle click
  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    // Don't place pixel if user was dragging
    if (!canvasRef.current || !config || hasMoved) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clickX = (e.clientX - rect.left - offset.x) / scale;
    const clickY = (e.clientY - rect.top - offset.y) / scale;

    const gridX = Math.floor(clickX / pixelSize);
    const gridY = Math.floor(clickY / pixelSize);

    if (gridX >= 0 && gridX < config.canvasWidth && gridY >= 0 && gridY < config.canvasHeight) {
      onPixelClick(gridX, gridY);
    }
  };

  // Handle drag
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setHasMoved(false);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !config) return;
    
    // Update hover preview
    if (!isDragging) {
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const mouseX = (e.clientX - rect.left - offset.x) / scale;
      const mouseY = (e.clientY - rect.top - offset.y) / scale;
      
      const gridX = Math.floor(mouseX / pixelSize);
      const gridY = Math.floor(mouseY / pixelSize);
      
      if (gridX >= 0 && gridX < config.canvasWidth && gridY >= 0 && gridY < config.canvasHeight) {
        setHoverPixel({ x: gridX, y: gridY });
      } else {
        setHoverPixel(null);
      }
      return;
    }
    
    // Mark as moved if mouse moved more than 5 pixels
    const deltaX = Math.abs(e.clientX - dragStart.x - offset.x);
    const deltaY = Math.abs(e.clientY - dragStart.y - offset.y);
    if (deltaX > 5 || deltaY > 5) {
      setHasMoved(true);
    }
    
    setOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    // Reset hasMoved after a short delay to allow click to fire
    setTimeout(() => setHasMoved(false), 10);
  };

  const handleMouseLeave = () => {
    setHoverPixel(null);
    setIsDragging(false);
  };

  // Zoom controls
  const zoomIn = useCallback(() => setScale((s) => Math.min(s * 1.2, 5)), []);
  const zoomOut = useCallback(() => setScale((s) => Math.max(s / 1.2, 0.5)), []);
  const resetView = useCallback(() => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
  }, []);

  // Expose controls via ref
  useEffect(() => {
    if (controlsRef) {
      controlsRef.current = { zoomIn, zoomOut, resetView };
    }
  }, [controlsRef, zoomIn, zoomOut, resetView]);

  // Notify zoom changes
  useEffect(() => {
    onZoomChange?.(scale);
  }, [scale, onZoomChange]);

  if (!config) {
    return <div className="flex items-center justify-center h-full">Loading...</div>;
  }

  return (
    <div className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className="border border-gray-300 cursor-crosshair"
        onClick={handleClick}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      />
      <div className="absolute bottom-4 right-4 flex gap-2">
        <button
          onClick={zoomIn}
          className="bg-white border border-gray-300 rounded px-3 py-1 hover:bg-gray-100"
        >
          +
        </button>
        <button
          onClick={zoomOut}
          className="bg-white border border-gray-300 rounded px-3 py-1 hover:bg-gray-100"
        >
          -
        </button>
        <button
          onClick={resetView}
          className="bg-white border border-gray-300 rounded px-3 py-1 hover:bg-gray-100"
        >
          Reset
        </button>
      </div>
    </div>
  );
};
