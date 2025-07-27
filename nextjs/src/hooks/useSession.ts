import { useState, useCallback, useEffect } from "react";

// Type for stored session data
export interface StoredSession {
  id: string;
  userId: string;
  title: string;
  lastActivity: string;
  messageCount: number;
}

export interface UseSessionReturn {
  // State
  sessionId: string;
  userId: string;
  sessions: StoredSession[];

  // User ID management
  handleUserIdChange: (newUserId: string) => void;
  handleUserIdConfirm: (confirmedUserId: string) => void;

  // Session management
  handleSessionSwitch: (newSessionId: string) => void;
  handleCreateNewSession: (
    sessionUserId: string,
    initialMessage?: string
  ) => Promise<void>;
  generateSessionTitle: (firstMessage: string) => string;

  // Storage operations
  loadSessionsFromStorage: (userId: string) => StoredSession[];
  saveSessionsToStorage: (userId: string, sessions: StoredSession[]) => void;
  updateSessionMetadata: (sessionId: string, messageCount: number) => void;
}

/**
 * Custom hook for managing chat sessions, user ID, and localStorage persistence
 */
export function useSession(): UseSessionReturn {
  const [sessionId, setSessionId] = useState<string>("");
  const [userId, setUserId] = useState<string>("");
  const [sessions, setSessions] = useState<StoredSession[]>([]);

  // Session storage key for localStorage
  const getSessionStorageKey = useCallback(
    (userId: string): string => `chat_sessions_${userId}`,
    []
  );

  // Load sessions from localStorage
  const loadSessionsFromStorage = useCallback(
    (userId: string): StoredSession[] => {
      try {
        const stored = localStorage.getItem(getSessionStorageKey(userId));
        return stored ? JSON.parse(stored) : [];
      } catch (error) {
        console.error("Error loading sessions from storage:", error);
        return [];
      }
    },
    [getSessionStorageKey]
  );

  // Save sessions to localStorage
  const saveSessionsToStorage = useCallback(
    (userId: string, sessions: StoredSession[]): void => {
      try {
        localStorage.setItem(
          getSessionStorageKey(userId),
          JSON.stringify(sessions)
        );
        setSessions(sessions);
      } catch (error) {
        console.error("Error saving sessions to storage:", error);
      }
    },
    [getSessionStorageKey]
  );

  // Generate session title from first message
  const generateSessionTitle = useCallback((firstMessage: string): string => {
    if (!firstMessage) return "New Session";

    // Take first 30 characters and add ellipsis if longer
    const truncated =
      firstMessage.length > 30
        ? firstMessage.substring(0, 30) + "..."
        : firstMessage;

    // Remove newlines and extra spaces
    return truncated.replace(/\s+/g, " ").trim();
  }, []);

  // Handle session switching
  const handleSessionSwitch = useCallback(
    (newSessionId: string): void => {
      console.log(
        `🔄 handleSessionSwitch called: current=${sessionId}, new=${newSessionId}, userId=${userId}`
      );

      if (!userId || newSessionId === sessionId) {
        console.log(`⏭️ Skipping session switch: no userId or same session`);
        return;
      }

      // Switch to new session
      console.log(`🎯 Setting sessionId state to: ${newSessionId}`);
      setSessionId(newSessionId);

      console.log(`✅ Session switch completed to: ${newSessionId}`);
    },
    [userId, sessionId]
  );

  // Update session metadata in localStorage
  const updateSessionMetadata = useCallback(
    (sessionId: string, messageCount: number): void => {
      if (!userId || !sessionId) return;

      const storedSessions = loadSessionsFromStorage(userId);
      const sessionIndex = storedSessions.findIndex(
        (s: StoredSession) => s.id === sessionId
      );

      if (sessionIndex !== -1) {
        storedSessions[sessionIndex] = {
          ...storedSessions[sessionIndex],
          lastActivity: new Date().toISOString(),
          messageCount,
        };
        saveSessionsToStorage(userId, storedSessions);
        console.log(`✅ Updated session metadata for: ${sessionId}`);
      }
    },
    [userId, loadSessionsFromStorage, saveSessionsToStorage]
  );

  // Handle new session creation
  const handleCreateNewSession = useCallback(
    async (sessionUserId: string, initialMessage?: string): Promise<void> => {
      if (!sessionUserId) {
        throw new Error("User ID is required to create a session");
      }

      // Generate random session ID using the GitHub gist approach
      const randomPart =
        Math.random().toString(36).substring(2, 10) +
        Math.random().toString(36).substring(2, 10);
      const requestedSessionId = randomPart;

      // Create the session using Server Action instead of HTTP call
      let actualSessionId = requestedSessionId;
      try {
        // Import Server Action dynamically to avoid circular dependencies in hooks
        const { createSessionAction } = await import(
          "@/lib/actions/session-actions"
        );

        const sessionResult = await createSessionAction(
          sessionUserId,
          requestedSessionId
        );

        if (sessionResult.success) {
          // For Agent Engine, use the actual session ID returned by the backend
          actualSessionId = sessionResult.sessionId;
          console.log(
            `✅ Session created via Server Action: requested=${requestedSessionId}, actual=${actualSessionId}`
          );
          console.log(`📝 Session result:`, sessionResult);
        } else {
          console.warn(
            "⚠️ Session creation Server Action failed, using requested ID:",
            sessionResult.error
          );
          // Fall back to using the requested ID
        }
      } catch (error) {
        console.warn(
          "Session creation Server Action error, using requested ID:",
          error
        );
        // Fall back to using the requested ID
      }

      // Generate session title from initial message or use default
      const sessionTitle = initialMessage
        ? generateSessionTitle(initialMessage)
        : `Session ${actualSessionId}`;

      console.log(
        `📋 Creating session object: ID=${actualSessionId}, Title=${sessionTitle}`
      );

      // Create new session object with the actual session ID
      const newSession: StoredSession = {
        id: actualSessionId,
        userId: sessionUserId,
        title: sessionTitle,
        lastActivity: new Date().toISOString(),
        messageCount: 0,
      };

      // Save new session to localStorage
      const storedSessions = loadSessionsFromStorage(sessionUserId);
      const updatedSessions = [newSession, ...storedSessions];
      saveSessionsToStorage(sessionUserId, updatedSessions);
      console.log(`💾 Saved session to localStorage:`, newSession);

      // Switch to the new session using the actual session ID
      console.log(`🔄 Switching to session: ${actualSessionId}`);
      handleSessionSwitch(actualSessionId);
    },
    [
      generateSessionTitle,
      loadSessionsFromStorage,
      saveSessionsToStorage,
      handleSessionSwitch,
    ]
  );

  // User ID management with localStorage persistence
  useEffect(() => {
    // Load user ID from localStorage on mount
    const savedUserId = localStorage.getItem("agent-engine-user-id");
    if (savedUserId) {
      setUserId(savedUserId);
      // Load sessions for this user
      const userSessions = loadSessionsFromStorage(savedUserId);
      setSessions(userSessions);
    }
  }, [loadSessionsFromStorage]);

  // Handle user ID changes
  const handleUserIdChange = useCallback(
    (newUserId: string): void => {
      setUserId(newUserId);
      // Load sessions for the new user
      const userSessions = loadSessionsFromStorage(newUserId);
      setSessions(userSessions);
    },
    [loadSessionsFromStorage]
  );

  // Handle user ID confirmation
  const handleUserIdConfirm = useCallback(
    (confirmedUserId: string): void => {
      setUserId(confirmedUserId);
      localStorage.setItem("agent-engine-user-id", confirmedUserId);
      // Load sessions for the confirmed user
      const userSessions = loadSessionsFromStorage(confirmedUserId);
      setSessions(userSessions);
    },
    [loadSessionsFromStorage]
  );

  return {
    // State
    sessionId,
    userId,
    sessions,

    // User ID management
    handleUserIdChange,
    handleUserIdConfirm,

    // Session management
    handleSessionSwitch,
    handleCreateNewSession,
    generateSessionTitle,

    // Storage operations
    loadSessionsFromStorage,
    saveSessionsToStorage,
    updateSessionMetadata,
  };
}
