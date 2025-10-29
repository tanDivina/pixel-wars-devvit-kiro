# Security Middleware

This directory contains security middleware for the Pixel Wars server, implementing rate limiting, authentication, and input validation.

## Components

### Rate Limiting (`rateLimiter.ts`)

Implements token bucket rate limiting using Redis to prevent abuse.

**Features:**
- Configurable request limits and time windows
- Per-user rate limiting
- Automatic cleanup of old entries
- Fail-open behavior on Redis errors
- Separate limiters for different endpoint types

**Usage:**
```typescript
import { createPixelRateLimiter, createGeneralRateLimiter } from './middleware/rateLimiter';

const pixelRateLimiter = createPixelRateLimiter(redis);
const generalRateLimiter = createGeneralRateLimiter(redis);

// Apply to routes
router.post('/api/place-pixel', pixelRateLimiter.middleware(), handler);
router.get('/api/init', generalRateLimiter.middleware(), handler);
```

**Configuration:**
- Pixel placement: 10 requests per minute
- General API: 100 requests per minute

### Authentication (`auth.ts`)

Handles user authentication and context validation.

**Features:**
- Reddit user authentication via Devvit SDK
- Username attachment to request object
- PostId validation from context
- Proper error responses for auth failures

**Usage:**
```typescript
import { authenticateUser, validatePostId } from './middleware/auth';

router.use('/api/*', authenticateUser(reddit));
router.use('/api/*', validatePostId(context));
```

### Validation (`validation.ts`)

Provides input validation and sanitization middleware.

**Features:**
- Coordinate validation with bounds checking
- Timestamp validation
- String sanitization (control character removal)
- Content-type validation
- Request size validation
- Automatic type coercion and validation

**Usage:**
```typescript
import {
  validatePlacePixelRequest,
  validateCanvasUpdatesRequest,
  sanitizeRequestBody,
  validateContentType,
  validateRequestSize,
} from './middleware/validation';

// Apply to specific routes
router.post(
  '/api/place-pixel',
  validateContentType(['application/json']),
  validatePlacePixelRequest(config),
  handler
);

// Apply globally
app.use(sanitizeRequestBody());
app.use(validateRequestSize(4 * 1024 * 1024)); // 4MB limit
```

## Security Features

### 1. Rate Limiting
- Prevents spam and abuse
- Protects Redis from overload
- Different limits for different endpoints
- Per-user tracking

### 2. Input Validation
- Prevents injection attacks
- Ensures data integrity
- Type safety enforcement
- Bounds checking

### 3. Authentication
- Verifies user identity
- Prevents unauthorized access
- Integrates with Reddit authentication

### 4. Request Sanitization
- Removes control characters
- Limits string lengths
- Validates content types
- Enforces size limits

## Testing

All middleware components have comprehensive unit tests:

```bash
npx vitest run src/server/middleware --reporter=verbose
```

**Test Coverage:**
- Rate limiter: 11 tests
- Authentication: 5 tests
- Validation: 30 tests
- Total: 46 tests

## Error Handling

All middleware follows consistent error response format:

```typescript
{
  status: 'error',
  message: 'Human-readable error message',
  retryAfter?: number // For rate limiting
}
```

**HTTP Status Codes:**
- 400: Bad Request (validation errors)
- 401: Unauthorized (authentication failures)
- 413: Payload Too Large
- 415: Unsupported Media Type
- 429: Too Many Requests (rate limiting)

## Integration

The middleware is integrated into the server in the following order:

1. **Global middleware** (applied to all routes):
   - Body parsing with size limits
   - Request sanitization
   - Size validation

2. **API route middleware** (applied to `/api/*`):
   - Authentication
   - PostId validation

3. **Endpoint-specific middleware**:
   - Rate limiting (pixel or general)
   - Content-type validation
   - Request-specific validation

This layered approach ensures security at multiple levels while maintaining performance.

## Performance Considerations

- Rate limiter uses Redis sorted sets for O(log N) operations
- Validation happens before expensive operations
- Fail-open behavior prevents Redis issues from blocking requests
- Automatic cleanup of expired rate limit data

## Requirements Satisfied

This implementation satisfies the following requirements:

- **Requirement 10.5**: Redis transactions for concurrent updates
- **Requirement 11.4**: Rate limiting for 100+ concurrent users
- Input validation for all endpoints
- Security best practices for web applications
