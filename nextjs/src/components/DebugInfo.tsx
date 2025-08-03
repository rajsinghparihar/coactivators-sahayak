"use client";

import { useState, useEffect } from "react";

export function DebugInfo() {
  const [debugInfo, setDebugInfo] = useState<string>("");

  useEffect(() => {
    const info = [
      `User Agent: ${navigator.userAgent}`,
      `Platform: ${navigator.platform}`,
      `Language: ${navigator.language}`,
      `Online: ${navigator.onLine}`,
      `Cookie Enabled: ${navigator.cookieEnabled}`,
      `Do Not Track: ${navigator.doNotTrack}`,
      `Hardware Concurrency: ${navigator.hardwareConcurrency}`,
      `Max Touch Points: ${navigator.maxTouchPoints}`,
      `Vendor: ${navigator.vendor}`,
      `Window Size: ${window.innerWidth}x${window.innerHeight}`,
      `Screen Size: ${screen.width}x${screen.height}`,
      `Color Depth: ${screen.colorDepth}`,
      `Pixel Depth: ${screen.pixelDepth}`,
    ].join("\n");

    setDebugInfo(info);
  }, []);

  const testFileUpload = async () => {
    try {
      // Create a test file
      const testContent = "This is a test file for debugging file upload functionality.";
      const testFile = new File([testContent], "test-debug.txt", { type: "text/plain" });
      
      const formData = new FormData();
      formData.append("file", testFile);
      
      console.log("Testing file upload with:", testFile.name, testFile.size, testFile.type);
      
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      
      console.log("Upload test response:", res.status, res.statusText);
      
      if (res.ok) {
        const data = await res.json();
        console.log("Upload test success:", data);
        setDebugInfo(prev => prev + `\n\nFile Upload Test: SUCCESS\nFile URL: ${data.fileUrl}\nFile Name: ${data.fileName}`);
      } else {
        const errorData = await res.json().catch(() => ({}));
        console.error("Upload test failed:", errorData);
        setDebugInfo(prev => prev + `\n\nFile Upload Test: FAILED\nStatus: ${res.status}\nError: ${errorData.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Upload test error:", error);
      setDebugInfo(prev => prev + `\n\nFile Upload Test: ERROR\n${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white border rounded-lg shadow-lg p-4 max-w-md max-h-96 overflow-auto">
      <h3 className="font-bold mb-2">Debug Info</h3>
      <button
        onClick={testFileUpload}
        className="mb-2 px-2 py-1 bg-blue-500 text-white text-xs rounded"
      >
        Test File Upload
      </button>
      <pre className="text-xs whitespace-pre-wrap">{debugInfo}</pre>
    </div>
  );
} 