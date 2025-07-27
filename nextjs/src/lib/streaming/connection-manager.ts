/**
 * Connection Manager
 *
 * This module handles SSE streaming connection lifecycle management including
 * connection establishment, data streaming, error handling, and cleanup.
 */

import { v4 as uuidv4 } from "uuid";
import { RefObject } from "react";
import { Message } from "@/types";
import {
  SSEConnectionState,
  StreamProcessingCallbacks,
  StreamingAPIPayload,
  ConnectionManagerOptions,
} from "./types";
import { processSseEventData } from "./stream-processor";
import { createDebugLog } from "@/lib/handlers/run-sse-common";

/**
 * Manages SSE streaming connections
 */
export class StreamingConnectionManager {
  private connectionState: SSEConnectionState = "idle";
  private retryFn: <T>(fn: () => Promise<T>) => Promise<T>;
  private endpoint: string;
  private abortController: AbortController | null = null;

  constructor(options: ConnectionManagerOptions = {}) {
    this.retryFn = options.retryFn || ((fn) => fn());
    this.endpoint = options.endpoint || "/api/run_sse";
  }

  /**
   * Gets the current connection state
   */
  public getConnectionState(): SSEConnectionState {
    return this.connectionState;
  }

  /**
   * Starts a streaming connection and processes SSE events in real-time
   *
   * @param apiPayload - API request payload
   * @param callbacks - Stream processing callbacks
   * @param accumulatedTextRef - Reference to accumulated text
   * @param currentAgentRef - Reference to current agent state
   * @param setCurrentAgent - Agent state setter
   * @param setIsLoading - Loading state setter
   * @returns Promise that resolves when streaming completes
   */
  public async submitMessage(
    apiPayload: StreamingAPIPayload,
    callbacks: StreamProcessingCallbacks,
    accumulatedTextRef: RefObject<string>,
    currentAgentRef: RefObject<string>,
    setCurrentAgent: (agent: string) => void,
    setIsLoading: (loading: boolean) => void
  ): Promise<void> {
    this.connectionState = "connecting";
    setIsLoading(true);
    accumulatedTextRef.current = "";
    currentAgentRef.current = "";
    this.abortController = new AbortController();

    // Generate AI message ID
    const aiMessageId = uuidv4();

    // Create initial AI message
    const initialAiMessage: Message = {
      type: "ai",
      content: "",
      id: aiMessageId,
      timestamp: new Date(),
    };
    callbacks.onMessageUpdate(initialAiMessage);

    try {
      createDebugLog(
        "CONNECTION",
        "Sending API request with payload",
        apiPayload
      );

      const response = await this.retryFn(() =>
        fetch(this.endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(apiPayload),
          signal: this.abortController?.signal,
        })
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      this.connectionState = "connected";

      // Handle SSE streaming with proper event processing
      await this.handleSSEStream(
        response,
        aiMessageId,
        callbacks,
        accumulatedTextRef,
        currentAgentRef,
        setCurrentAgent
      );

      this.connectionState = "idle";
      setIsLoading(false);
    } catch (error) {
      if ((error as Error).name === "AbortError") {
        this.connectionState = "closed";
        createDebugLog("CONNECTION", "Request was cancelled by the user");
      } else {
        this.connectionState = "error";
        createDebugLog("CONNECTION", "Streaming error", error);
      }

      const errorMessage: Message = {
        type: "ai",
        content:
          (error as Error).name === "AbortError"
            ? "Request cancelled."
            : `Sorry, there was an error processing your request: ${
                error instanceof Error ? error.message : "Unknown error"
              }`,
        id: uuidv4(),
        timestamp: new Date(),
      };
      callbacks.onMessageUpdate(errorMessage);
      setIsLoading(false);
    } finally {
      this.abortController = null;
    }
  }

  /**
   * Cancels the current streaming connection
   *
   * @param accumulatedTextRef - Reference to accumulated text (for cleanup)
   * @param currentAgentRef - Reference to current agent state (for cleanup)
   * @param setCurrentAgent - Agent state setter (for cleanup)
   * @param setIsLoading - Loading state setter
   */
  public cancelRequest(
    accumulatedTextRef: RefObject<string>,
    currentAgentRef: RefObject<string>,
    setCurrentAgent: (agent: string) => void,
    setIsLoading: (loading: boolean) => void
  ): void {
    if (this.abortController) {
      this.abortController.abort();
    }
    this.connectionState = "closed";
    setIsLoading(false);

    // Clear any accumulated state
    accumulatedTextRef.current = "";
    currentAgentRef.current = "";
    setCurrentAgent("");
  }

