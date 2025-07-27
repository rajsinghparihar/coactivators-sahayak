/**
 * SSE Parser Utilities
 *
 * This module handles the extraction and parsing of Server-Sent Event (SSE) data.
 * It contains complex JSON parsing logic for various types of SSE messages
 * including text content, thoughts, function calls, function responses, and sources.
 */

import { ParsedSSEData, RawSSEData } from "./types";

/**
 * Extracts and processes data from SSE JSON strings
 *
 * This function handles the complex parsing of SSE data received from the backend,
 * extracting various types of content including regular text, AI thoughts,
 * function calls/responses, and source information.
 *
 * @param data - Raw SSE data string to parse
 * @returns Structured data object with extracted information
 */
export function extractDataFromSSE(data: string): ParsedSSEData {
  try {
    const parsed: RawSSEData = JSON.parse(data);
    console.log("[SSE PARSED EVENT]:", JSON.stringify(parsed, null, 2));

    let textParts: string[] = [];
    let agent = "";
    let finalReportWithCitations = undefined;
    let functionCall = undefined;
    let functionResponse = undefined;
    let sources = undefined;

    // Extract text from content.parts (separate thoughts from regular text)
    let thoughtParts: string[] = [];
    if (parsed.content && parsed.content.parts) {
      // Extract regular text (non-thoughts)
      textParts = parsed.content.parts
        .filter(
          (part: { text?: string; thought?: boolean }) =>
            part.text && !part.thought
        )
        .map((part: { text?: string }) => part.text!)
        .filter((text): text is string => text !== undefined);

      // Extract thoughts separately
      thoughtParts = parsed.content.parts
        .filter(
          (part: { text?: string; thought?: boolean }) =>
            part.text && part.thought
        )
        .map((part: { text?: string }) => part.text!)
        .filter((text): text is string => text !== undefined);

      // Check for function calls
      const functionCallPart = parsed.content.parts.find(
        (part: { functionCall?: unknown }) => part.functionCall
      );
      if (functionCallPart) {
        functionCall = functionCallPart.functionCall as {
          name: string;
          args: Record<string, unknown>;
          id: string;
        };
      }

      // Check for function responses
      const functionResponsePart = parsed.content.parts.find(
        (part: { functionResponse?: unknown }) => part.functionResponse
      );
      if (functionResponsePart) {
        functionResponse = functionResponsePart.functionResponse as {
          name: string;
          response: Record<string, unknown>;
          id: string;
        };
      }
    }

    // Extract agent information
    if (parsed.author) {
      agent = parsed.author;
      console.log("[SSE EXTRACT] Agent:", agent);
    }

    // Extract final report flag
    if (
      parsed.actions &&
      parsed.actions.stateDelta &&
      parsed.actions.stateDelta.final_report_with_citations
    ) {
      finalReportWithCitations =
        parsed.actions.stateDelta.final_report_with_citations;
    }

    // Extract website count from research agents
    let sourceCount = 0;
    if (parsed.actions?.stateDelta?.url_to_short_id) {
      console.log(
        "[SSE EXTRACT] url_to_short_id found:",
        parsed.actions.stateDelta.url_to_short_id
      );
      sourceCount = Object.keys(
        parsed.actions.stateDelta.url_to_short_id
      ).length;
      console.log("[SSE EXTRACT] Calculated sourceCount:", sourceCount);
    }

    // Extract sources if available
    if (parsed.actions?.stateDelta?.sources) {
      sources = parsed.actions.stateDelta.sources;
      console.log("[SSE EXTRACT] Sources found:", sources);
    }

    return {
      textParts,
      thoughtParts,
      agent,
      finalReportWithCitations,
      functionCall,
      functionResponse,
      sourceCount,
      sources,
    };
  } catch (error) {
    return handleSSEParsingError(data, error);
  }
}

/**
 * Handles errors that occur during SSE data parsing
 *
 * @param data - Original data that failed to parse
 * @param error - The parsing error
 * @returns Default parsed data structure with error information logged
 */
function handleSSEParsingError(data: string, error: unknown): ParsedSSEData {
  const truncatedData =
    data.length > 200 ? data.substring(0, 200) + "..." : data;
  console.error(
    'Error parsing SSE data. Raw data (truncated): "',
    truncatedData,
    '". Error details:',
    error
  );

  return {
    textParts: [],
    thoughtParts: [],
    agent: "",
    finalReportWithCitations: undefined,
    functionCall: undefined,
    functionResponse: undefined,
    sourceCount: 0,
    sources: undefined,
  };
}

/**
 * Validates if a parsed SSE data object is valid
 *
 * @param data - Parsed SSE data to validate
 * @returns True if the data structure is valid, false otherwise
 */
export function validateParsedSSEData(data: ParsedSSEData): boolean {
  return (
    Array.isArray(data.textParts) &&
    Array.isArray(data.thoughtParts) &&
    typeof data.agent === "string" &&
    typeof data.sourceCount === "number"
  );
}

/**
 * Checks if parsed SSE data contains meaningful content
 *
 * @param data - Parsed SSE data to check
 * @returns True if the data contains any meaningful content
 */
export function hasSSEContent(data: ParsedSSEData): boolean {
  return (
    data.textParts.length > 0 ||
    data.thoughtParts.length > 0 ||
    data.functionCall !== undefined ||
    data.functionResponse !== undefined ||
    data.sourceCount > 0 ||
    data.agent !== ""
  );
}
