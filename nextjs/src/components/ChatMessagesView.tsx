"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { InputForm } from "@/components/InputForm";
import { UserIdInput } from "@/components/chat/UserIdInput";
import { SessionSelector } from "@/components/chat/SessionSelector";
import { MessageList } from "@/components/chat/MessageList";
import { Loader2, Bot, Target, ListChecks, CheckCircle } from "lucide-react";
import { Message } from "@/types";
import { ProcessedEvent } from "@/components/ActivityTimeline";

interface ChatMessagesViewProps {
  messages: Message[];
  isLoading: boolean;
  scrollAreaRef: React.RefObject<HTMLDivElement | null>;
  onSubmit: (query: string, fileUrl?: string, fileName?: string) => void;
  onCancel: () => void;
  sessionId: string;
  onSessionIdChange: (sessionId: string) => void;
  displayData?: string | null;
  messageEvents?: Map<string, ProcessedEvent[]>;
  websiteCount?: number;
  userId: string;
  onUserIdChange: (newUserId: string) => void;
  onUserIdConfirm: (confirmedUserId: string) => void;
  onCreateSession: (
    sessionUserId: string,
    initialMessage?: string
  ) => Promise<void>;
}

export function ChatMessagesView({
  messages,
  isLoading,
  scrollAreaRef,
  onSubmit,
  onCancel,
  sessionId,
  onSessionIdChange,
  messageEvents,
  websiteCount,
  userId,
  onUserIdChange,
  onUserIdConfirm,
  onCreateSession,
}: ChatMessagesViewProps): React.JSX.Element {
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);

  const handleCopy = async (text: string, messageId: string): Promise<void> => {
    await navigator.clipboard.writeText(text);
    setCopiedMessageId(messageId);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  return (
    <div className="flex flex-col h-full w-full relative">
      {/* Fixed background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-50 pointer-events-none"></div>

      {/* Fixed Header */}
      <div className="relative z-10 flex-shrink-0 border-b border-gray-200 bg-white/95 backdrop-blur-sm shadow-sm">
        <div className="w-full px-4 py-3 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-md">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  Sahayak
                </h1>
                <p className="text-xs text-gray-500">Powered by Google Gemini</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
              {/* User ID Management */}
              <UserIdInput
                currentUserId={userId}
                onUserIdChange={onUserIdChange}
                onUserIdConfirm={onUserIdConfirm}
                className="text-xs"
              />

              {/* Session Management */}
              {userId && (
                <SessionSelector
                  currentUserId={userId}
                  currentSessionId={sessionId}
                  onSessionSelect={onSessionIdChange}
                  onCreateSession={onCreateSession}
                  className="text-xs"
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area - with bottom padding to account for fixed input */}
      <div className="relative z-10 flex-1 overflow-hidden pb-32 sm:pb-36">
        {messages.length === 0 ? (
          /* AI Goal Planner Placeholder */
          <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 text-center min-h-[60vh]">
            <div className="w-full max-w-4xl space-y-6 sm:space-y-8">
              {/* Main header */}
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center justify-center space-x-2 sm:space-x-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500/10 rounded-xl flex items-center justify-center">
                    <Target className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" />
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500/10 rounded-xl flex items-center justify-center">
                    <ListChecks className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-500/10 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-purple-500" />
                  </div>
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
                  Sahayak
                </h1>
                <p className="text-lg sm:text-xl text-gray-600">
                  Powered by Google Gemini
                </p>
              </div>

              {/* Description */}
              <div className="space-y-3 sm:space-y-4">
                <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-4">
                  Your intelligent teaching assistant for low-resource, multi-grade classrooms. 
                  Get personalized support with activities, materials, and lesson planning.
                </p>
              </div>

              {/* Feature highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-4xl mx-auto px-4">
                <div className="space-y-2 sm:space-y-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500/10 rounded-xl flex items-center justify-center mx-auto">
                    <Target className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" />
                  </div>
                  <h3 className="font-semibold text-green-600 text-sm sm:text-base">
                    Multi-Grade Support
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600">
                    Differentiated materials and activities for mixed-age classrooms
                  </p>
                </div>
                <div className="space-y-2 sm:space-y-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mx-auto">
                    <ListChecks className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
                  </div>
                  <h3 className="font-semibold text-blue-600 text-sm sm:text-base">
                    Resource Creation
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600">
                    Generate worksheets, visual aids, and low-cost activities
                  </p>
                </div>
                <div className="space-y-2 sm:space-y-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mx-auto">
                    <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-purple-500" />
                  </div>
                  <h3 className="font-semibold text-purple-600 text-sm sm:text-base">
                    Local Adaptation
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600">
                    Culturally relevant content and hyper-local examples
                  </p>
                </div>
                <div className="space-y-2 sm:space-y-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-500/10 rounded-xl flex items-center justify-center mx-auto">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-orange-600 text-sm sm:text-base">
                    Weekly Planning
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600">
                    Organize lessons, activities, and classroom routines efficiently
                  </p>
                </div>
              </div>

              {/* Try asking about section */}
              <div className="space-y-3 sm:space-y-4">
                <p className="text-gray-600 text-sm sm:text-base">Try asking about:</p>
                <div className="flex flex-wrap gap-2 justify-center px-4">
                  <span className="px-2 sm:px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs sm:text-sm">
                    Multi-grade lesson plans
                  </span>
                  <span className="px-2 sm:px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs sm:text-sm">
                    Low-cost activities
                  </span>
                  <span className="px-2 sm:px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs sm:text-sm">
                    Differentiated worksheets
                  </span>
                  <span className="px-2 sm:px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs sm:text-sm">
                    Classroom management
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Message List - Use new MessageList component */
          <MessageList
            messages={messages}
            messageEvents={messageEvents}
            websiteCount={websiteCount}
            isLoading={isLoading}
            onCopy={handleCopy}
            copiedMessageId={copiedMessageId}
            scrollAreaRef={scrollAreaRef}
          />
        )}

        {/* Show "Planning..." if the last message is human and we are loading */}
        {isLoading &&
          messages.length > 0 &&
          messages[messages.length - 1].type === "human" && (
            <div className="absolute bottom-36 sm:bottom-40 left-1/2 transform -translate-x-1/2">
              <div className="flex items-start gap-2 sm:gap-3">
                <div className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-md border border-blue-400/30">
                  <Bot className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                </div>
                <div className="flex items-center gap-2 bg-white/90 border border-gray-200 rounded-lg px-2 sm:px-3 py-2 backdrop-blur-sm shadow-md">
                  <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin text-blue-500" />
                  <span className="text-xs sm:text-sm text-gray-600">
                    Creating your teaching resources...
                  </span>
                </div>
              </div>
            </div>
          )}
      </div>

      {/* Fixed Input Area - absolutely positioned at bottom */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t-2 border-gray-200 bg-white/95 backdrop-blur-md shadow-lg">
        <div className="w-full px-4 py-3 sm:px-6 sm:py-4">
          <InputForm onSubmit={onSubmit} isLoading={isLoading} context="chat" />
          {isLoading && (
            <div className="mt-3 sm:mt-4 flex justify-center">
              <Button
                variant="outline"
                onClick={onCancel}
                className="text-red-500 hover:text-red-600 border-red-300 hover:border-red-400 bg-red-50 hover:bg-red-100 text-sm"
              >
                Cancel
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
