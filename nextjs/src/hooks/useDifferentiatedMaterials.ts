import { useState, useCallback } from "react";
import { Message } from "@/types";

export function useDifferentiatedMaterials() {
  const [messages, setMessagesState] = useState<Message[]>([]);
  const [messageEvents, setMessageEventsState] = useState<Map<string, unknown[]>>(new Map());
  const [websiteCount, setWebsiteCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);

  const addMessage = useCallback((message: Message) => {
    setMessagesState(prev => [...prev, message]);
  }, []);

  const setMessages = useCallback((messagesOrUpdater: Message[] | ((prev: Message[]) => Message[])) => {
    if (typeof messagesOrUpdater === 'function') {
      setMessagesState(prev => messagesOrUpdater(prev));
    } else {
      setMessagesState(messagesOrUpdater);
    }
  }, []);

  const setMessageEvents = useCallback((eventsOrUpdater: Map<string, unknown[]> | ((prev: Map<string, unknown[]>) => Map<string, unknown[]>)) => {
    if (typeof eventsOrUpdater === 'function') {
      setMessageEventsState(prev => eventsOrUpdater(prev));
    } else {
      setMessageEventsState(eventsOrUpdater);
    }
  }, []);

  const updateWebsiteCount = useCallback((count: number) => {
    setWebsiteCount(count);
  }, []);

  const saveMessagesToStorage = useCallback((userId: string, sessionId: string, messagesToSave: Message[]) => {
    try {
      const key = `differentiated-materials-${userId}-${sessionId}`;
      localStorage.setItem(key, JSON.stringify(messagesToSave));
    } catch (error) {
      console.error("Error saving differentiated materials messages to storage:", error);
    }
  }, []);

  const loadMessagesFromStorage = useCallback((userId: string, sessionId: string) => {
    try {
      const key = `differentiated-materials-${userId}-${sessionId}`;
      const stored = localStorage.getItem(key);
      if (stored) {
        const parsedMessages = JSON.parse(stored);
        setMessagesState(parsedMessages);
      }
    } catch (error) {
      console.error("Error loading differentiated materials messages from storage:", error);
    }
  }, []);

  return {
    messages,
    messageEvents,
    websiteCount,
    isLoading,
    addMessage,
    setMessages,
    setMessageEvents,
    updateWebsiteCount,
    saveMessagesToStorage,
    loadMessagesFromStorage,
    setIsLoading,
  };
} 