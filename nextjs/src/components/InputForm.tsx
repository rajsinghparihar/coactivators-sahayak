"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Send, Paperclip } from "lucide-react";

interface InputFormProps {
  onSubmit: (query: string, fileUrl?: string, fileName?: string) => void;
  isLoading: boolean;
  context?: "homepage" | "chat"; // Add context prop for different placeholder text
}

export function InputForm({
  onSubmit,
  isLoading,
  context = "homepage",
}: InputFormProps): React.JSX.Element {
  const [inputValue, setInputValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current && context === "homepage") {
      textareaRef.current.focus();
    }
  }, [context]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e?: React.FormEvent): Promise<void> => {
    if (e) {
      e.preventDefault();
    }
    if ((!inputValue.trim() && !selectedFile) || isLoading) return;
    let fileUrl: string | undefined = undefined;
    let fileName: string | undefined = undefined;
    if (selectedFile) {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", selectedFile);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        fileUrl = data.fileUrl;
        fileName = data.fileName;
      }
      setUploading(false);
      setSelectedFile(null);
    }
    onSubmit(inputValue.trim(), fileUrl, fileName);
    setInputValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const placeholderText =
    context === "chat"
      ? "Add more details, ask questions, or request changes..."
      : "What goal would you like to achieve? e.g., Build a mobile app, Plan a marketing campaign, Learn a new skill...";

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="relative">
        <div
          className={`
          relative flex items-end gap-3 p-3 rounded-2xl border transition-all duration-200
          ${
            isFocused
              ? "border-blue-400/50 bg-white shadow-lg shadow-blue-500/10"
              : "border-gray-300 bg-gray-50 hover:border-gray-400"
          }
          backdrop-blur-sm
        `}
        >
          {/* Input Area */}
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={placeholderText}
              rows={1}
              className="
                resize-none border-0 bg-transparent text-gray-900 placeholder-gray-500
                focus:ring-0 focus:outline-none focus:border-0 focus:shadow-none
                min-h-[80px] max-h-48
                scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-400
                px-0 py-3
              "
              style={{
                fontSize: "16px",
                lineHeight: "1.6",
                border: "none",
                outline: "none",
                boxShadow: "none",
              }}
            />
            {/* Character count for long messages */}
            {inputValue.length > 500 && (
              <div className="absolute bottom-1 right-1 text-xs text-gray-500 bg-white/80 rounded px-1">
                {inputValue.length}/2000
              </div>
            )}
          </div>
          {/* File Upload Button */}
          <div className="flex items-center">
            <label className="cursor-pointer flex items-center">
              <Paperclip className="h-5 w-5 text-slate-400 hover:text-emerald-400" />
              <input
                type="file"
                className="hidden"
                onChange={handleFileChange}
                disabled={isLoading || uploading}
              />
            </label>
            {selectedFile && (
              <span className="ml-2 text-xs text-slate-300 truncate max-w-[120px]">{selectedFile.name}</span>
            )}
          </div>
          {/* Send Button */}
          <Button
            type="submit"
            size="sm"
            disabled={(!inputValue.trim() && !selectedFile) || isLoading || uploading}
            className="
              h-9 px-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700
              text-white border-0 shadow-lg transition-all duration-200
              disabled:opacity-50 disabled:cursor-not-allowed
              disabled:bg-slate-600 disabled:from-slate-600 disabled:to-slate-600
              flex items-center gap-2
            "
          >
            {isLoading || uploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="hidden sm:inline">{uploading ? "Uploading..." : "Planning..."}</span>
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                <span className="hidden sm:inline">
                  {context === "chat" ? "Send" : "Plan Goal"}
                </span>
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
