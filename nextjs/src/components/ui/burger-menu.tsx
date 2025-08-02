"use client";

import * as React from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface BurgerMenuProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isOpen: boolean;
  onClick: () => void;
  className?: string;
}

const BurgerMenu = React.forwardRef<HTMLButtonElement, BurgerMenuProps>(
  ({ className, isOpen, onClick, ...props }, ref) => {
    return (
      <button
        ref={ref}
        onClick={onClick}
        className={cn(
          "flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-100 transition-colors duration-200",
          className
        )}
        {...props}
      >
        <div className="relative w-5 h-5">
          <span
            className={cn(
              "absolute left-0 top-0 w-5 h-0.5 bg-gray-600 transform transition-all duration-300 ease-in-out",
              isOpen ? "rotate-45 translate-y-2" : "translate-y-0"
            )}
          />
          <span
            className={cn(
              "absolute left-0 top-2 w-5 h-0.5 bg-gray-600 transform transition-all duration-300 ease-in-out",
              isOpen ? "opacity-0" : "opacity-100"
            )}
          />
          <span
            className={cn(
              "absolute left-0 top-4 w-5 h-0.5 bg-gray-600 transform transition-all duration-300 ease-in-out",
              isOpen ? "-rotate-45 -translate-y-2" : "translate-y-0"
            )}
          />
        </div>
      </button>
    );
  }
);
BurgerMenu.displayName = "BurgerMenu";

export { BurgerMenu }; 