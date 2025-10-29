import type { Request, Response, NextFunction } from 'express';
import type { RedditClient } from '@devvit/web/server';

/**
 * Middleware to authenticate user and attach username to request
 */
export const authenticateUser = (reddit: RedditClient) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const username = await reddit.getCurrentUsername();

      if (!username) {
        res.status(401).json({
          status: 'error',
          message: 'User not authenticated',
        });
        return;
      }

      // Attach username to request for use in other middleware
      (req as any).username = username;

      next();
    } catch (error) {
      console.error('Authentication error:', error);
      res.status(401).json({
        status: 'error',
        message: 'Authentication failed',
      });
    }
  };
};

/**
 * Middleware to validate postId from context
 */
export const validatePostId = (context: { postId?: string | `t3_${string}` | undefined }) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!context.postId) {
      res.status(400).json({
        status: 'error',
        message: 'postId is required but missing from context',
      });
      return;
    }

    // Attach postId to request for use in other middleware
    (req as any).postId = context.postId;

    next();
  };
};
