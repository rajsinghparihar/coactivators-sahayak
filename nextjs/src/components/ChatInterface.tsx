"use client";

import { useRef, useCallback, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { ChatMessagesView } from "@/components/ChatMessagesView";
import { BackendHealthChecker } from "@/components/chat/BackendHealthChecker";
import { useSession } from "@/hooks/useSession";
import { useMessages } from "@/hooks/useMessages";
import { useStreamingManager } from "@/components/chat/StreamingManager";
import { useGenkitChat } from "@/hooks/useGenkitChat";
import { Message } from "@/types";

export default function ChatInterface() {
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);

  // Use custom hooks for state management
  const {
    userId,
    sessionId,
    handleUserIdChange,
    handleUserIdConfirm,
    handleCreateNewSession,
    handleSessionSwitch,
  } = useSession();

  const {
    messages,
    messageEvents,
    websiteCount,
    addMessage,
    setMessages,
    setMessageEvents,
    updateWebsiteCount,
    saveMessagesToStorage,
    loadMessagesFromStorage,
  } = useMessages();

  // Streaming management for text-only requests
  const streamingManager = useStreamingManager({
    userId,
    sessionId,
    onMessageUpdate: (message: Message) => {
      console.log("StreamingManager onMessageUpdate called:", { id: message.id, type: message.type, contentLength: message.content.length });
      setMessages((prev) => {
        // Check if message already exists
        const existingIndex = prev.findIndex((msg) => msg.id === message.id);

        if (existingIndex >= 0) {
          // Update existing message
          console.log("Updating existing message:", message.id);
          return prev.map((msg) => (msg.id === message.id ? message : msg));
        } else {
          // Add new message
          console.log("Adding new message:", message.id);
          return [...prev, message];
        }
      });
    },
    onEventUpdate: (messageId, event) => {
      setMessageEvents((prev) => {
        const newMap = new Map(prev);
        const existingEvents = newMap.get(messageId) || [];
        newMap.set(messageId, [...existingEvents, event]);
        return newMap;
      });
    },
    onWebsiteCountUpdate: updateWebsiteCount,
  });

  // Genkit chat for file requests
  const genkitChat = useGenkitChat({
    userId: userId || "",
    sessionId: sessionId || "",
    onMessageUpdate: (message: Message) => {
      console.log("GenkitChat onMessageUpdate called:", { id: message.id, type: message.type, contentLength: message.content.length });
      setMessages((prev) => {
        // Check if message already exists
        const existingIndex = prev.findIndex((msg) => msg.id === message.id);

        if (existingIndex >= 0) {
          // Update existing message
          console.log("Updating existing message:", message.id);
          return prev.map((msg) => (msg.id === message.id ? message : msg));
        } else {
          // Add new message
          console.log("Adding new message:", message.id);
          return [...prev, message];
        }
      });
    },
  });

  // Load messages when session changes
  useEffect(() => {
    if (userId && sessionId) {
      const sessionMessages = loadMessagesFromStorage(userId, sessionId);
      setMessages(sessionMessages);
      // Reset other state for new session
      setMessageEvents(new Map());
      updateWebsiteCount(0);
    }
  }, [
    userId,
    sessionId,
    loadMessagesFromStorage,
    setMessages,
    setMessageEvents,
    updateWebsiteCount,
  ]);

  // Save messages when they change
  useEffect(() => {
    if (userId && sessionId && messages.length > 0) {
      saveMessagesToStorage(userId, sessionId, messages);
    }
  }, [userId, sessionId, messages, saveMessagesToStorage]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollViewport = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      );
      if (scrollViewport) {
        scrollViewport.scrollTop = scrollViewport.scrollHeight;
      }
    }
  }, [messages]);

  // Handle message submission - route to appropriate handler based on file presence
  const handleSubmit = useCallback(
    async (
      query: string,
      fileUrl?: string,
      fileName?: string,
      requestUserId?: string,
      requestSessionId?: string
    ): Promise<void> => {
      if (!query.trim() && !fileUrl) return;

      // Use provided userId or current state
      const currentUserId = requestUserId || userId;
      if (!currentUserId) {
        throw new Error("User ID is required to send messages");
      }

      try {
        // Use provided session ID or current state
        let currentSessionId = requestSessionId || sessionId;

        if (!currentSessionId) {
          console.log("No session ID available, generating new one");
          currentSessionId = uuidv4();
          handleSessionSwitch(currentSessionId);
        }

        // Add user message to chat
        const userMessage: Message = {
          type: "human",
          content: query,
          id: uuidv4(),
          timestamp: new Date(),
          ...(fileUrl ? { fileUrl } : {}),
          ...(fileName ? { fileName } : {}),
        };

        addMessage(userMessage);

        // Route to appropriate handler based on file presence
        if (fileUrl && fileName) {
          // Use Genkit for file requests
          await genkitChat.sendMessage(query, fileUrl, fileName);
        } else {
          // Use SSE streaming for text-only requests
          await streamingManager.submitMessage(query);
        }
      } catch (error) {
        console.error("Error:", error);
        const errorMessage: Message = {
          type: "ai",
          content: `Sorry, there was an error processing your request: ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
          id: uuidv4(),
          timestamp: new Date(),
        };
        addMessage(errorMessage);
      }
    },
    [userId, sessionId, addMessage, streamingManager, genkitChat, handleSessionSwitch]
  );

  // Handle cancellation - support both streaming and Genkit requests
  const handleCancel = useCallback((): void => {
    streamingManager.cancelStream();
    // Remove the last message if it's an empty AI message
    setMessages((prev) => {
      const filtered = prev.filter(
        (msg) => msg.type !== "ai" || msg.content.trim() !== ""
      );
      return filtered;
    });
  }, [streamingManager, setMessages]);

  // Handle session switching with message persistence
  const handleSessionSwitchWrapper = useCallback(
    (newSessionId: string): void => {
      // Save current session messages before switching
      if (userId && sessionId && messages.length > 0) {
        saveMessagesToStorage(userId, sessionId, messages);
      }

      // Switch to new session
      handleSessionSwitch(newSessionId);
    },
    [userId, sessionId, messages, saveMessagesToStorage, handleSessionSwitch]
  );

  // Combine loading states from both streaming and Genkit
  const isLoading = streamingManager.isLoading || genkitChat.isLoading;

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <main className="flex-1 flex flex-col">
        <div
          className={`flex-1 overflow-y-auto ${
            messages.length === 0 ? "flex" : ""
          }`}
        >
          <BackendHealthChecker>
            <ChatMessagesView
              messages={messages}
              isLoading={isLoading}
              scrollAreaRef={scrollAreaRef}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              sessionId={sessionId}
              onSessionIdChange={handleSessionSwitchWrapper}
              messageEvents={messageEvents}
              websiteCount={websiteCount}
              userId={userId}
              onUserIdChange={handleUserIdChange}
              onUserIdConfirm={handleUserIdConfirm}
              onCreateSession={handleCreateNewSession}
            />
          </BackendHealthChecker>
        </div>
      </main>
    </div>
  );
}
