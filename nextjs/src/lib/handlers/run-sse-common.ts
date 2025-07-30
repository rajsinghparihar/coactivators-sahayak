/**
 * Common utilities for run_sse API route
 *
 * This module contains shared types, request parsing, validation, and utility functions
 * used by both Agent Engine and local backend deployment strategies for the run_sse endpoint.
 */

import { NextRequest } from "next/server";

/**
 * Common request data structure for streaming
 */
export interface ProcessedStreamRequest {
  message: string;
  userId: string;
  sessionId: string;
  fileUrl?: string; // Optional URL to the uploaded file
  fileName?: string; // Optional original file name
}

/**
 * Agent Engine specific payload format
 */
export interface AgentEnginePayload {
  class_method: "stream_query";
  input: {
    user_id: string;
    session_id: string;
    message: string;
    fileUrl?: string; // Optional URL to the uploaded file
    fileName?: string; // Optional original file name
  };
}

/**
 * Local backend payload format
 */
export interface LocalBackendPayload {
  appName: string;
  userId: string;
  sessionId: string;
  newMessage: {
    parts: Array<{
      text?: string;
      file_data?: {
        display_name: string;
        file_uri: string;
        mime_type: string;
      };
    }>;
    role: "user";
  };
  streaming: boolean;
}

/**
 * Union type for backend payloads
 */
export type BackendPayload = AgentEnginePayload | LocalBackendPayload;

/**
 * Validation result for request parsing
 */
export interface StreamValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * SSE response headers used by all deployment strategies
 */
export const SSE_HEADERS = {
  "Content-Type": "text/event-stream",
  "Cache-Control": "no-cache",
  Connection: "keep-alive",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
} as const;

/**
 * CORS headers for OPTIONS requests
 */
export const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
} as const;

/**
 * Parse and validate the incoming stream request body
 *
 * @param request - The incoming HTTP request
 * @returns Parsed request data and validation result
 */
export async function parseStreamRequest(request: NextRequest): Promise<{
  data: ProcessedStreamRequest | null;
  validation: StreamValidationResult;
}> {
  try {
    const requestBody = (await request.json()) as {
      message?: string;
      userId?: string;
      sessionId?: string;
      fileUrl?: string;
      fileName?: string;
    };

    // Validate the request structure
    const validation = validateStreamRequest(requestBody);
    if (!validation.isValid) {
      return { data: null, validation };
    }

    return {
      data: {
        message: requestBody.message!,
        userId: requestBody.userId!,
        sessionId: requestBody.sessionId!,
        ...(requestBody.fileUrl ? { fileUrl: requestBody.fileUrl } : {}),
        ...(requestBody.fileName ? { fileName: requestBody.fileName } : {}),
      },
      validation: { isValid: true },
    };
  } catch (error) {
    console.error("Error parsing stream request:", error);
    return {
      data: null,
      validation: {
        isValid: false,
        error: "Invalid request format",
      },
    };
  }
}

/**
 * Validate the stream request structure
 *
 * @param requestBody - The parsed request body
 * @returns Validation result
 */
export function validateStreamRequest(requestBody: {
  message?: string;
  userId?: string;
  sessionId?: string;
  fileUrl?: string;
  fileName?: string;
}): StreamValidationResult {
  if (!requestBody.message?.trim() && !requestBody.fileUrl) {
    return {
      isValid: false,
      error: "Message or file is required",
    };
  }

  if (!requestBody.userId?.trim()) {
    return {
      isValid: false,
      error: "User ID is required",
    };
  }

  if (!requestBody.sessionId?.trim()) {
    return {
      isValid: false,
      error: "Session ID is required",
    };
  }

  return { isValid: true };
}

/**
 * Format Agent Engine payload
 *
 * @param requestData - Processed request data
 * @returns Agent Engine formatted payload
 */
export function formatAgentEnginePayload(
  requestData: ProcessedStreamRequest
): AgentEnginePayload {
  return {
    class_method: "stream_query",
    input: {
      user_id: requestData.userId,
      session_id: requestData.sessionId,
      message: requestData.message,
      ...(requestData.fileUrl ? { fileUrl: requestData.fileUrl } : {}),
      ...(requestData.fileName ? { fileName: requestData.fileName } : {}),
    },
  };
}

/**
 * Format local backend payload
 *
 * @param requestData - Processed request data
 * @returns Local backend formatted payload
 */
