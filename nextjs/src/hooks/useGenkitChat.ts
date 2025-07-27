import { useState, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { Message } from "@/types";

interface UseGenkitChatProps {
  userId: string;
  sessionId: string;
  onMessageUpdate: (message: Message) => void;
}

interface UseGenkitChatReturn {
  isLoading: boolean;
  sendMessage: (message: string, fileUrl?: string, fileName?: string) => Promise<void>;
}

export function useGenkitChat({
  userId,
  sessionId,
  onMessageUpdate,
}: UseGenkitChatProps): UseGenkitChatReturn {
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = useCallback(
    async (message: string, fileUrl?: string, fileName?: string): Promise<void> => {
      if (!message.trim() && !fileUrl) {
        throw new Error("Message or file is required");
      }
      
      if (!userId || !sessionId) {
        throw new Error("UserId and sessionId are required");
      }

      setIsLoading(true);

      try {
        const response = await fetch("/api/genkit-chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message,
            userId,
            sessionId,
            fileUrl,
            fileName,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to send message");
        }

        const data = await response.json();
        
        // Create AI response message with UUID to prevent ID collisions
        const aiMessage: Message = {
          type: "ai",
          content: data.response,
          id: uuidv4(), // Use UUID instead of timestamp to prevent collisions
          timestamp: new Date(),
        };

        onMessageUpdate(aiMessage);
      } catch (error) {
        console.error("Genkit chat error:", error);
        // Don't create error message here - let the calling function handle it
        // This prevents duplicate error messages
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [userId, sessionId, onMessageUpdate]
  );

  return {
    isLoading,
    sendMessage,
  };
} 