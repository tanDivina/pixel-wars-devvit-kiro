import type { Request, Response, NextFunction } from 'express';
import type { GameConfig } from '../../shared/types/game';

/**
 * Sanitize a string by removing potentially dangerous characters
 */
export const sanitizeString = (input: string, maxLength: number = 100): string => {
  if (typeof input !== 'string') {
    return '';
  }

  // Remove control characters and limit length
  return input
    .replace(/[\x00-\x1F\x7F]/g, '')
    .trim()
    .slice(0, maxLength);
};

/**
 * Validate and sanitize coordinates
 */
export const validateCoordinates = (
  x: any,
  y: any,
  config: GameConfig
): { valid: boolean; x?: number; y?: number; error?: string } => {
  // Check if coordinates are numbers
  const xNum = Number(x);
  const yNum = Number(y);

  if (!Number.isInteger(xNum) || !Number.isInteger(yNum)) {
    return { valid: false, error: 'Coordinates must be integers' };
  }

  // Check bounds
  if (xNum < 0 || xNum >= config.canvasWidth) {
    return { valid: false, error: 'X coordinate out of bounds' };
  }

  if (yNum < 0 || yNum >= config.canvasHeight) {
    return { valid: false, error: 'Y coordinate out of bounds' };
  }

  return { valid: true, x: xNum, y: yNum };
};

/**
 * Validate timestamp parameter
 */
export const validateTimestamp = (timestamp: any): { valid: boolean; timestamp?: number; error?: string } => {
  const ts = Number(timestamp);

  if (!Number.isInteger(ts) || ts < 0) {
    return { valid: false, error: 'Invalid timestamp' };
  }

  // Check if timestamp is not too far in the future (allow 1 minute buffer)
  const maxTimestamp = Date.now() + 60000;
  if (ts > maxTimestamp) {
    return { valid: false, error: 'Timestamp is in the future' };
  }

  return { valid: true, timestamp: ts };
};

/**
 * Middleware to validate place-pixel request
 */
export const validatePlacePixelRequest = (config: GameConfig) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { x, y } = req.body;

    if (x === undefined || y === undefined) {
      res.status(400).json({
        status: 'error',
        message: 'Missing required parameters: x, y',
      });
      return;
    }

    const validation = validateCoordinates(x, y, config);
    if (!validation.valid) {
      res.status(400).json({
        status: 'error',
        message: validation.error,
      });
      return;
    }

    // Store validated coordinates
    req.body.x = validation.x;
    req.body.y = validation.y;

    next();
  };
};

/**
 * Middleware to validate canvas-updates request
 */
export const validateCanvasUpdatesRequest = () => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const since = req.query.since;

    if (since === undefined) {
      // Default to 0 if not provided
      req.query.since = '0';
      next();
      return;
    }

    const validation = validateTimestamp(since);
    if (!validation.valid) {
      res.status(400).json({
        status: 'error',
        message: validation.error,
      });
      return;
    }

    req.query.since = validation.timestamp!.toString();
    next();
  };
};

/**
 * Middleware to sanitize request body
 */
export const sanitizeRequestBody = () => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (req.body && typeof req.body === 'object') {
      for (const key in req.body) {
        if (typeof req.body[key] === 'string') {
          req.body[key] = sanitizeString(req.body[key]);
        }
      }
    }
    next();
  };
};

/**
 * Middleware to validate content type
 */
export const validateContentType = (allowedTypes: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentType = req.get('content-type');

    if (!contentType) {
      next();
      return;
    }

    const isAllowed = allowedTypes.some((type) => contentType.includes(type));

    if (!isAllowed) {
      res.status(415).json({
        status: 'error',
        message: 'Unsupported content type',
      });
      return;
    }

    next();
  };
};

/**
 * Middleware to validate request size
 */
export const validateRequestSize = (maxSizeBytes: number) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = req.get('content-length');

    if (contentLength && parseInt(contentLength) > maxSizeBytes) {
      res.status(413).json({
        status: 'error',
        message: 'Request payload too large',
      });
      return;
    }

    next();
  };
};
