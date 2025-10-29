import { describe, it, expect, vi } from 'vitest';
import {
  sanitizeString,
  validateCoordinates,
  validateTimestamp,
  validatePlacePixelRequest,
  validateCanvasUpdatesRequest,
  sanitizeRequestBody,
  validateContentType,
  validateRequestSize,
} from './validation';
import type { GameConfig } from '../../shared/types/game';

const mockConfig: GameConfig = {
  canvasWidth: 100,
  canvasHeight: 100,
  creditCooldown: 120,
  maxCredits: 10,
  initialCredits: 5,
  zoneSize: 10,
  teams: [],
};

describe('sanitizeString', () => {
  it('should remove control characters', () => {
    const input = 'hello\x00world\x1F';
    const result = sanitizeString(input);
    expect(result).toBe('helloworld');
  });

  it('should trim whitespace', () => {
    const input = '  hello world  ';
    const result = sanitizeString(input);
    expect(result).toBe('hello world');
  });

  it('should limit length', () => {
    const input = 'a'.repeat(200);
    const result = sanitizeString(input, 50);
    expect(result.length).toBe(50);
  });

  it('should handle non-string input', () => {
    const result = sanitizeString(123 as any);
    expect(result).toBe('');
  });
});

describe('validateCoordinates', () => {
  it('should validate correct coordinates', () => {
    const result = validateCoordinates(50, 50, mockConfig);
    expect(result.valid).toBe(true);
    expect(result.x).toBe(50);
    expect(result.y).toBe(50);
  });

  it('should reject non-integer coordinates', () => {
    const result = validateCoordinates(50.5, 50, mockConfig);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Coordinates must be integers');
  });

  it('should reject negative coordinates', () => {
    const result = validateCoordinates(-1, 50, mockConfig);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('X coordinate out of bounds');
  });

  it('should reject coordinates beyond canvas width', () => {
    const result = validateCoordinates(100, 50, mockConfig);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('X coordinate out of bounds');
  });

  it('should reject coordinates beyond canvas height', () => {
    const result = validateCoordinates(50, 100, mockConfig);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Y coordinate out of bounds');
  });

  it('should handle string numbers', () => {
    const result = validateCoordinates('50', '50', mockConfig);
    expect(result.valid).toBe(true);
    expect(result.x).toBe(50);
    expect(result.y).toBe(50);
  });

  it('should reject non-numeric strings', () => {
    const result = validateCoordinates('abc', '50', mockConfig);
    expect(result.valid).toBe(false);
  });
});

describe('validateTimestamp', () => {
  it('should validate correct timestamp', () => {
    const now = Date.now();
    const result = validateTimestamp(now);
    expect(result.valid).toBe(true);
    expect(result.timestamp).toBe(now);
  });

  it('should reject negative timestamps', () => {
    const result = validateTimestamp(-1);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Invalid timestamp');
  });

  it('should reject non-integer timestamps', () => {
    const result = validateTimestamp(123.456);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Invalid timestamp');
  });

  it('should reject timestamps too far in the future', () => {
    const futureTime = Date.now() + 120000; // 2 minutes in future
    const result = validateTimestamp(futureTime);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Timestamp is in the future');
  });

  it('should accept timestamps slightly in the future', () => {
    const nearFuture = Date.now() + 30000; // 30 seconds in future
    const result = validateTimestamp(nearFuture);
    expect(result.valid).toBe(true);
  });
});

describe('validatePlacePixelRequest middleware', () => {
  it('should pass valid request', () => {
    const middleware = validatePlacePixelRequest(mockConfig);
    const req = { body: { x: 50, y: 50 } } as any;
    const res = {} as any;
    const next = vi.fn();

    middleware(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(req.body.x).toBe(50);
    expect(req.body.y).toBe(50);
  });

  it('should reject missing coordinates', () => {
    const middleware = validatePlacePixelRequest(mockConfig);
    const req = { body: {} } as any;
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as any;
    const next = vi.fn();

    middleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'error',
        message: 'Missing required parameters: x, y',
      })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('should reject invalid coordinates', () => {
    const middleware = validatePlacePixelRequest(mockConfig);
    const req = { body: { x: -1, y: 50 } } as any;
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as any;
    const next = vi.fn();

    middleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
  });
});

describe('validateCanvasUpdatesRequest middleware', () => {
  it('should pass valid timestamp', () => {
    const middleware = validateCanvasUpdatesRequest();
    const req = { query: { since: '1000' } } as any;
    const res = {} as any;
    const next = vi.fn();

    middleware(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('should default to 0 if timestamp missing', () => {
    const middleware = validateCanvasUpdatesRequest();
    const req = { query: {} } as any;
    const res = {} as any;
    const next = vi.fn();

    middleware(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(req.query.since).toBe('0');
  });

  it('should reject invalid timestamp', () => {
    const middleware = validateCanvasUpdatesRequest();
    const req = { query: { since: '-1' } } as any;
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as any;
    const next = vi.fn();

    middleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
  });
});

describe('sanitizeRequestBody middleware', () => {
  it('should sanitize string fields', () => {
    const middleware = sanitizeRequestBody();
    const req = {
      body: {
        name: '  hello\x00world  ',
        value: 123,
      },
    } as any;
    const res = {} as any;
    const next = vi.fn();

    middleware(req, res, next);
    expect(req.body.name).toBe('helloworld');
    expect(req.body.value).toBe(123);
    expect(next).toHaveBeenCalled();
  });

  it('should handle empty body', () => {
    const middleware = sanitizeRequestBody();
    const req = {} as any;
    const res = {} as any;
    const next = vi.fn();

    middleware(req, res, next);
    expect(next).toHaveBeenCalled();
  });
});

describe('validateContentType middleware', () => {
  it('should allow valid content type', () => {
    const middleware = validateContentType(['application/json']);
    const req = {
      get: vi.fn().mockReturnValue('application/json'),
    } as any;
    const res = {} as any;
    const next = vi.fn();

    middleware(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('should reject invalid content type', () => {
    const middleware = validateContentType(['application/json']);
    const req = {
      get: vi.fn().mockReturnValue('text/plain'),
    } as any;
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as any;
    const next = vi.fn();

    middleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(415);
    expect(next).not.toHaveBeenCalled();
  });

  it('should allow missing content type', () => {
    const middleware = validateContentType(['application/json']);
    const req = {
      get: vi.fn().mockReturnValue(undefined),
    } as any;
    const res = {} as any;
    const next = vi.fn();

    middleware(req, res, next);
    expect(next).toHaveBeenCalled();
  });
});

describe('validateRequestSize middleware', () => {
  it('should allow requests under size limit', () => {
    const middleware = validateRequestSize(1000);
    const req = {
      get: vi.fn().mockReturnValue('500'),
    } as any;
    const res = {} as any;
    const next = vi.fn();

    middleware(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('should reject requests over size limit', () => {
    const middleware = validateRequestSize(1000);
    const req = {
      get: vi.fn().mockReturnValue('2000'),
    } as any;
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as any;
    const next = vi.fn();

    middleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(413);
    expect(next).not.toHaveBeenCalled();
  });

  it('should allow requests without content-length', () => {
    const middleware = validateRequestSize(1000);
    const req = {
      get: vi.fn().mockReturnValue(undefined),
    } as any;
    const res = {} as any;
    const next = vi.fn();

    middleware(req, res, next);
    expect(next).toHaveBeenCalled();
  });
});