  /**
   * Handle SSE streaming from both local backend and Agent Engine
   * Both backends now send standard SSE format (text/event-stream)
   *
   * @param response - Fetch response with SSE stream
   * @param aiMessageId - AI message ID for updates
   * @param callbacks - Stream processing callbacks
   * @param accumulatedTextRef - Reference to accumulated text
   * @param currentAgentRef - Reference to current agent state
   * @param setCurrentAgent - Agent state setter
   */
  private async handleSSEStream(
    response: Response,
    aiMessageId: string,
    callbacks: StreamProcessingCallbacks,
    accumulatedTextRef: RefObject<string>,
    currentAgentRef: RefObject<string>,
    setCurrentAgent: (agent: string) => void
  ): Promise<void> {
    createDebugLog("SSE START", "Starting SSE stream processing");

    if (!response.body) {
      throw new Error("Response body is null");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    let lineBuffer = "";
    let eventDataBuffer = "";
    let processedFinalEvent = false; // Flag to prevent duplicate final event processing

    const pump = async (): Promise<void> => {
      const { done, value } = await reader.read();

      if (value) {
        lineBuffer += decoder.decode(value, { stream: true });
      }

      let eolIndex: number;
      while (
        (eolIndex = lineBuffer.indexOf("\n")) >= 0 ||
        (done && lineBuffer.length > 0)
      ) {
        const line = done && eolIndex < 0 ? lineBuffer : lineBuffer.slice(0, eolIndex);
        lineBuffer = done && eolIndex < 0 ? "" : lineBuffer.slice(eolIndex + 1);

        if (line.trim() === "") {
          // Empty line: dispatch event
          if (eventDataBuffer.length > 0) {
            const jsonDataToParse = eventDataBuffer.endsWith("\n")
              ? eventDataBuffer.slice(0, -1)
              : eventDataBuffer;

            createDebugLog(
              "SSE DISPATCH EVENT",
              jsonDataToParse.substring(0, 200) + "..."
            );

            console.log("🔄 Processing SSE event (regular):", {
              bufferLength: eventDataBuffer.length,
              preview: jsonDataToParse.substring(0, 100)
            });

            // Process the event immediately for real-time updates
            try {
              try {
                processSseEventData(
                  jsonDataToParse,
                  aiMessageId,
                  callbacks,
                  accumulatedTextRef,
                  currentAgentRef,
                  setCurrentAgent
                );
              } catch (error) {
                console.error(
                  "❌ [SSE ERROR] Failed to process final SSE event:",
                  error
                );
                console.error(
                  "❌ [SSE ERROR] Problematic JSON:",
                  jsonDataToParse.substring(0, 500)
                );
              }
            } catch (error) {
              console.error(
                "❌ [SSE ERROR] Failed to process SSE event:",
                error
              );
              console.error(
                "❌ [SSE ERROR] Problematic JSON:",
                jsonDataToParse.substring(0, 500)
              );
            }
            eventDataBuffer = ""; // Reset for next event
            
            // If this is the final chunk and we just processed an event, mark it as processed
            if (done) {
              processedFinalEvent = true;
            }
          }
        } else if (line.startsWith("data:")) {
          // Accumulate data lines for this event
          eventDataBuffer += line.substring(5).trimStart() + "\n";
          createDebugLog(
            "SSE DATA",
            `Added to buffer: "${line.substring(5).trimStart()}"`
          );
        } else if (line.startsWith(":")) {
          createDebugLog("SSE COMMENT", `Ignoring comment: "${line}"`);
          // Comment line, ignore
        }
      }

      if (done) {
        // Handle any remaining data in buffer, but only if we haven't already processed a final event
        if (eventDataBuffer.length > 0 && !processedFinalEvent) {
          const jsonDataToParse = eventDataBuffer.endsWith("\n")
            ? eventDataBuffer.slice(0, -1)
            : eventDataBuffer;

          createDebugLog(
            "SSE DISPATCH FINAL EVENT",
            jsonDataToParse.substring(0, 200) + "..."
          );

          console.log("🏁 Processing SSE event (final):", {
            bufferLength: eventDataBuffer.length,
            preview: jsonDataToParse.substring(0, 100)
          });

          try {
            processSseEventData(
              jsonDataToParse,
              aiMessageId,
              callbacks,
              accumulatedTextRef,
              currentAgentRef,
              setCurrentAgent
            );
          } catch (error) {
            console.error(
              "❌ [SSE ERROR] Failed to process final SSE event:",
              error
            );
            console.error(
              "❌ [SSE ERROR] Problematic JSON:",
              jsonDataToParse.substring(0, 500)
            );
          }
          eventDataBuffer = "";
        } else if (processedFinalEvent) {
          console.log("⏭️ Skipping final event processing - already processed");
        }
        createDebugLog("SSE END", "Stream processing finished");
        return; // Exit recursion
      }

      // Continue processing next chunk
      return pump();
    };

    try {
      await pump();
    } catch (error) {
      createDebugLog("SSE ERROR", "Error reading stream", error);
      throw error;
    }
  }

  // Removed Agent Engine JSON processing methods:
  // - handleAgentEngineJsonStream()
  // - processCompleteJsonLines()
  // - processAgentEngineJsonPart()
  // - hashPart()
  //
  // These are no longer needed since Agent Engine now sends standard SSE format
  // and uses the same processing pipeline as local backend.
}
