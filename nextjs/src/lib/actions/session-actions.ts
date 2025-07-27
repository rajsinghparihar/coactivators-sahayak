"use server";

import {
  createSessionWithService,
  SessionCreationResult,
} from "@/lib/services/session-service";

/**
 * Server Action to create a new session
 */
export async function createSessionAction(
  userId: string,
  sessionId: string
): Promise<SessionCreationResult> {
  try {
    console.log(
      `📡 Server Action - Creating session for userId: ${userId}, sessionId: ${sessionId}`
    );

    const result = await createSessionWithService(userId, sessionId);

    console.log(`✅ Server Action - Session creation result:`, result);

    return result;
  } catch (error) {
    console.error("Server Action - Session creation error:", error);

    return {
      success: false,
      sessionId,
      created: false,
      error: `Server Action error: ${
        error instanceof Error ? error.message : String(error)
      }`,
    };
  }
}

/**
 * Server Action to create a session with auto-generated ID
 * Convenience function for when you don't have a specific session ID
 */
export async function createNewSessionAction(
  userId: string
): Promise<SessionCreationResult> {
  // Generate random session ID using the same approach as the frontend
  const randomPart =
    Math.random().toString(36).substring(2, 10) +
    Math.random().toString(36).substring(2, 10);
  const sessionId = randomPart;

  return await createSessionAction(userId, sessionId);
}
