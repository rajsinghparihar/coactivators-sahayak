# Google Cloud Agent Engine: `alt=sse` Parameter Not Returning SSE Format

## Issue Summary
The `alt=sse` query parameter on Agent Engine `streamQuery` endpoint returns raw JSON chunks instead of Server-Sent Events format, despite the parameter suggesting SSE compatibility.

## Expected Behavior
When using `?alt=sse`, the response should follow standard SSE format:
```
Content-Type: text/event-stream

data: {"content": {"parts": [{"text": "Hello"}]}}

data: {"content": {"parts": [{"text": " world"}]}}

```

## Actual Behavior
The response returns `Content-Type: application/json` with raw JSON fragments:
```
Content-Type: application/json

Chunk 1: {"content": {"parts": [{"thought": true, "text": "Hello w...
Chunk 2: orld"}, "role": "model"}, "usage_metadata": {...
Chunk 3: }}
```

## Reproduction Steps

### Test Script
```javascript
const { GoogleAuth } = require("google-auth-library");

async function testAgentEngineSSE() {
  // Replace with your actual values
  const PROJECT = "your-project-id";
  const LOCATION = "us-central1";
  const REASONING_ENGINE_ID = "your-reasoning-engine-id";
  
  // Authenticate
  const auth = new GoogleAuth({
    scopes: ["https://www.googleapis.com/auth/cloud-platform"],
  });
  const accessToken = await auth.getAccessToken();

  // Test the streamQuery endpoint with alt=sse
  const url = `https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT}/locations/${LOCATION}/reasoningEngines/${REASONING_ENGINE_ID}:streamQuery?alt=sse`;
  
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      class_method: "stream_query",
      input: {
        user_id: "test-user",
        session_id: "test-session",
        message: "Say hello"
      }
    })
  });

  console.log("Content-Type:", response.headers.get("content-type"));
  console.log("Expected: text/event-stream");
  console.log("Actual:", response.headers.get("content-type")); // Shows: application/json

  // Read first chunk to show format
  const reader = response.body?.getReader();
  const decoder = new TextDecoder();
  const { value } = await reader.read();
  const firstChunk = decoder.decode(value);
  
  console.log("\nFirst chunk:");
  console.log("Expected SSE format: data: {\"content\": ...}");
  console.log("Actual format:", firstChunk.substring(0, 100) + "..."); // Shows raw JSON
}

testAgentEngineSSE();
```

### Observed Output
```bash
Content-Type: application/json
Expected: text/event-stream
Actual: application/json

First chunk:
Expected SSE format: data: {"content": ...}
Actual format: {"content": {"parts": [{"thought": true, "text": "Hello...
```

## Impact
This forces developers to implement complex JSON fragment parsing instead of using standard SSE libraries, making integration significantly more difficult.

## Comparison with Other Google APIs
Other Google APIs like Gemini properly respect `alt=sse`:
```bash
# Gemini API with alt=sse (works correctly)
curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:streamGenerateContent?alt=sse&key={API_KEY}" \
  -H 'Content-Type: application/json' \
  -d '{"contents":[{"parts":[{"text": "Hello"}]}]}'

# Returns proper SSE format:
# data: {"candidates":[{"content": {"parts": [{"text": "Hello"}]}}]}
```

## Environment
- **Agent Engine Location**: us-central1
- **API Version**: v1
- **Test Date**: January 2025

## Suggested Fix
The `alt=sse` parameter should format the response as proper Server-Sent Events with:
1. `Content-Type: text/event-stream`
2. Each JSON response wrapped in `data: {json}\n\n` format
3. Consistent with other Google API implementations

Let me know if you need any additional details or testing! 
 