import { useState, useCallback } from "react";
import { Message } from "@/types";
import { ProcessedEvent } from "@/components/ActivityTimeline";

export function useLessonPlanningMessages() {
  const [lessonMessages, setLessonMessagesState] = useState<Message[]>([]);
  const [lessonMessageEvents, setLessonMessageEventsState] = useState<Map<string, ProcessedEvent[]>>(new Map());
  const [lessonWebsiteCount, setLessonWebsiteCount] = useState(0);

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
  };
} 