/**
 * Agent Engine Handler for Run SSE API Route
 *
 * Handles requests for Agent Engine deployment configuration.
 * This handler processes streaming JSON fragments from Agent Engine and converts them to SSE format.
 * Note: Agent Engine returns JSON fragments (not standard SSE), so we parse and reformat them.
 */

import { getEndpointForPath, getAuthHeaders } from "@/lib/config";
import {
  ProcessedStreamRequest,
  formatAgentEnginePayload,
  logStreamStart,
  logStreamResponse,
  SSE_HEADERS,
} from "./run-sse-common";
import {
  createInternalServerError,
  createBackendConnectionError,
} from "./error-utils";

/**
 * Agent Engine JSON Fragment Types
 * Based on the actual format Agent Engine returns
 */
interface AgentEngineContentPart {
  text?: string;
  thought?: boolean;
  function_call?: {
    name: string;
    args: Record<string, unknown>;
    id: string;
  };
  function_response?: {
    name: string;
    response: Record<string, unknown>;
    id: string;
  };
}

interface AgentEngineFragment {
  content?: {
    parts?: AgentEngineContentPart[];
  };
  role?: string;
  author?: string;
  usage_metadata?: {
    candidates_token_count?: number;
    prompt_token_count?: number;
    total_token_count?: number;
    thoughts_token_count?: number;
  };
  invocation_id?: string;
  actions?: {
    state_delta?: Record<string, unknown>;
    artifact_delta?: Record<string, unknown>;
    requested_auth_configs?: Record<string, unknown>;
  };
  isFinal?: boolean; // Added for the new processor
}

/**
 * Processes JSON fragments from Agent Engine streaming response.
 * Agent Engine sends a single large JSON object with parts.
 * We look for complete part objects and stream them immediately when found.
 *
 * IMPROVED VERSION: Uses native JSON.parse() instead of manual brace counting
 * for better reliability and performance.
 */
class JSONFragmentProcessor {
  private buffer: string = "";
  private currentAgent: string = "";
  private sentParts: Set<string> = new Set(); // Track sent parts by their content hash

  constructor(
    private controller: ReadableStreamDefaultController<Uint8Array>
  ) {}

  /**
   * Process incoming chunk of data from Agent Engine.
   * Accumulates chunks and looks for complete parts to stream immediately.
   */
  processChunk(chunk: string): void {
    console.log(`🔄 [JSON PROCESSOR] Processing chunk: ${chunk.length} bytes`);
    console.log(
      `📝 [JSON PROCESSOR] Full chunk content:`,
      JSON.stringify(chunk)
    );

    this.buffer += chunk;

    // Use improved part-level parsing approach
    this.extractCompletePartsFromBuffer();
  }

