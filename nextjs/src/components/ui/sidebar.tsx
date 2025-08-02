"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const Sidebar = React.forwardRef<HTMLDivElement, SidebarProps>(
  ({ className, isOpen, onClose, children, ...props }, ref) => {
    return (
      <>
        {/* Backdrop - only on mobile */}
        {isOpen && (
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
            onClick={onClose}
          />
        )}
        
        {/* Sidebar */}
        <div
          ref={ref}
          className={cn(
            "fixed left-0 top-0 z-50 h-screen w-64 bg-white border-r border-gray-200 shadow-lg transform transition-transform duration-300 ease-in-out",
            // On mobile: slide in/out based on isOpen
            // On desktop: slide in/out based on isOpen
            isOpen ? "translate-x-0" : "-translate-x-full",
            className
          )}
          style={{ zIndex: 50 }}
          {...props}
        >
          {children}
        </div>
      </>
    );
  }
);
Sidebar.displayName = "Sidebar";

interface SidebarHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const SidebarHeader = React.forwardRef<HTMLDivElement, SidebarHeaderProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex items-center justify-between p-4 border-b border-gray-200", className)}
      {...props}
    >
      {children}
    </div>
  )
);
SidebarHeader.displayName = "SidebarHeader";

interface SidebarContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const SidebarContent = React.forwardRef<HTMLDivElement, SidebarContentProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex-1 overflow-y-auto h-full", className)}
      {...props}
    >
      {children}
    </div>
  )
);
SidebarContent.displayName = "SidebarContent";

export { Sidebar, SidebarHeader, SidebarContent }; 