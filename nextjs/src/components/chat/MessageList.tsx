"use client";

import { MessageItem } from "./MessageItem";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Message } from "@/types";
import { ProcessedEvent } from "@/components/ActivityTimeline";

interface MessageListProps {
  messages: Message[];
  messageEvents?: Map<string, ProcessedEvent[]>;
  websiteCount?: number;
  isLoading?: boolean;
  onCopy?: (text: string, messageId: string) => void;
  copiedMessageId?: string | null;
  scrollAreaRef?: React.RefObject<HTMLDivElement | null>;
}

/**
 * Message list component that efficiently renders all messages
 * with proper scrolling and performance optimization
 */
export function MessageList({
  messages,
  messageEvents,
  websiteCount = 0,
  isLoading = false,
  onCopy,
  copiedMessageId,
  scrollAreaRef,
}: MessageListProps) {
  // If no messages, show empty state
  if (messages.length === 0) {
    return (
      <ScrollArea ref={scrollAreaRef} className="flex-1 px-4 py-6 h-full">
        <div className="flex items-center justify-center h-full">
          <div className="text-center space-y-3">
            <div className="text-gray-400 text-lg">💬</div>
            <p className="text-gray-500 text-sm">
              No messages yet. Start a conversation!
            </p>
          </div>
        </div>
      </ScrollArea>
    );
  }

  return (
    <ScrollArea ref={scrollAreaRef} className="flex-1 px-4 py-6 h-full">
      <div className="space-y-6 max-w-4xl mx-auto">
        {messages.map((message, index) => (
          <MessageItem
            key={message.id}
            message={message}
            messageEvents={messageEvents}
            websiteCount={websiteCount}
            // Only show loading for the last message
            isLoading={isLoading && index === messages.length - 1}
            onCopy={onCopy}
            copiedMessageId={copiedMessageId}
          />
        ))}
      </div>
    </ScrollArea>
  );
}