  /**
   * Extract complete part objects from buffer using JSON.parse()
   * Much simpler than manual brace counting - just try to parse incrementally!
   */
  private extractCompletePartsFromBuffer(): void {
    // Find the start of the parts array if we haven't found it yet
    const partsMatch = this.buffer.match(/"parts"\s*:\s*\[/);
    if (!partsMatch) {
      return; // No parts array found yet
    }

    const partsArrayStart = partsMatch.index! + partsMatch[0].length;
    const partsContent = this.buffer.substring(partsArrayStart);

    // Look for potential object starts and try to parse them
    let searchPos = 0;
    let parsedCount = 0;

    while (searchPos < partsContent.length && parsedCount < 100) { // Safety limit
      // Find the next potential object start
      const objStart = partsContent.indexOf("{", searchPos);
      if (objStart === -1) break; // No more objects to find

      // Try to parse increasingly larger substrings until we get a valid JSON
      let foundValidJson = false;
      
      for (let endPos = objStart + 1; endPos <= partsContent.length; endPos++) {
        const potentialJson = partsContent.substring(objStart, endPos);

        // Skip if it doesn't end with } - can't be complete JSON
        if (!potentialJson.endsWith("}")) continue;

        // Additional validation: check if it looks like a valid JSON structure
        if (!this.looksLikeValidJson(potentialJson)) continue;

        try {
          const part = JSON.parse(potentialJson);

          // Check if this is a valid part object with text, function_call, or function_response
          if (this.isValidPart(part)) {
            const partHash = this.hashPart(part);

            if (!this.sentParts.has(partHash)) {
              if (part.text) {
                console.log(
                  `✅ [JSON PROCESSOR] Found new text part (thought: ${
                    part.thought
                  }): ${part.text.substring(0, 100)}...`
                );
              } else if (part.function_call) {
                console.log(
                  `✅ [JSON PROCESSOR] Found new function call: ${part.function_call.name}`
                );
              } else if (part.function_response) {
                console.log(
                  `✅ [JSON PROCESSOR] Found new function response: ${part.function_response.name}`
                );
              }
              
              this.emitCompletePart(part);
              this.sentParts.add(partHash);
              parsedCount++;
            }
          }

          // Successfully parsed! Move search position past this object
          searchPos = objStart + potentialJson.length;
          foundValidJson = true;
          break; // Found a valid object, stop trying longer substrings
        } catch (parseError) {
          // Not valid JSON yet, try a longer substring
          // Only log if this looks like it should be valid JSON
          if (endPos === partsContent.length) {
            console.log("⚠️ [JSON PROCESSOR] Could not parse potential JSON fragment:", potentialJson.substring(0, 100) + "...");
          }
          continue;
        }
      }

      // If we couldn't parse anything starting from this position, move forward
      if (!foundValidJson) {
        searchPos = objStart + 1;
      }
    }

    if (parsedCount >= 100) {
      console.warn("⚠️ [JSON PROCESSOR] Hit safety limit of 100 parsed objects, stopping extraction");
    }
  }

  /**
   * Quick check if a string looks like it could be valid JSON
   * This helps avoid unnecessary parsing attempts
   */
  private looksLikeValidJson(str: string): boolean {
    // Basic checks for JSON structure
    if (!str.startsWith('{') || !str.endsWith('}')) return false;
    
    // Check for balanced braces (simple check)
    let braceCount = 0;
    let inString = false;
    let escapeNext = false;
    
    for (const char of str) {
      if (escapeNext) {
        escapeNext = false;
        continue;
      }
      
      if (char === '\\') {
        escapeNext = true;
        continue;
      }
      
      if (char === '"' && !escapeNext) {
        inString = !inString;
        continue;
      }
      
      if (!inString) {
        if (char === '{') braceCount++;
        else if (char === '}') braceCount--;
      }
    }
    
    return braceCount === 0;
  }

  /**
   * Create a simple hash of a part to detect duplicates
   */
  private hashPart(part: AgentEngineContentPart): string {
    // Handle different types of parts
    if (part.text) {
      // Use full text for better uniqueness and include position info
      const textHash = part.text.substring(0, 100) || "";
      return `text-${textHash}-${part.thought}-${textHash.length}`;
    } else if (part.function_call) {
      // Hash function calls by name, args, and id
      const argsHash = JSON.stringify(part.function_call.args).substring(0, 50);
      return `function_call-${part.function_call.name}-${part.function_call.id}-${argsHash}`;
    } else if (part.function_response) {
      // Hash function responses by name, response, and id
      const responseHash = JSON.stringify(part.function_response.response).substring(0, 50);
      return `function_response-${part.function_response.name}-${part.function_response.id}-${responseHash}`;
    } else {
      // Fallback for unknown part types
      return `unknown-${JSON.stringify(part).substring(0, 100)}`;
    }
  }

  /**
   * Check if a parsed object is a valid part (has text, function_call, or function_response)
   */
  private isValidPart(part: any): part is AgentEngineContentPart {
    return (
      (part.text && typeof part.text === "string") ||
      (part.function_call && typeof part.function_call === "object") ||
      (part.function_response && typeof part.function_response === "object")
    );
  }

  /**
   * Emit a complete part as SSE format to the frontend
   * Converts from Agent Engine JSON fragments to standard SSE format
   *
   * IMPROVED: Now outputs proper SSE format for unified processing
   */
  private emitCompletePart(part: AgentEngineContentPart): void {
    console.log(
      `📤 [JSON PROCESSOR] Emitting complete part as SSE format (thought: ${part.thought}):`,
      part.text?.substring(0, 200) +
        (part.text && part.text.length > 200 ? "..." : "")
    );

    // Handle function calls
    if (part.function_call) {
      console.log(`🔧 [JSON PROCESSOR] Emitting function call: ${part.function_call.name}`);
      
      const functionCallPart = {
        functionCall: {
          name: part.function_call.name,
          args: part.function_call.args,
          id: part.function_call.id,
        },
      };

      const sseData = {
        content: {
          parts: [functionCallPart],
        },
        author: this.currentAgent || "goal_planning_agent",
      };

      const sseEvent = `data: ${JSON.stringify(sseData)}\n\n`;
      this.controller.enqueue(Buffer.from(sseEvent));
      
      console.log(`✅ [JSON PROCESSOR] Successfully emitted function call as SSE format`);
      return;
    }

    // Handle function responses
    if (part.function_response) {
      console.log(`🔧 [JSON PROCESSOR] Emitting function response: ${part.function_response.name}`);
      
      const functionResponsePart = {
        functionResponse: {
          name: part.function_response.name,
          response: part.function_response.response,
          id: part.function_response.id,
        },
      };

      const sseData = {
        content: {
          parts: [functionResponsePart],
        },
        author: this.currentAgent || "goal_planning_agent",
      };

      const sseEvent = `data: ${JSON.stringify(sseData)}\n\n`;
      this.controller.enqueue(Buffer.from(sseEvent));
      
      console.log(`✅ [JSON PROCESSOR] Successfully emitted function response as SSE format`);
      return;
    }

    // Handle regular text parts (existing logic)
    if (part.text) {
      const sseData = {
        content: {
          parts: [part],
        },
        author: this.currentAgent || "goal_planning_agent",
      };

      // Convert to proper SSE format: data: {...}\n\n
      const sseEvent = `data: ${JSON.stringify(sseData)}\n\n`;
      this.controller.enqueue(Buffer.from(sseEvent));

      console.log(
        `✅ [JSON PROCESSOR] Successfully emitted complete part as SSE format`
      );
    }
  }

  /**
   * Process a complete JSON fragment (called when we have the full response)
   */
  processCompleteFragment(fragment: AgentEngineFragment): void {
    console.log(
      `✅ [JSON PROCESSOR] Processing complete fragment for agent: ${fragment.author}`
    );
    console.log(`📋 [JSON PROCESSOR] Complete fragment content:`, fragment);

    this.currentAgent = fragment.author || "goal_planning_agent";

    // Process the content parts from the complete fragment
    let newPartsEmitted = 0;
    if (fragment.content && fragment.content.parts) {
      console.log(`📝 [JSON PROCESSOR] Processing ${fragment.content.parts.length} parts from complete fragment`);
      
      for (const part of fragment.content.parts) {
        if (part.text && typeof part.text === "string") {
          const partHash = this.hashPart(part);
          
          // Only emit if we haven't sent this part already
          if (!this.sentParts.has(partHash)) {
            console.log(
              `📤 [JSON PROCESSOR] Emitting new part from complete fragment: ${part.text.substring(0, 100)}...`
            );
            this.emitCompletePart(part);
            this.sentParts.add(partHash);
            newPartsEmitted++;
          } else {
            console.log(
              `⏭️ [JSON PROCESSOR] Skipping duplicate part from complete fragment: ${part.text.substring(0, 100)}...`
            );
          }
        }
      }

      // If no new parts were emitted, but we have content, emit the complete response
      if (newPartsEmitted === 0 && fragment.content.parts.length > 0) {
        console.log(`📋 [JSON PROCESSOR] No new parts emitted, sending complete response as single message`);
        this.emitCompleteResponse(fragment);
      }
    } else {
      console.log(`⚠️ [JSON PROCESSOR] Complete fragment has no content parts to process`);
    }

    // Stream any additional data (actions, usage_metadata, etc.)
    if (
      fragment.actions ||
      fragment.usage_metadata ||
      fragment.invocation_id ||
      fragment.isFinal
    ) {
      const additionalData: Record<string, unknown> = {
        author: fragment.author || "goal_planning_agent",
      };

      if (fragment.actions) additionalData.actions = fragment.actions;
      if (fragment.usage_metadata)
        additionalData.usage_metadata = fragment.usage_metadata;
      if (fragment.invocation_id)
        additionalData.invocation_id = fragment.invocation_id;
      if (fragment.isFinal) additionalData.isFinal = fragment.isFinal;

      console.log(`📤 [JSON PROCESSOR] Emitting final metadata as SSE format`);
      const sseEvent = `data: ${JSON.stringify(additionalData)}\n\n`;
      // IMPROVED: Use Buffer.from() and emit SSE format
      this.controller.enqueue(Buffer.from(sseEvent));
    }

    // Log token usage if available
    if (fragment.usage_metadata) {
      console.log("📊 [JSON PROCESSOR] Token usage:", fragment.usage_metadata);
    }
  }

  /**
   * Emit the complete response as a single message
   * This is used when individual parts weren't captured during streaming
   */
  private emitCompleteResponse(fragment: AgentEngineFragment): void {
    if (!fragment.content || !fragment.content.parts) {
      return;
    }

    // Combine all text parts into a single response
    const completeText = fragment.content.parts
      .filter(part => part.text && typeof part.text === "string")
      .map(part => part.text)
      .join(" ")
      .trim();

    if (completeText) {
      console.log(`📤 [JSON PROCESSOR] Emitting complete response: ${completeText.substring(0, 200)}...`);

      // Create a synthetic part with the complete text
      const completePart: AgentEngineContentPart = {
        text: completeText,
        thought: false // This is the final output, not a thought
      };

      const sseData = {
        content: {
          parts: [completePart],
        },
        author: this.currentAgent || "goal_planning_agent",
      };

      // Convert to proper SSE format: data: {...}\n\n
      const sseEvent = `data: ${JSON.stringify(sseData)}\n\n`;
      this.controller.enqueue(Buffer.from(sseEvent));

      console.log(`✅ [JSON PROCESSOR] Successfully emitted complete response as SSE format`);
    }
  }

  /**
   * Finalize the stream processing
   */
  finalize(): void {
    console.log("🏁 [JSON PROCESSOR] Finalizing stream");
    console.log("📋 [JSON PROCESSOR] Final buffer content:", this.buffer.substring(0, 500) + "...");

    // Try to extract any remaining complete parts from the buffer
    this.extractCompletePartsFromBuffer();

    // Try to parse the entire buffer as a complete JSON object if it looks like one
    if (this.buffer.trim()) {
      const trimmedBuffer = this.buffer.trim();
      
      // Check if the buffer looks like a complete JSON object
      if (trimmedBuffer.startsWith('{') && trimmedBuffer.endsWith('}')) {
        try {
          console.log("🔍 [JSON PROCESSOR] Attempting to parse complete buffer as JSON");
          const fragment: AgentEngineFragment = JSON.parse(trimmedBuffer);
          this.processCompleteFragment(fragment);
          console.log("✅ [JSON PROCESSOR] Successfully parsed complete buffer");
          return;
        } catch (error) {
          console.log("⚠️ [JSON PROCESSOR] Buffer is not a complete JSON object, trying fragment extraction");
        }
      }

      // If direct parsing failed, try to extract the last complete JSON object
      this.extractLastCompleteJsonFromBuffer();
    }
  }

  /**
   * Extract the last complete JSON object from the buffer
   * This handles cases where the buffer contains partial JSON or multiple objects
   */
  private extractLastCompleteJsonFromBuffer(): void {
    const trimmedBuffer = this.buffer.trim();
    
    // Look for the last complete JSON object in the buffer
    let lastValidJson = '';
    let braceCount = 0;
    let inString = false;
    let escapeNext = false;
    let objectStart = -1;

    for (let i = 0; i < trimmedBuffer.length; i++) {
      const char = trimmedBuffer[i];

      if (escapeNext) {
        escapeNext = false;
        continue;
      }

      if (char === '\\') {
        escapeNext = true;
        continue;
      }

      if (char === '"' && !escapeNext) {
        inString = !inString;
        continue;
      }

      if (!inString) {
        if (char === '{') {
          if (braceCount === 0) {
            objectStart = i;
          }
          braceCount++;
        } else if (char === '}') {
          braceCount--;
          if (braceCount === 0 && objectStart !== -1) {
            // Found a complete JSON object
            const jsonCandidate = trimmedBuffer.substring(objectStart, i + 1);
            try {
              const parsed = JSON.parse(jsonCandidate);
              lastValidJson = jsonCandidate;
              console.log("✅ [JSON PROCESSOR] Found valid JSON fragment");
            } catch (error) {
              console.log("⚠️ [JSON PROCESSOR] Invalid JSON fragment, continuing search");
            }
          }
        }
      }
    }

    // If we found a valid JSON object, try to process it
    if (lastValidJson) {
      try {
        const fragment: AgentEngineFragment = JSON.parse(lastValidJson);
        this.processCompleteFragment(fragment);
        console.log("✅ [JSON PROCESSOR] Successfully processed extracted JSON fragment");
      } catch (error) {
        console.error("❌ [JSON PROCESSOR] Failed to process extracted JSON fragment:", error);
      }
    } else {
      console.log("⚠️ [JSON PROCESSOR] No valid JSON objects found in buffer, skipping finalization");
    }
  }
}

/**
 * Handle Agent Engine streaming request with JSON fragment processing
 *
 * @param requestData - Processed request data
 * @returns Streaming SSE Response with processed JSON fragments
 */
export async function handleAgentEngineStreamRequest(
  requestData: ProcessedStreamRequest
): Promise<Response> {
  console.log(
    "🚀🚀🚀 [AGENT ENGINE] NEW JSON FRAGMENT HANDLER STARTING 🚀🚀🚀"
  );
  console.log(
    `📊 [AGENT ENGINE] Request data:`,
    JSON.stringify(requestData, null, 2)
  );

  try {
    // Format payload for Agent Engine
    const agentEnginePayload = formatAgentEnginePayload(requestData);

    // Build Agent Engine URL with the streamQuery endpoint
    const agentEngineUrl = getEndpointForPath("", "streamQuery");

    // Log operation start
    logStreamStart(agentEngineUrl, agentEnginePayload, "agent_engine");

    // Get authentication headers
    const authHeaders = await getAuthHeaders();

    // Forward request to Agent Engine streaming endpoint
    const response = await fetch(agentEngineUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders,
      },
      body: JSON.stringify(agentEnginePayload),
    });

