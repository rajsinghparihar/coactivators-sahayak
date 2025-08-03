"use client";

import { useRef, useCallback, useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { ChatMessagesView } from "@/components/ChatMessagesView";
import { LessonPlanningView } from "@/components/LessonPlanningView";
import { DifferentiatedMaterialsView } from "@/components/DifferentiatedMaterialsView";
import { VisualAidGeneratorView } from "@/components/VisualAidGeneratorView";
import { SidebarNavigation } from "@/components/SidebarNavigation";
import { BackendHealthChecker } from "@/components/chat/BackendHealthChecker";
import { useSession } from "@/hooks/useSession";
import { useMessages } from "@/hooks/useMessages";
import { useLessonPlanningMessages } from "@/hooks/useLessonPlanningMessages";
import { useDifferentiatedMaterials } from "@/hooks/useDifferentiatedMaterials";
import { useVisualAids } from "@/hooks/useVisualAids";
import { useStreamingManager } from "@/components/chat/StreamingManager";
import { useGenkitChat } from "@/hooks/useGenkitChat";
import { Message } from "@/types";

export default function ChatInterface() {
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);
  const [activeTab, setActiveTab] = useState("chat");

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

  // Separate state for lesson planning
  const {
    lessonMessages,
    addLessonMessage,
    setLessonMessages,
    setLessonMessageEvents,
    updateLessonWebsiteCount,
    saveLessonMessagesToStorage,
    loadLessonMessagesFromStorage,
  } = useLessonPlanningMessages();

  // Separate state for differentiated materials
  const {
    messages: differentiatedMaterials,
    addMessage: addDifferentiatedMaterialsMessage,
    setMessages: setDifferentiatedMaterials,
    setMessageEvents: setDifferentiatedMaterialsEvents,
    updateWebsiteCount: updateDifferentiatedMaterialsWebsiteCount,
    saveMessagesToStorage: saveDifferentiatedMaterials,
    loadMessagesFromStorage: loadDifferentiatedMaterials,
  } = useDifferentiatedMaterials();

  // Separate state for visual aid generator
  const {
    messages: visualAids,
    addMessage: addVisualAidsMessage,
    setMessages: setVisualAids,
    setMessageEvents: setVisualAidsEvents,
    updateWebsiteCount: updateVisualAidsWebsiteCount,
    saveMessagesToStorage: saveVisualAids,
    loadMessagesFromStorage: loadVisualAids,
  } = useVisualAids();

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

  // Separate streaming manager for lesson planning
  const lessonStreamingManager = useStreamingManager({
    userId,
    sessionId,
    onMessageUpdate: (message: Message) => {
      console.log("LessonStreamingManager onMessageUpdate called:", { id: message.id, type: message.type, contentLength: message.content.length });
      setLessonMessages((prev) => {
        // Check if message already exists
        const existingIndex = prev.findIndex((msg) => msg.id === message.id);

        if (existingIndex >= 0) {
          // Update existing message
          console.log("Updating existing lesson message:", message.id);
          return prev.map((msg) => (msg.id === message.id ? message : msg));
        } else {
          // Add new message
          console.log("Adding new lesson message:", message.id);
          return [...prev, message];
        }
      });
    },
    onEventUpdate: (messageId, event) => {
      setLessonMessageEvents((prev) => {
        const newMap = new Map(prev);
        const existingEvents = newMap.get(messageId) || [];
        newMap.set(messageId, [...existingEvents, event]);
        return newMap;
      });
    },
    onWebsiteCountUpdate: updateLessonWebsiteCount,
  });

  // Separate Genkit chat for lesson planning
  const lessonGenkitChat = useGenkitChat({
    userId: userId || "",
    sessionId: sessionId || "",
    onMessageUpdate: (message: Message) => {
      console.log("LessonGenkitChat onMessageUpdate called:", { id: message.id, type: message.type, contentLength: message.content.length });
      setLessonMessages((prev) => {
        // Check if message already exists
        const existingIndex = prev.findIndex((msg) => msg.id === message.id);

        if (existingIndex >= 0) {
          // Update existing message
          console.log("Updating existing lesson message:", message.id);
          return prev.map((msg) => (msg.id === message.id ? message : msg));
        } else {
          // Add new message
          console.log("Adding new lesson message:", message.id);
          return [...prev, message];
        }
      });
    },
  });

  // Separate streaming manager for differentiated materials
  const differentiatedMaterialsStreamingManager = useStreamingManager({
    userId,
    sessionId,
    onMessageUpdate: (message: Message) => {
      console.log("DifferentiatedMaterialsStreamingManager onMessageUpdate called:", { id: message.id, type: message.type, contentLength: message.content.length });
      setDifferentiatedMaterials((prev) => {
        // Check if message already exists
        const existingIndex = prev.findIndex((msg) => msg.id === message.id);

        if (existingIndex >= 0) {
          // Update existing message
          console.log("Updating existing differentiated materials message:", message.id);
          return prev.map((msg) => (msg.id === message.id ? message : msg));
        } else {
          // Add new message
          console.log("Adding new differentiated materials message:", message.id);
          return [...prev, message];
        }
      });
    },
    onEventUpdate: (messageId, event) => {
      setDifferentiatedMaterialsEvents((prev) => {
        const newMap = new Map(prev);
        const existingEvents = newMap.get(messageId) || [];
        newMap.set(messageId, [...existingEvents, event]);
        return newMap;
      });
    },
    onWebsiteCountUpdate: updateDifferentiatedMaterialsWebsiteCount,
  });

  // Separate Genkit chat for differentiated materials
  const differentiatedMaterialsGenkitChat = useGenkitChat({
    userId: userId || "",
    sessionId: sessionId || "",
    onMessageUpdate: (message: Message) => {
      console.log("DifferentiatedMaterialsGenkitChat onMessageUpdate called:", { id: message.id, type: message.type, contentLength: message.content.length });
      setDifferentiatedMaterials((prev) => {
        // Check if message already exists
        const existingIndex = prev.findIndex((msg) => msg.id === message.id);

        if (existingIndex >= 0) {
          // Update existing message
          console.log("Updating existing differentiated materials message:", message.id);
          return prev.map((msg) => (msg.id === message.id ? message : msg));
        } else {
          // Add new message
          console.log("Adding new differentiated materials message:", message.id);
          return [...prev, message];
        }
      });
    },
  });

  // Separate streaming manager for visual aids
  const visualAidsStreamingManager = useStreamingManager({
    userId,
    sessionId,
    onMessageUpdate: (message: Message) => {
      console.log("VisualAidsStreamingManager onMessageUpdate called:", { id: message.id, type: message.type, contentLength: message.content.length });
      setVisualAids((prev) => {
        // Check if message already exists
        const existingIndex = prev.findIndex((msg) => msg.id === message.id);

        if (existingIndex >= 0) {
          // Update existing message
          console.log("Updating existing visual aids message:", message.id);
          return prev.map((msg) => (msg.id === message.id ? message : msg));
        } else {
          // Add new message
          console.log("Adding new visual aids message:", message.id);
          return [...prev, message];
        }
      });
    },
    onEventUpdate: (messageId, event) => {
      setVisualAidsEvents((prev) => {
        const newMap = new Map(prev);
        const existingEvents = newMap.get(messageId) || [];
        newMap.set(messageId, [...existingEvents, event]);
        return newMap;
      });
    },
    onWebsiteCountUpdate: updateVisualAidsWebsiteCount,
  });

  // Separate Genkit chat for visual aids
  const visualAidsGenkitChat = useGenkitChat({
    userId: userId || "",
    sessionId: sessionId || "",
    onMessageUpdate: (message: Message) => {
      console.log("VisualAidsGenkitChat onMessageUpdate called:", { id: message.id, type: message.type, contentLength: message.content.length });
      setVisualAids((prev) => {
        // Check if message already exists
        const existingIndex = prev.findIndex((msg) => msg.id === message.id);

        if (existingIndex >= 0) {
          // Update existing message
          console.log("Updating existing visual aids message:", message.id);
          return prev.map((msg) => (msg.id === message.id ? message : msg));
        } else {
          // Add new message
          console.log("Adding new visual aids message:", message.id);
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

      // Load lesson planning messages for the session
      const sessionLessonMessages = loadLessonMessagesFromStorage(userId, sessionId);
      setLessonMessages(sessionLessonMessages);
      // Reset lesson planning state for new session
      setLessonMessageEvents(new Map());
      updateLessonWebsiteCount(0);

      // Load differentiated materials messages for the session
      loadDifferentiatedMaterials(userId, sessionId);
      setDifferentiatedMaterialsEvents(new Map());
      updateDifferentiatedMaterialsWebsiteCount(0);

      // Load visual aids messages for the session
      loadVisualAids(userId, sessionId);
      setVisualAidsEvents(new Map());
      updateVisualAidsWebsiteCount(0);
    }
  }, [
    userId,
    sessionId,
    loadMessagesFromStorage,
    loadLessonMessagesFromStorage,
    loadDifferentiatedMaterials,
    loadVisualAids,
    setMessages,
    setLessonMessages,
    setDifferentiatedMaterials,
    setVisualAids,
    setMessageEvents,
    setLessonMessageEvents,
    setDifferentiatedMaterialsEvents,
    setVisualAidsEvents,
    updateWebsiteCount,
    updateLessonWebsiteCount,
    updateDifferentiatedMaterialsWebsiteCount,
    updateVisualAidsWebsiteCount,
  ]);

  // Save messages when they change
  useEffect(() => {
    if (userId && sessionId && messages.length > 0) {
      saveMessagesToStorage(userId, sessionId, messages);
    }
  }, [userId, sessionId, messages, saveMessagesToStorage]);

  // Save lesson planning messages when they change
  useEffect(() => {
    if (userId && sessionId && lessonMessages.length > 0) {
      saveLessonMessagesToStorage(userId, sessionId, lessonMessages);
    }
  }, [userId, sessionId, lessonMessages, saveLessonMessagesToStorage]);

  // Save differentiated materials messages when they change
  useEffect(() => {
    if (userId && sessionId && differentiatedMaterials.length > 0) {
      saveDifferentiatedMaterials(userId, sessionId, differentiatedMaterials);
    }
  }, [userId, sessionId, differentiatedMaterials, saveDifferentiatedMaterials]);

  // Save visual aids messages when they change
  useEffect(() => {
    if (userId && sessionId && visualAids.length > 0) {
      saveVisualAids(userId, sessionId, visualAids);
    }
  }, [userId, sessionId, visualAids, saveVisualAids]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    console.log("Auto-scroll effect triggered, messages length:", messages.length);
    if (scrollAreaRef.current) {
      console.log("ScrollArea ref found:", scrollAreaRef.current);
      // Try multiple selectors for the scroll viewport
      const scrollViewport = 
        scrollAreaRef.current.querySelector("[data-radix-scroll-area-viewport]") ||
        scrollAreaRef.current.querySelector(".radix-scroll-area-viewport") ||
        scrollAreaRef.current;
      
      if (scrollViewport) {
        console.log("Scroll viewport found:", scrollViewport);
        // Use requestAnimationFrame to ensure DOM is updated
        requestAnimationFrame(() => {
          scrollViewport.scrollTop = scrollViewport.scrollHeight;
          console.log("Scrolled to bottom, scrollTop:", scrollViewport.scrollTop, "scrollHeight:", scrollViewport.scrollHeight);
        });
      } else {
        console.log("No scroll viewport found");
      }
    } else {
      console.log("No scrollAreaRef.current");
    }
  }, [messages]);

  // Handle chat message submission
  const handleChatSubmit = useCallback(
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

  // Handle lesson planning message submission
  const handleLessonPlanningSubmit = useCallback(
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

        // Add user message to lesson planning
        const userMessage: Message = {
          type: "human",
          content: query,
          id: uuidv4(),
          timestamp: new Date(),
          ...(fileUrl ? { fileUrl } : {}),
          ...(fileName ? { fileName } : {}),
        };

        addLessonMessage(userMessage);

        // Route to appropriate handler based on file presence
        if (fileUrl && fileName) {
          // Use Genkit for file requests
          await lessonGenkitChat.sendMessage(query, fileUrl, fileName);
        } else {
          // Use SSE streaming for text-only requests
          await lessonStreamingManager.submitMessage(query);
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
        addLessonMessage(errorMessage);
      }
    },
    [userId, sessionId, addLessonMessage, lessonStreamingManager, lessonGenkitChat, handleSessionSwitch]
  );

  // Handle differentiated materials message submission
  const handleDifferentiatedMaterialsSubmit = useCallback(
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

        // Add user message to differentiated materials
        const userMessage: Message = {
          type: "human",
          content: query,
          id: uuidv4(),
          timestamp: new Date(),
          ...(fileUrl ? { fileUrl } : {}),
          ...(fileName ? { fileName } : {}),
        };

        addDifferentiatedMaterialsMessage(userMessage);

        // Route to appropriate handler based on file presence
        if (fileUrl && fileName) {
          // Use Genkit for file requests
          await differentiatedMaterialsGenkitChat.sendMessage(query, fileUrl, fileName);
        } else {
          // Use SSE streaming for text-only requests
          await differentiatedMaterialsStreamingManager.submitMessage(query);
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
        addDifferentiatedMaterialsMessage(errorMessage);
      }
    },
    [userId, sessionId, addDifferentiatedMaterialsMessage, differentiatedMaterialsStreamingManager, differentiatedMaterialsGenkitChat, handleSessionSwitch]
  );

  // Handle visual aid generator message submission
  const handleVisualAidGeneratorSubmit = useCallback(
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

        // Add user message to visual aid generator
        const userMessage: Message = {
          type: "human",
          content: query,
          id: uuidv4(),
          timestamp: new Date(),
          ...(fileUrl ? { fileUrl } : {}),
          ...(fileName ? { fileName } : {}),
        };

        addVisualAidsMessage(userMessage);

        // Route to appropriate handler based on file presence
        if (fileUrl && fileName) {
          // Use Genkit for file requests
          await visualAidsGenkitChat.sendMessage(query, fileUrl, fileName);
        } else {
          // Use SSE streaming for text-only requests
          await visualAidsStreamingManager.submitMessage(query);
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
        addVisualAidsMessage(errorMessage);
      }
    },
    [userId, sessionId, addVisualAidsMessage, visualAidsStreamingManager, visualAidsGenkitChat, handleSessionSwitch]
  );

  // Handle chat cancellation
  const handleChatCancel = useCallback((): void => {
    streamingManager.cancelStream();
    // Remove the last message if it's an empty AI message
    setMessages((prev) => {
      const filtered = prev.filter(
        (msg) => msg.type !== "ai" || msg.content.trim() !== ""
      );
      return filtered;
    });
  }, [streamingManager, setMessages]);

  // Handle lesson planning cancellation
  const handleLessonPlanningCancel = useCallback((): void => {
    lessonStreamingManager.cancelStream();
    // Remove the last message if it's an empty AI message
    setLessonMessages((prev) => {
      const filtered = prev.filter(
        (msg) => msg.type !== "ai" || msg.content.trim() !== ""
      );
      return filtered;
    });
  }, [lessonStreamingManager, setLessonMessages]);

  // Handle differentiated materials cancellation
  const handleDifferentiatedMaterialsCancel = useCallback((): void => {
    differentiatedMaterialsStreamingManager.cancelStream();
    setDifferentiatedMaterials((prev) => {
      const filtered = prev.filter(
        (msg) => msg.type !== "ai" || msg.content.trim() !== ""
      );
      return filtered;
    });
  }, [differentiatedMaterialsStreamingManager, setDifferentiatedMaterials]);

  // Handle visual aid generator cancellation
  const handleVisualAidGeneratorCancel = useCallback((): void => {
    visualAidsStreamingManager.cancelStream();
    setVisualAids((prev) => {
      const filtered = prev.filter(
        (msg) => msg.type !== "ai" || msg.content.trim() !== ""
      );
      return filtered;
    });
  }, [visualAidsStreamingManager, setVisualAids]);

  // Handle session switching with message persistence
  const handleSessionSwitchWrapper = useCallback(
    (newSessionId: string): void => {
      // Save current session messages before switching
      if (userId && sessionId && messages.length > 0) {
        saveMessagesToStorage(userId, sessionId, messages);
      }

      // Save current lesson planning messages before switching
      if (userId && sessionId && lessonMessages.length > 0) {
        saveLessonMessagesToStorage(userId, sessionId, lessonMessages);
      }

      // Save current differentiated materials messages before switching
      if (userId && sessionId && differentiatedMaterials.length > 0) {
        saveDifferentiatedMaterials(userId, sessionId, differentiatedMaterials);
      }

      // Save current visual aid generator messages before switching
      if (userId && sessionId && visualAids.length > 0) {
        saveVisualAids(userId, sessionId, visualAids);
      }

      // Switch to new session
      handleSessionSwitch(newSessionId);
    },
    [userId, sessionId, messages, lessonMessages, differentiatedMaterials, visualAids, saveMessagesToStorage, saveLessonMessagesToStorage, saveDifferentiatedMaterials, saveVisualAids, handleSessionSwitch]
  );

  // Combine loading states from both streaming and Genkit
  const isChatLoading = streamingManager.isLoading || genkitChat.isLoading;
  const isLessonPlanningLoading = lessonStreamingManager.isLoading || lessonGenkitChat.isLoading;

  return (
    <div className="h-screen flex flex-col bg-white w-full">
      <main className="flex-1 flex flex-col w-full">
        <div className="flex-1 w-full">
          <BackendHealthChecker>
            <SidebarNavigation
              activeTab={activeTab}
              onTabChange={setActiveTab}
              sessionId={sessionId}
              onSessionIdChange={handleSessionSwitchWrapper}
              userId={userId}
              onUserIdChange={handleUserIdChange}
              onUserIdConfirm={handleUserIdConfirm}
              onCreateSession={handleCreateNewSession}
            >
              {activeTab === "chat" && (
                <ChatMessagesView
                  messages={messages}
                  isLoading={isChatLoading}
                  scrollAreaRef={scrollAreaRef}
                  onSubmit={handleChatSubmit}
                  onCancel={handleChatCancel}
                  messageEvents={messageEvents}
                  websiteCount={websiteCount}
                />
              )}
              
              {activeTab === "lesson-planning" && (
                <LessonPlanningView
                  messages={lessonMessages}
                  isLoading={isLessonPlanningLoading}
                  onSubmit={handleLessonPlanningSubmit}
                  onCancel={handleLessonPlanningCancel}
                />
              )}

              {activeTab === "differentiated-materials" && (
                <DifferentiatedMaterialsView
                  messages={differentiatedMaterials}
                  isLoading={differentiatedMaterialsStreamingManager.isLoading || differentiatedMaterialsGenkitChat.isLoading}
                  onSubmit={handleDifferentiatedMaterialsSubmit}
                  onCancel={handleDifferentiatedMaterialsCancel}
                  userId={userId}
                  onUserIdChange={handleUserIdChange}
                  onUserIdConfirm={handleUserIdConfirm}
                  sessionId={sessionId}
                  onSessionIdChange={handleSessionSwitchWrapper}
                  onCreateSession={handleCreateNewSession}
                />
              )}

              {activeTab === "visual-aid-generator" && (
                <VisualAidGeneratorView
                  messages={visualAids}
                  isLoading={visualAidsStreamingManager.isLoading || visualAidsGenkitChat.isLoading}
                  onSubmit={handleVisualAidGeneratorSubmit}
                  onCancel={handleVisualAidGeneratorCancel}
                  userId={userId}
                  onUserIdChange={handleUserIdChange}
                  onUserIdConfirm={handleUserIdConfirm}
                  sessionId={sessionId}
                  onSessionIdChange={handleSessionSwitchWrapper}
                  onCreateSession={handleCreateNewSession}
                />
              )}
            </SidebarNavigation>
          </BackendHealthChecker>
        </div>
      </main>
    </div>
  );
}
