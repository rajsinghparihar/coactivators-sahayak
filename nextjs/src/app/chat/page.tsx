"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ChatPage(): React.JSX.Element {
  const router = useRouter();

  useEffect(() => {
    // Redirect to main page since chat is now the default
    router.replace("/");
  }, [router]);

  return (
    <div className="flex flex-col h-screen items-center justify-center">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p className="text-neutral-300">Redirecting to main page...</p>
      </div>
    </div>
  );
}
