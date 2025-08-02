"use client";

import { useState } from "react";
import { Sidebar, SidebarHeader, SidebarContent } from "@/components/ui/sidebar";
import { BurgerMenu } from "@/components/ui/burger-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bot, BookOpen, X } from "lucide-react";

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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="flex h-screen w-full">
      {/* Burger Menu Button */}
      <div className="fixed top-4 left-4 z-30 lg:hidden">
        <BurgerMenu
          isOpen={isSidebarOpen}
          onClick={toggleSidebar}
          className="bg-white shadow-lg border border-gray-200"
        />
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
              className="lg:hidden p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-4 w-4 text-gray-600" />
            </button>
          </SidebarHeader>

          <SidebarContent>
            <div className="p-4">
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
                </TabsList>
              </Tabs>
            </div>
          </SidebarContent>
        </div>
      </Sidebar>

      {/* Main Content */}
      <div className={cn(
        "flex-1 transition-all duration-300 ease-in-out",
        "lg:ml-64", // Always show sidebar on desktop
        "ml-0" // No margin on mobile
      )}>
        {children}
      </div>
    </div>
  );
}

function cn(...classes: (string | undefined)[]) {
  return classes.filter(Boolean).join(" ");
} 