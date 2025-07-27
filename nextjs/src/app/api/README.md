# Next.js API Routes - Backend Proxy

This directory contains API routes that proxy requests to the Python backend server.

## Available Routes

### Session Management
- **POST** `/api/apps/app/users/[userId]/sessions/[sessionId]`
  - Creates a new chat session
  - Proxies to: `{BACKEND_URL}/apps/app/users/{userId}/sessions/{sessionId}`

### Goal Planning
- **POST** `/api/goal-planning`
  - Main goal planning endpoint
  - Proxies to: `{BACKEND_URL}/run` (for ADK backend)
  - Handles goal input and returns structured planning response

### Chat Streaming
- **POST** `/api/run_sse`
  - Server-Sent Events endpoint for real-time chat
  - Proxies to: `{BACKEND_URL}/run_sse`
  - Handles streaming responses from AI agents

## Configuration

### Environment Variables
Set the following environment variable to configure the backend URL:

```bash
BACKEND_URL=http://127.0.0.1:8000
```

If not set, defaults to `http://127.0.0.1:8000`.

### Development Setup
1. Ensure the Python backend is running on the configured port
2. The Next.js development server will proxy API requests automatically
3. All routes include proper error handling and CORS headers

## Configuration System

The `/src/lib/config.ts` file provides:
- Environment detection (local, Agent Engine, Cloud Run)
- Dynamic endpoint configuration
- Authentication header management
- Deployment-specific routing

## Error Handling

All routes include:
- Proper error responses with HTTP status codes
- Request forwarding with authentication headers
- Comprehensive logging for debugging
- Graceful fallbacks for backend unavailability 
