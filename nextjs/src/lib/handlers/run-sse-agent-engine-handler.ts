/**
 * Agent Engine Handler for Run SSE API Route
 *
 * Handles requests for Agent Engine deployment configuration.
 * This handler processes JSON fragments from Agent Engine and converts them to SSE format.
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
import { getEventTitle } from "@/lib/streaming/stream-utils";

/**
 * Agent Engine JSON Fragment Types
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
  isFinal?: boolean;
}

/**
 * Simple JSON Fragment Processor for Agent Engine
 * Processes JSON fragments and converts them to SSE format
 */
class SimpleJSONFragmentProcessor {
  private buffer: string = "";
  private currentAgent: string = "";

  constructor(
    private controller: ReadableStreamDefaultController<Uint8Array>
  ) {}

  /**
   * Process incoming chunk of data from Agent Engine
   */
  processChunk(chunk: string): void {
    console.log(`🔄 [JSON PROCESSOR] Processing chunk: ${chunk.length} bytes`);
    this.buffer += chunk;

    // Try to extract complete JSON objects from buffer
    this.extractCompleteJsonObjects();
  }

  /**
   * Extract complete JSON objects from buffer and emit them as SSE
   */
  private extractCompleteJsonObjects(): void {
    const trimmedBuffer = this.buffer.trim();
    
    // Look for complete JSON objects in the buffer
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
              const fragment: AgentEngineFragment = JSON.parse(jsonCandidate);
              this.processFragment(fragment);
              
              // Remove the processed JSON from buffer
              this.buffer = trimmedBuffer.substring(i + 1);
              return; // Process one object at a time
            } catch (error) {
              console.log("⚠️ [JSON PROCESSOR] Invalid JSON fragment, continuing search");
            }
          }
        }
      }
    }
  }

  /**
   * Process a complete JSON fragment and emit as SSE
   */
  private processFragment(fragment: AgentEngineFragment): void {
    console.log(`✅ [JSON PROCESSOR] Processing fragment for agent: ${fragment.author}`);

    this.currentAgent = fragment.author || "sahayak";

    // Process content parts
    if (fragment.content && fragment.content.parts) {
      for (const part of fragment.content.parts) {
        this.emitPart(part);
      }
    }

    // Emit additional metadata
    if (fragment.actions || fragment.usage_metadata || fragment.invocation_id || fragment.isFinal) {
      const agentName = fragment.author || "sahayak";
      const eventTitle = getEventTitle(agentName);
      
      const additionalData: Record<string, unknown> = {
        author: agentName,
        eventTitle: eventTitle,
      };

      if (fragment.actions) additionalData.actions = fragment.actions;
      if (fragment.usage_metadata) additionalData.usage_metadata = fragment.usage_metadata;
      if (fragment.invocation_id) additionalData.invocation_id = fragment.invocation_id;
      if (fragment.isFinal) additionalData.isFinal = fragment.isFinal;

      const sseEvent = `data: ${JSON.stringify(additionalData)}\n\n`;
      this.controller.enqueue(Buffer.from(sseEvent));
    }
  }

  /**
   * Emit a part as SSE format
   */
  private emitPart(part: AgentEngineContentPart): void {
    const agentName = this.currentAgent || "sahayak";
    const eventTitle = getEventTitle(agentName);
    
    if (part.text) {
      console.log(`📤 [JSON PROCESSOR] Emitting text part: ${part.text.substring(0, 100)}...`);
      
      const sseData = {
        content: {
          parts: [part],
        },
        author: agentName,
        eventTitle: eventTitle,
      };

      const sseEvent = `data: ${JSON.stringify(sseData)}\n\n`;
      this.controller.enqueue(Buffer.from(sseEvent));
    } else if (part.function_call) {
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
        author: agentName,
        eventTitle: eventTitle,
      };

      const sseEvent = `data: ${JSON.stringify(sseData)}\n\n`;
      this.controller.enqueue(Buffer.from(sseEvent));
    } else if (part.function_response) {
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
        author: agentName,
        eventTitle: eventTitle,
      };

      const sseEvent = `data: ${JSON.stringify(sseData)}\n\n`;
      this.controller.enqueue(Buffer.from(sseEvent));
    }
  }

  /**
   * Finalize processing
   */
  finalize(): void {
    console.log("🏁 [JSON PROCESSOR] Finalizing stream");
    
    // Try to process any remaining JSON in buffer
    if (this.buffer.trim()) {
      this.extractCompleteJsonObjects();
    }
  }
}

/**
 * Handle Agent Engine streaming request
 *
 * @param requestData - Processed request data
 * @returns SSE streaming Response
 */
export async function handleAgentEngineStreamRequest(
  requestData: ProcessedStreamRequest
): Promise<Response> {
  console.log(
    "🚀🚀🚀 [AGENT ENGINE] SIMPLIFIED JSON FRAGMENT HANDLER STARTING 🚀🚀🚀"
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

        console.log("🚀🚀🚀 [AGENT ENGINE] Starting simplified JSON fragment processing 🚀🚀🚀");

        // Initialize simplified JSON fragment processor
        const processor = new SimpleJSONFragmentProcessor(controller);

        // Set up timeout mechanism (5 minutes max)
        const timeoutMs = 5 * 60 * 1000; // 5 minutes
        const startTime = Date.now();
        let isStreamActive = true;

        try {
          // Read and process JSON fragments
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
          console.error("❌ [AGENT ENGINE] JSON fragment processing error:", error);

          // Attempt graceful error recovery
          try {
            processor.finalize();
          } catch (finalizeError) {
            console.error("❌ [AGENT ENGINE] Error during finalization:", finalizeError);
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