    // Log the response from Agent Engine
    logStreamResponse(
      response.status,
      response.statusText,
      response.headers,
      "agent_engine"
    );

    // Check for errors from Agent Engine
    if (!response.ok) {
      let errorDetails = `Agent Engine returned an error: ${response.status} ${response.statusText}`;
      try {
        const errorText = await response.text();
        console.error(`❌ Agent Engine error details:`, errorText);
        if (errorText) {
          errorDetails += `. ${errorText}`;
        }
      } catch (error) {
        // Response body might not be available or already consumed
        console.error(
          "An error occurred while trying to read the error response body from Agent Engine:",
          error
        );
      }
      return createBackendConnectionError(
        "agent_engine",
        response.status,
        response.statusText,
        errorDetails
      );
    }

    // Create streaming response that processes JSON fragments
    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) {
          controller.error(new Error("No readable stream from Agent Engine"));
          return;
        }

        console.log(
          "🚀🚀🚀 [AGENT ENGINE] Starting JSON fragment processing 🚀🚀🚀"
        );
        console.log(
          "📋 [AGENT ENGINE] This is the NEW handler with JSONFragmentProcessor"
        );

        // Initialize JSON fragment processor
        const processor = new JSONFragmentProcessor(controller);

        // Set up timeout mechanism (5 minutes max)
        const timeoutMs = 5 * 60 * 1000; // 5 minutes
        const startTime = Date.now();
        let isStreamActive = true;

        try {
          // Read and process JSON fragments using recursive pump pattern with timeout
          const pump = async (): Promise<void> => {
            // Check for timeout
            if (Date.now() - startTime > timeoutMs) {
              console.error("❌ [AGENT ENGINE] Stream timeout after 5 minutes");
              processor.finalize();
              controller.close();
              return;
            }

            if (!isStreamActive) {
              return;
            }

            const { done, value } = await reader.read();

            if (value) {
              const chunk = decoder.decode(value, { stream: true });
              console.log(
                `⏰ [STREAMING] Received chunk at ${new Date().toISOString()}, size: ${
                  chunk.length
                } bytes`
              );
              processor.processChunk(chunk);
            }

            if (done) {
              console.log("✅ [AGENT ENGINE] JSON fragment stream completed");
              processor.finalize();
              controller.close();
              isStreamActive = false;
              return;
            }

            // Continue processing next chunk
            return pump();
          };

          await pump();
        } catch (error) {
          console.error(
            "❌ [AGENT ENGINE] JSON fragment processing error:",
            error
          );

          // Attempt graceful error recovery
          try {
            processor.finalize();
          } catch (finalizeError) {
            console.error(
              "❌ [AGENT ENGINE] Error during finalization:",
              finalizeError
            );
          }

          controller.error(error);
        } finally {
          isStreamActive = false;
          reader.releaseLock();
        }
      },
    });

    // Return streaming SSE response with proper headers
    return new Response(stream, {
      status: 200,
      headers: SSE_HEADERS,
    });
  } catch (error) {
    console.error("❌ Agent Engine handler error:", error);

    if (error instanceof TypeError && error.message.includes("fetch")) {
      return createBackendConnectionError(
        "agent_engine",
        500,
        "Connection failed",
        "Failed to connect to Agent Engine"
      );
    }

    return createInternalServerError(
      "agent_engine",
      error,
      "Failed to process Agent Engine streaming request"
    );
  }
}
