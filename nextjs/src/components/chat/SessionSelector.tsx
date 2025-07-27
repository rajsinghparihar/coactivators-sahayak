"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MessageSquare, Calendar, Loader2, Plus } from "lucide-react";

interface Session {
  id: string;
  userId: string;
  lastActivity: Date;
  title?: string;
  messageCount?: number;
}

interface StoredSession {
  id: string;
  userId: string;
  title: string;
  lastActivity: string;
  messageCount: number;
}

interface SessionSelectorProps {
  currentUserId: string;
  currentSessionId: string;
  onSessionSelect: (sessionId: string) => void;
  onCreateSession: (userId: string) => Promise<void>;
  className?: string;
}

export function SessionSelector({
  currentUserId,
  currentSessionId,
  onSessionSelect,
  onCreateSession,
  className = "",
}: SessionSelectorProps): React.JSX.Element {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isCreatingSession, setIsCreatingSession] = useState<boolean>(false);

  // Load sessions from localStorage for local mode
  const loadSessionsFromStorage = useCallback((userId: string) => {
    try {
      const stored = localStorage.getItem(`chat_sessions_${userId}`);
      if (stored) {
        const storedSessions: StoredSession[] = JSON.parse(stored);
        return storedSessions.map((session: StoredSession) => ({
          id: session.id,
          userId: session.userId,
          lastActivity: new Date(session.lastActivity),
          title: session.title,
          messageCount: session.messageCount || 0,
        }));
      }
      return [];
    } catch (error) {
      console.error("Error loading sessions from storage:", error);
      return [];
    }
  }, []);

  // Load sessions when user ID changes or current session changes
  useEffect(() => {
    if (currentUserId) {
      const storedSessions = loadSessionsFromStorage(currentUserId);

      // If current session exists, use stored sessions
      if (currentSessionId) {
        const sessionExists = storedSessions.some(
          (s: Session) => s.id === currentSessionId
        );

        if (!sessionExists) {
          // Add current session if it doesn't exist in storage
          const newSession: Session = {
            id: currentSessionId,
            userId: currentUserId,
            lastActivity: new Date(),
            title: `Session ${currentSessionId}`,
            messageCount: 0,
          };
          setSessions([newSession, ...storedSessions]);
        } else {
          setSessions(storedSessions);
        }
      } else {
        setSessions(storedSessions);
      }
    } else {
      setSessions([]);
    }
  }, [currentUserId, currentSessionId, loadSessionsFromStorage]);

  // Handle session selection or creation
  const handleSessionSelect = async (value: string): Promise<void> => {
    if (value === "create-new") {
      // Create new session
      setIsCreatingSession(true);
      try {
        await onCreateSession(currentUserId);
      } catch (error) {
        console.error("Failed to create session:", error);
      } finally {
        setIsCreatingSession(false);
      }
    } else {
      // Select existing session
      onSessionSelect(value);
    }
  };

  // Format date for display
  const formatDate = (date: Date): string => {
    const now = new Date();
    const diffMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffMinutes < 1) return "Just now";
    if (diffMinutes < 60) return `${diffMinutes}m ago`;

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString();
  };

  return (
    <div className={`${className}`}>
      {!currentUserId ? (
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <MessageSquare className="w-4 h-4" />
          <span>No user set</span>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Session:</span>
          <Select value={currentSessionId} onValueChange={handleSessionSelect}>
            <SelectTrigger className="w-44 h-12 text-xs bg-slate-700/50 border-slate-600/50 text-slate-100 hover:bg-slate-600/50 focus:border-emerald-500 px-4 py-1">
              <SelectValue
                placeholder={
                  sessions.length === 0
                    ? "Create your first session"
                    : "Select session"
                }
              />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-600 min-w-44">
              {sessions.map((session) => (
                <SelectItem
                  key={session.id}
                  value={session.id}
                  className="text-slate-100 focus:bg-slate-700 focus:text-slate-50 cursor-pointer py-3 px-3"
                >
                  <div className="flex flex-col items-start w-full min-w-0">
                    <span className="font-medium text-slate-100 text-sm truncate w-full">
                      {session.title}
                    </span>
                    <div className="flex items-center gap-2 text-xs text-slate-300 mt-1">
                      <Calendar className="w-3 h-3 flex-shrink-0" />
                      <span className="flex-shrink-0">
                        {formatDate(session.lastActivity)}
                      </span>
                      {session.messageCount !== undefined && (
                        <>
                          <span className="text-slate-500">•</span>
                          <span className="flex-shrink-0">
                            {session.messageCount} msg
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </SelectItem>
              ))}
              {/* Create New Session Option */}
              <SelectItem
                value="create-new"
                className="text-slate-100 focus:bg-slate-700 focus:text-slate-50 border-t border-slate-600 mt-1 cursor-pointer py-3 px-3"
                disabled={isCreatingSession}
              >
                <div className="flex items-center gap-2">
                  {isCreatingSession ? (
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-400 flex-shrink-0" />
                  ) : (
                    <Plus className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  )}
                  <span className="text-emerald-400 font-medium">
                    {isCreatingSession ? "Creating..." : "Create New Session"}
                  </span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}
