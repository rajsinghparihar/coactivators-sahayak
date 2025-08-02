"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { MarkdownRenderer, mdComponents } from "./MarkdownRenderer";
import {
  ActivityTimeline,
  ProcessedEvent,
} from "@/components/ActivityTimeline";
import { Copy, CopyCheck, Loader2, Bot, User } from "lucide-react";
import { Message } from "@/types";

interface MessageItemProps {
  message: Message;
  messageEvents?: Map<string, ProcessedEvent[]>;
  websiteCount?: number;
  isLoading?: boolean;
  onCopy?: (text: string, messageId: string) => void;
  copiedMessageId?: string | null;
}

/**
 * Individual message component that handles both human and AI messages
 * with proper styling, copy functionality, and activity timeline
 */
export function MessageItem({
  message,
  messageEvents,
  websiteCount = 0,
  isLoading = false,
  onCopy,
  copiedMessageId,
}: MessageItemProps) {
  const handleCopy = (text: string, messageId: string) => {
    if (onCopy) {
      onCopy(text, messageId);
    }
  };

  // Human message rendering
  if (message.type === "human") {
    return (
      <div className="flex items-start justify-end gap-2 sm:gap-3 max-w-[90%] sm:max-w-[85%] ml-auto px-2 sm:px-0">
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white p-3 sm:p-4 rounded-2xl rounded-tr-sm shadow-lg border border-blue-500/20">
          <ReactMarkdown
            components={{
              ...mdComponents,
              // Override styles for human messages (white text)
              p: ({ children, ...props }) => (
                <p
                  className="mb-2 leading-relaxed text-white last:mb-0 text-sm sm:text-base"
                  {...props}
                >
                  {children}
                </p>
              ),
              h1: ({ children, ...props }) => (
                <h1
                  className="text-lg sm:text-xl font-bold mb-3 text-white leading-tight"
                  {...props}
                >
                  {children}
                </h1>
              ),
              h2: ({ children, ...props }) => (
                <h2
                  className="text-base sm:text-lg font-semibold mb-2 text-white leading-tight"
                  {...props}
                >
                  {children}
                </h2>
              ),
              h3: ({ children, ...props }) => (
                <h3
                  className="text-sm sm:text-base font-medium mb-2 text-white leading-tight"
                  {...props}
                >
                  {children}
                </h3>
              ),
              code: ({ children, ...props }) => (
                <code
                  className="bg-blue-800/50 text-blue-100 px-1.5 py-0.5 rounded text-xs sm:text-sm font-mono"
                  {...props}
                >
                  {children}
                </code>
              ),
              strong: ({ children, ...props }) => (
                <strong className="font-semibold text-white" {...props}>
                  {children}
                </strong>
              ),
            }}
            remarkPlugins={[remarkGfm]}
          >
            {message.content}
          </ReactMarkdown>
        </div>
        <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 bg-blue-600 rounded-full flex items-center justify-center shadow-md border border-blue-500/30">
          <User className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
        </div>
      </div>
    );
  }

  // AI message rendering
  const hasTimelineEvents =
    messageEvents &&
    messageEvents.has(message.id) &&
    messageEvents.get(message.id)!.length > 0;

  // AI message with no content and loading - show thinking indicator with timeline
  if (!message.content && isLoading) {
    return (
      <div className="flex items-start gap-2 sm:gap-3 max-w-[95%] sm:max-w-[90%] px-2 sm:px-0">
        <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center shadow-md border border-emerald-400/30">
          <Bot className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
        </div>

        <div className="flex-1 bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 rounded-2xl rounded-tl-sm p-3 sm:p-4 shadow-lg">
          {/* Activity Timeline during thinking */}
          {hasTimelineEvents && (
            <ActivityTimeline
              processedEvents={messageEvents.get(message.id) || []}
              isLoading={isLoading}
              websiteCount={websiteCount}
            />
          )}

          {/* Loading indicator */}
          <div className="flex items-center gap-2 bg-slate-800/50 border border-slate-700/50 rounded-lg px-2 sm:px-3 py-2">
            <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin text-emerald-400" />
            <span className="text-xs sm:text-sm text-slate-400">
              🤔 Thinking and planning...
            </span>
          </div>
        </div>
      </div>
    );
  }

  // AI message with no content and not loading - show timeline if available
  if (!message.content) {
    // If we have timeline events, show them even without content
    if (hasTimelineEvents) {
      return (
        <div className="flex items-start gap-2 sm:gap-3 max-w-[95%] sm:max-w-[90%] px-2 sm:px-0">
          <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-md border border-blue-400/30">
            <Bot className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
          </div>

          <div className="flex-1 bg-white border border-gray-200 rounded-2xl rounded-tl-sm p-3 sm:p-4 shadow-lg">
            <ActivityTimeline
              processedEvents={messageEvents.get(message.id) || []}
              isLoading={isLoading}
              websiteCount={websiteCount}
            />

            {/* Show thinking indicator */}
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-2 sm:px-3 py-2 mt-2">
              <span className="text-xs sm:text-sm text-gray-600">🤔 Thinking...</span>
            </div>
          </div>
        </div>
      );
    }

    // Otherwise show no content indicator
    return (
      <div className="flex items-start gap-2 sm:gap-3 max-w-[95%] sm:max-w-[90%] px-2 sm:px-0">
        <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-md border border-blue-400/30">
          <Bot className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
        </div>
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-2 sm:px-3 py-2">
          <span className="text-xs sm:text-sm text-gray-600">No content</span>
        </div>
      </div>
    );
  }

  // Regular AI message display with content
  return (
    <div className="flex items-start gap-2 sm:gap-3 max-w-[95%] sm:max-w-[90%] px-2 sm:px-0">
      <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-md border border-blue-400/30">
        <Bot className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
      </div>

      <div className="flex-1 bg-white border border-gray-200 rounded-2xl rounded-tl-sm p-3 sm:p-4 shadow-lg relative group">
        {/* Activity Timeline */}
        {messageEvents && messageEvents.has(message.id) && (
          <ActivityTimeline
            processedEvents={messageEvents.get(message.id) || []}
            isLoading={isLoading}
            websiteCount={websiteCount}
          />
        )}

        {/* Message content */}
        <div className="prose max-w-none">
          <MarkdownRenderer content={message.content} />
        </div>

        {/* File attachment rendering */}
        {message.fileUrl && message.fileName && (
          <div className="mt-2">
            <a
              href={message.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline break-all text-sm"
              download={message.fileName}
            >
              📎 {message.fileName}
            </a>
          </div>
        )}

        {/* Copy button */}
        {onCopy && (
          <button
            onClick={() => handleCopy(message.content, message.id)}
            className="absolute top-2 sm:top-3 right-2 sm:right-3 p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
            title="Copy message"
          >
            {copiedMessageId === message.id ? (
              <CopyCheck className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
            ) : (
              <Copy className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500 hover:text-gray-700" />
            )}
          </button>
        )}

        {/* Timestamp */}
        <div className="mt-2 sm:mt-3 pt-2 border-t border-slate-700/50">
          <span className="text-xs text-slate-400">
            {message.timestamp.toLocaleTimeString()}
          </span>
        </div>
      </div>
    </div>
  );
}
