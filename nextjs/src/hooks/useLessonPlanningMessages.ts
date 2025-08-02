import { useState, useCallback } from "react";
import { Message } from "@/types";
import { ProcessedEvent } from "@/components/ActivityTimeline";

export function useLessonPlanningMessages() {
  const [lessonMessages, setLessonMessagesState] = useState<Message[]>([]);
  const [lessonMessageEvents, setLessonMessageEventsState] = useState<Map<string, ProcessedEvent[]>>(new Map());
  const [lessonWebsiteCount, setLessonWebsiteCount] = useState(0);

  // Messages storage key for localStorage
  const getLessonMessagesStorageKey = useCallback(
    (userId: string, sessionId: string): string =>
      `lesson_messages_${userId}_${sessionId}`,
    []
  );

  // Load lesson messages for a specific session
  const loadLessonMessagesFromStorage = useCallback(
    (userId: string, sessionId: string): Message[] => {
      try {
        const stored = localStorage.getItem(
          getLessonMessagesStorageKey(userId, sessionId)
        );
        if (stored) {
          const parsedMessages = JSON.parse(stored);
          // Convert timestamp strings back to Date objects
          return parsedMessages.map((msg: Message) => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
          }));
        }
        return [];
      } catch (error) {
        console.error("Error loading lesson messages from storage:", error);
        return [];
      }
    },
    [getLessonMessagesStorageKey]
  );

  // Save lesson messages for a specific session
  const saveLessonMessagesToStorage = useCallback(
    (userId: string, sessionId: string, messages: Message[]): void => {
      try {
        localStorage.setItem(
          getLessonMessagesStorageKey(userId, sessionId),
          JSON.stringify(messages)
        );
      } catch (error) {
        console.error("Error saving lesson messages to storage:", error);
      }
    },
    [getLessonMessagesStorageKey]
  );

  const addLessonMessage = useCallback((message: Message) => {
    setLessonMessagesState((prev) => [...prev, message]);
  }, []);

  const setLessonMessages = useCallback((messages: Message[] | ((prev: Message[]) => Message[])) => {
    if (typeof messages === "function") {
      setLessonMessagesState(messages);
    } else {
      setLessonMessagesState(messages);
    }
  }, []);

  const setLessonMessageEvents = useCallback((events: Map<string, ProcessedEvent[]> | ((prev: Map<string, ProcessedEvent[]>) => Map<string, ProcessedEvent[]>)) => {
    if (typeof events === "function") {
      setLessonMessageEventsState(events);
    } else {
      setLessonMessageEventsState(events);
    }
  }, []);

  const updateLessonWebsiteCount = useCallback((count: number) => {
    setLessonWebsiteCount(count);
  }, []);

  return {
    lessonMessages,
    lessonMessageEvents,
    lessonWebsiteCount,
    addLessonMessage,
    setLessonMessages,
    setLessonMessageEvents,
    updateLessonWebsiteCount,
    saveLessonMessagesToStorage,
    loadLessonMessagesFromStorage,
  };
} 