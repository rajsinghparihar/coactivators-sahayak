"use client";

import ChatInterface from "@/components/ChatInterface";
import { Suspense } from "react";

export default function HomePage(): React.JSX.Element {
  return (
    <div className="flex flex-col h-screen">
      <Suspense fallback={<div>Loading...</div>}>
        <ChatInterface />
      </Suspense>
    </div>
  );
}