export function formatLocalBackendPayload(
  requestData: ProcessedStreamRequest
): LocalBackendPayload {
  const parts: Array<{
    text?: string;
    inline_data?: {
      display_name: string;
      mime_type: string;
    };
  }> = [];

  // Add text part if message exists
  if (requestData.message && requestData.message.trim()) {
    parts.push({ text: requestData.message });
  }

  // Add file part if file information exists
  if (requestData.fileUrl && requestData.fileName) {
    // Determine MIME type based on file extension
    const getMimeType = (fileName: string): string => {
      const extension = fileName.split('.').pop()?.toLowerCase();
      switch (extension) {
        case 'txt':
          return 'text/plain';
        case 'pdf':
          return 'application/pdf';
        case 'doc':
          return 'application/msword';
        case 'docx':
          return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        case 'jpg':
        case 'jpeg':
          return 'image/jpeg';
        case 'png':
          return 'image/png';
        case 'gif':
          return 'image/gif';
        case 'mp4':
          return 'video/mp4';
        case 'mp3':
          return 'audio/mpeg';
        default:
          return 'application/octet-stream';
      }
    };

    parts.push({
      inline_data: {
        display_name: requestData.fileUrl,
        mime_type: getMimeType(requestData.fileName)
      }
    });
  }

  return {
    appName: "app",
    userId: requestData.userId,
    sessionId: requestData.sessionId,
    newMessage: {
      parts,
      role: "user",
    },
    streaming: true,
  };
}

/**
 * Centralized logging for stream operations
 *
 * @param sessionId - Session identifier
 * @param userId - User identifier
 * @param message - Stream message (truncated for logging)
 * @param deploymentType - Deployment strategy type
 * @param fileUrl - Optional file URL
 * @param fileName - Optional file name
 */
export function logStreamRequest(
  sessionId: string,
  userId: string,
  message: string,
  deploymentType: "agent_engine" | "local_backend",
  fileUrl?: string,
  fileName?: string
): void {
  const truncatedMessage =
    message.length > 50 ? message.substring(0, 50) + "..." : message;
  const fileInfo = fileUrl ? ` (with file: ${fileName || 'unnamed'})` : '';
  console.log(
    `📨 Stream Request [${deploymentType}] - Session: ${sessionId}, User: ${userId}, Message: ${truncatedMessage}${fileInfo}`
  );
}

/**
 * Log stream operation start
 *
 * @param url - Target URL for streaming
 * @param payload - Request payload (truncated for logging)
 * @param deploymentType - Deployment strategy type
 */
export function logStreamStart(
  url: string,
  payload: BackendPayload,
  deploymentType: "agent_engine" | "local_backend"
): void {
  console.log(`🔗 Forwarding to ${deploymentType}: ${url}`);
  console.log(`📤 Payload:`, JSON.stringify(payload, null, 2));
}

/**
 * Log stream response details
 *
 * @param status - HTTP status code
 * @param statusText - HTTP status text
 * @param headers - Response headers
 * @param deploymentType - Deployment strategy type
 */
export function logStreamResponse(
  status: number,
  statusText: string,
  headers: Headers,
  deploymentType: "agent_engine" | "local_backend"
): void {
  console.log(
    `✅ ${deploymentType} response received, status: ${status} ${statusText}`
  );
  console.log(`📋 Content-Type: ${headers.get("content-type")}`);
}

/**
 * Create incremental SSE event for streaming text
 *
 * @param text - New text content to stream
 * @param author - Author/agent name
 * @returns Formatted SSE event string
 */
export function createIncrementalSSEEvent(
  text: string,
  author: string = "sahayak"
): string {
  const incrementalEvent = {
    content: { parts: [{ text }] },
    author,
    incremental: true, // Flag to indicate this is partial content
  };

  return `data: ${JSON.stringify(incrementalEvent)}\n\n`;
}

/**
 * Create final SSE event for complete JSON response
 *
 * @param completeJson - Complete JSON response from backend
 * @returns Formatted SSE event string
 */
export function createFinalSSEEvent(completeJson: unknown): string {
  return `data: ${JSON.stringify(completeJson)}\n\n`;
}

/**
 * Create error SSE event
 *
 * @param errorMessage - Error message to send
 * @param author - Author/agent name for the error
 * @returns Formatted SSE error event string
 */
export function createErrorSSEEvent(
  errorMessage: string,
  author: string = "error"
): string {
  const errorEvent = {
    content: {
      parts: [{ text: `Error processing response: ${errorMessage}` }],
    },
    author,
  };

  return `data: ${JSON.stringify(errorEvent)}\n\n`;
}

/**
 * Creates a debug log message with consistent formatting
 * Consolidated from stream-utils.ts
 *
 * @param category - Log category (e.g., "SSE", "PARSER", "CONNECTION")
 * @param message - Log message
 * @param data - Optional data to include
 */
export function createDebugLog(
  category: string,
  message: string,
  data?: unknown
): void {
  if (data !== undefined) {
    console.log(`[${category}] ${message}:`, data);
  } else {
    console.log(`[${category}] ${message}`);
  }
}
