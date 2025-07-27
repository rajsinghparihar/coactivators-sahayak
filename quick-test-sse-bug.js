#!/usr/bin/env node

/**
 * Quick Test: Agent Engine alt=sse Bug
 *
 * This script demonstrates that the alt=sse parameter doesn't work
 * as expected with Google Cloud Agent Engine.
 *
 * Usage:
 *   1. Set environment variables:
 *      export GOOGLE_CLOUD_PROJECT="your-project-id"
 *      export REASONING_ENGINE_ID="your-reasoning-engine-id"
 *   2. Run: node quick-test-sse-bug.js
 */

const { GoogleAuth } = require("google-auth-library");

async function testSSEBug() {
  console.log("🧪 Testing Agent Engine alt=sse parameter...\n");

  // Get config from environment
  const PROJECT = process.env.GOOGLE_CLOUD_PROJECT || "adk-deploy-465915";
  const REASONING_ENGINE_ID =
    process.env.REASONING_ENGINE_ID || "1348995214164885504";
  const LOCATION = "us-central1";

  if (!PROJECT || !REASONING_ENGINE_ID) {
    console.error("❌ Missing environment variables:");
    console.error("   GOOGLE_CLOUD_PROJECT:", !!PROJECT);
    console.error("   REASONING_ENGINE_ID:", !!REASONING_ENGINE_ID);
    process.exit(1);
  }

  try {
    // Authenticate with Application Default Credentials
    const auth = new GoogleAuth({
      scopes: ["https://www.googleapis.com/auth/cloud-platform"],
    });
    const accessToken = await auth.getAccessToken();
    console.log("✅ Authentication successful\n");

    // Test endpoint with alt=sse parameter
    const url = `https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT}/locations/${LOCATION}/reasoningEngines/${REASONING_ENGINE_ID}:streamQuery?alt=sse`;

    console.log("🔗 Testing URL:", url);
    console.log("📤 Expected: SSE format with Content-Type: text/event-stream");
    console.log("📤 Expected: Chunks like 'data: {json}\\n\\n'\n");

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        class_method: "stream_query",
        input: {
          user_id: "google-test-user",
          session_id: "test-session-" + Date.now(),
          message: "Just say 'hello world' - keep it simple",
        },
      }),
    });

    console.log("📥 Response Status:", response.status, response.statusText);
    console.log("📥 Content-Type:", response.headers.get("content-type"));
    console.log(
      "📥 Transfer-Encoding:",
      response.headers.get("transfer-encoding")
    );

    // Check if it's actually SSE format
    const contentType = response.headers.get("content-type");
    const isSSE = contentType?.includes("text/event-stream");

    console.log("\n🎯 Results:");
    if (isSSE) {
      console.log("✅ CORRECT: Content-Type is text/event-stream");
    } else {
      console.log(
        "❌ BUG: Content-Type is",
        contentType,
        "(should be text/event-stream)"
      );
    }

    // Read first chunk to check format
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    const { value } = await reader.read();
    const firstChunk = decoder.decode(value);

    console.log("\n📄 First chunk analysis:");
    console.log("   Length:", firstChunk.length, "bytes");
    console.log("   Starts with 'data:':", firstChunk.startsWith("data:"));
    console.log("   Contains SSE format:", firstChunk.includes("data:"));
    console.log("   Preview:", firstChunk.substring(0, 100) + "...");

    if (firstChunk.startsWith("data:")) {
      console.log("✅ CORRECT: Chunk follows SSE format");
    } else {
      console.log("❌ BUG: Chunk is raw JSON, not SSE format");
      console.log("   Expected: 'data: {\"content\": ...}'");
      console.log("   Actual:   Raw JSON starting with '{'");
    }

    // Try to parse as complete JSON (which it shouldn't be for proper SSE)
    try {
      JSON.parse(firstChunk);
      console.log(
        "❌ BUG: First chunk is complete JSON (SSE should be incremental)"
      );
    } catch (e) {
      console.log("✅ EXPECTED: First chunk is incomplete JSON fragment");
    }

    console.log("\n📊 Summary:");
    console.log("   alt=sse parameter:", "🔗 Present in URL");
    console.log("   Content-Type:", isSSE ? "✅ Correct" : "❌ Wrong");
    console.log(
      "   Chunk format:",
      firstChunk.startsWith("data:") ? "✅ SSE" : "❌ Raw JSON"
    );

    if (!isSSE || !firstChunk.startsWith("data:")) {
      console.log(
        "\n🐛 CONFIRMED: alt=sse parameter is not working correctly!"
      );
      console.log("   The API should return proper Server-Sent Events format.");
    } else {
      console.log("\n✅ SUCCESS: alt=sse parameter is working correctly!");
    }
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

// Run the test
testSSEBug();
