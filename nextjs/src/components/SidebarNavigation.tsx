"use client";

import { useState } from "react";
import { Sidebar, SidebarHeader, SidebarContent } from "@/components/ui/sidebar";
import { BurgerMenu } from "@/components/ui/burger-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bot, BookOpen, X, GraduationCap, Image } from "lucide-react";
import { UserIdInput } from "@/components/chat/UserIdInput";
import { SessionSelector } from "@/components/chat/SessionSelector";

interface SidebarNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  sessionId: string;
  onSessionIdChange: (sessionId: string) => void;
  userId: string;
  onUserIdChange: (newUserId: string) => void;
  onUserIdConfirm: (confirmedUserId: string) => void;
  onCreateSession: (sessionUserId: string, initialMessage?: string) => Promise<void>;
  children: React.ReactNode;
}

export function SidebarNavigation({
  activeTab,
  onTabChange,
  sessionId,
  onSessionIdChange,
  userId,
  onUserIdChange,
  onUserIdConfirm,
  onCreateSession,
  children,
}: SidebarNavigationProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Default open on desktop

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="flex h-screen w-full">
      {/* Burger Menu Button - Mobile Only */}
      <div className="fixed top-4 left-4 z-30 lg:hidden">
        <BurgerMenu
          isOpen={isSidebarOpen}
          onClick={toggleSidebar}
          className="bg-white shadow-lg border border-gray-200"
        />
      </div>

      {/* Desktop Sidebar Toggle Button */}
      <div className="fixed top-4 left-4 z-30 hidden lg:block">
        <button
          onClick={toggleSidebar}
          className="p-2 bg-white shadow-lg border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          {isSidebarOpen ? (
            <X className="h-5 w-5 text-gray-600" />
          ) : (
            <Bot className="h-5 w-5 text-gray-600" />
          )}
        </button>
      </div>

      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar}>
        <div className="flex flex-col h-full">
          <SidebarHeader>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-md">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  Sahayak
                </h1>
                <p className="text-xs text-gray-500">AI Assistant</p>
              </div>
            </div>
            <button
              onClick={closeSidebar}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-4 w-4 text-gray-600" />
            </button>
          </SidebarHeader>

          <SidebarContent>
            <div className="p-4 space-y-4">
              {/* User and Session Management */}
              <div className="space-y-3">
                {/* <div className="text-xs font-medium text-gray-700 uppercase tracking-wide">
                  User Management
                </div> */}
                <UserIdInput
                  currentUserId={userId}
                  onUserIdChange={onUserIdChange}
                  onUserIdConfirm={onUserIdConfirm}
                  className="text-xs"
                />
                
                {userId && (
                  <div className="space-y-2">
                    {/* <div className="text-xs font-medium text-gray-700 uppercase tracking-wide">
                      Session Management
                    </div> */}
                    <SessionSelector
                      currentUserId={userId}
                      currentSessionId={sessionId}
                      onSessionSelect={onSessionIdChange}
                      onCreateSession={onCreateSession}
                      className="text-xs"
                    />
                  </div>
                )}
              </div>

              {/* Navigation Tabs */}
              <div className="space-y-3">
                <div className="text-xs font-medium text-gray-700 uppercase tracking-wide">
                  Navigation
                </div>
                <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
                  <TabsList className="grid w-full grid-cols-1 gap-2 bg-gray-50 p-1">
                    <TabsTrigger 
                      value="chat" 
                      className="flex items-center gap-2 justify-start data-[state=active]:bg-white data-[state=active]:shadow-sm"
                    >
                      <Bot className="h-4 w-4" />
                      Chat
                    </TabsTrigger>
                    <TabsTrigger 
                      value="lesson-planning" 
                      className="flex items-center gap-2 justify-start data-[state=active]:bg-white data-[state=active]:shadow-sm"
                    >
                      <BookOpen className="h-4 w-4" />
                      Lesson Planning
                    </TabsTrigger>
                    <TabsTrigger 
                      value="differentiated-materials" 
                      className="flex items-center gap-2 justify-start data-[state=active]:bg-white data-[state=active]:shadow-sm"
                    >
                      <GraduationCap className="h-4 w-4" />
                      Differentiated Materials
                    </TabsTrigger>
                    <TabsTrigger 
                      value="visual-aid-generator" 
                      className="flex items-center gap-2 justify-start data-[state=active]:bg-white data-[state=active]:shadow-sm"
                    >
                      <Image className="h-4 w-4" />
                      Visual Aid Generator
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>
          </SidebarContent>
        </div>
      </Sidebar>

      {/* Main Content */}
      <div className={cn(
        "flex-1 transition-all duration-300 ease-in-out",
        isSidebarOpen ? "lg:ml-64" : "lg:ml-0", // Conditional margin on desktop
        "ml-0", // No margin on mobile
        "pt-16 lg:pt-0" // Add top padding on mobile to avoid burger menu
      )}>
        {children}
      </div>
    </div>
  );
}

function cn(...classes: (string | undefined)[]) {
  return classes.filter(Boolean).join(" ");
} 