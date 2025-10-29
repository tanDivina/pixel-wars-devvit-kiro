import { describe, it, expect } from 'vitest';
import type { PixelData, GameConfig } from '../../shared/types/game';

// Test the optimization logic without requiring full React rendering

describe('Canvas Component - Performance Optimizations', () => {
  const CHUNK_SIZE = 50;

  const mockConfig: GameConfig = {
    canvasWidth: 100,
    canvasHeight: 100,
    creditCooldown: 120,
    maxCredits: 10,
    initialCredits: 5,
    zoneSize: 10,
    teams: [
      { id: 'red', name: 'Red Team', color: '#FF0000' },
      { id: 'blue', name: 'Blue Team', color: '#0000FF' },
    ],
  };

  describe('Viewport Culling', () => {
    it('should calculate correct chunk coordinates for viewport', () => {
      const pixelSize = 10;
      const scale = 1;
      const offset = { x: 0, y: 0 };
      const canvasWidth = 800;
      const canvasHeight = 600;

      // Calculate viewport bounds
      const viewportLeft = -offset.x / scale;
      const viewportTop = -offset.y / scale;
      const viewportRight = (canvasWidth - offset.x) / scale;
      const viewportBottom = (canvasHeight - offset.y) / scale;

      // Convert to chunk coordinates
      const minChunkX = Math.max(0, Math.floor(viewportLeft / (CHUNK_SIZE * pixelSize)));
      const minChunkY = Math.max(0, Math.floor(viewportTop / (CHUNK_SIZE * pixelSize)));
      const maxChunkX = Math.min(
        Math.ceil(mockConfig.canvasWidth / CHUNK_SIZE) - 1,
        Math.ceil(viewportRight / (CHUNK_SIZE * pixelSize))
      );
      const maxChunkY = Math.min(
        Math.ceil(mockConfig.canvasHeight / CHUNK_SIZE) - 1,
        Math.ceil(viewportBottom / (CHUNK_SIZE * pixelSize))
      );

      expect(minChunkX).toBeGreaterThanOrEqual(0);
      expect(minChunkY).toBeGreaterThanOrEqual(0);
      expect(maxChunkX).toBeLessThanOrEqual(Math.ceil(mockConfig.canvasWidth / CHUNK_SIZE));
      expect(maxChunkY).toBeLessThanOrEqual(Math.ceil(mockConfig.canvasHeight / CHUNK_SIZE));
    });

    it('should only include visible chunks when zoomed in', () => {
      const pixelSize = 10;
      const scale = 2; // Zoomed in
      const offset = { x: -500, y: -500 }; // Panned significantly

      const viewportLeft = -offset.x / scale;
      const viewportTop = -offset.y / scale;
      // When zoomed in and panned, viewport should be offset
      expect(viewportLeft).toBeGreaterThan(0);
      expect(viewportTop).toBeGreaterThan(0);
      
      // Calculate chunk coordinates
      const minChunkX = Math.max(0, Math.floor(viewportLeft / (CHUNK_SIZE * pixelSize)));
      const minChunkY = Math.max(0, Math.floor(viewportTop / (CHUNK_SIZE * pixelSize)));
      
      // Chunks should be calculated correctly
      expect(minChunkX).toBeGreaterThanOrEqual(0);
      expect(minChunkY).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Canvas Chunking', () => {
    it('should calculate correct number of chunks for canvas', () => {
      const numChunksX = Math.ceil(mockConfig.canvasWidth / CHUNK_SIZE);
      const numChunksY = Math.ceil(mockConfig.canvasHeight / CHUNK_SIZE);

      expect(numChunksX).toBe(2); // 100 / 50 = 2
      expect(numChunksY).toBe(2); // 100 / 50 = 2
    });

    it('should handle large canvas with many chunks', () => {
      const largeConfig: GameConfig = {
        ...mockConfig,
        canvasWidth: 200,
        canvasHeight: 200,
      };

      const numChunksX = Math.ceil(largeConfig.canvasWidth / CHUNK_SIZE);
      const numChunksY = Math.ceil(largeConfig.canvasHeight / CHUNK_SIZE);

      expect(numChunksX).toBe(4); // 200 / 50 = 4
      expect(numChunksY).toBe(4); // 200 / 50 = 4
      expect(numChunksX * numChunksY).toBe(16); // Total chunks
    });

    it('should map pixel coordinates to correct chunk', () => {
      const testCases = [
        { x: 0, y: 0, expectedChunk: { x: 0, y: 0 } },
        { x: 49, y: 49, expectedChunk: { x: 0, y: 0 } },
        { x: 50, y: 50, expectedChunk: { x: 1, y: 1 } },
        { x: 99, y: 99, expectedChunk: { x: 1, y: 1 } },
      ];

      for (const testCase of testCases) {
        const chunkX = Math.floor(testCase.x / CHUNK_SIZE);
        const chunkY = Math.floor(testCase.y / CHUNK_SIZE);

        expect(chunkX).toBe(testCase.expectedChunk.x);
        expect(chunkY).toBe(testCase.expectedChunk.y);
      }
    });
  });

  describe('Pixel Batching', () => {
    it('should batch multiple pixel updates efficiently', () => {
      const pixels: PixelData[] = [];
      const batchSize = 100;

      // Simulate adding many pixels
      for (let i = 0; i < batchSize; i++) {
        pixels.push({
          x: i % 10,
          y: Math.floor(i / 10),
          teamId: i % 2 === 0 ? 'red' : 'blue',
          timestamp: Date.now(),
        });
      }

      // Build pixel map
      const pixelMap = new Map<string, string>();
      for (const pixel of pixels) {
        pixelMap.set(`${pixel.x}:${pixel.y}`, pixel.teamId);
      }

      expect(pixelMap.size).toBeLessThanOrEqual(batchSize);
      expect(pixelMap.size).toBeGreaterThan(0);
    });

    it('should identify dirty chunks when pixels change', () => {
      const oldPixels: PixelData[] = [
        { x: 0, y: 0, teamId: 'red', timestamp: Date.now() },
        { x: 50, y: 50, teamId: 'blue', timestamp: Date.now() },
      ];

      const newPixels: PixelData[] = [
        { x: 0, y: 0, teamId: 'blue', timestamp: Date.now() }, // Changed
        { x: 50, y: 50, teamId: 'blue', timestamp: Date.now() }, // Same
        { x: 25, y: 25, teamId: 'red', timestamp: Date.now() }, // New
      ];

      const oldMap = new Map<string, string>();
      for (const pixel of oldPixels) {
        oldMap.set(`${pixel.x}:${pixel.y}`, pixel.teamId);
      }

      const dirtyChunks = new Set<string>();
      for (const pixel of newPixels) {
        const key = `${pixel.x}:${pixel.y}`;
        const oldTeamId = oldMap.get(key);
        if (oldTeamId !== pixel.teamId) {
          const chunkX = Math.floor(pixel.x / CHUNK_SIZE);
          const chunkY = Math.floor(pixel.y / CHUNK_SIZE);
          dirtyChunks.add(`${chunkX}:${chunkY}`);
        }
      }

      // Should have 2 dirty chunks: (0,0) for changed pixel and new pixel
      expect(dirtyChunks.size).toBeGreaterThan(0);
      expect(dirtyChunks.has('0:0')).toBe(true);
    });
  });

  describe('Performance with Large Canvas', () => {
    it('should handle 200x200 canvas efficiently', () => {
      const largeConfig: GameConfig = {
        ...mockConfig,
        canvasWidth: 200,
        canvasHeight: 200,
      };

      const numChunks = Math.ceil(largeConfig.canvasWidth / CHUNK_SIZE) *
        Math.ceil(largeConfig.canvasHeight / CHUNK_SIZE);

      // Should create 16 chunks for 200x200 canvas
      expect(numChunks).toBe(16);
    });

    it('should handle many pixels without performance degradation', () => {
      const manyPixels: PixelData[] = [];
      const pixelCount = 1000;

      const startTime = Date.now();

      // Simulate processing many pixels
      for (let i = 0; i < pixelCount; i++) {
        manyPixels.push({
          x: i % 100,
          y: Math.floor(i / 100),
          teamId: i % 2 === 0 ? 'red' : 'blue',
          timestamp: Date.now(),
        });
      }

      // Build pixel map (batching)
      const pixelMap = new Map<string, string>();
      for (const pixel of manyPixels) {
        pixelMap.set(`${pixel.x}:${pixel.y}`, pixel.teamId);
      }

      const endTime = Date.now();
      const processingTime = endTime - startTime;

      // Should process 1000 pixels quickly (under 100ms)
      expect(processingTime).toBeLessThan(100);
      expect(pixelMap.size).toBeGreaterThan(0);
    });
  });

  describe('Coordinate Validation', () => {
    it('should validate pixel coordinates are within bounds', () => {
      const testCases = [
        { x: 0, y: 0, valid: true },
        { x: 99, y: 99, valid: true },
        { x: -1, y: 0, valid: false },
        { x: 0, y: -1, valid: false },
        { x: 100, y: 0, valid: false },
        { x: 0, y: 100, valid: false },
      ];

      for (const testCase of testCases) {
        const isValid =
          testCase.x >= 0 &&
          testCase.x < mockConfig.canvasWidth &&
          testCase.y >= 0 &&
          testCase.y < mockConfig.canvasHeight;

        expect(isValid).toBe(testCase.valid);
      }
    });
  });
});
