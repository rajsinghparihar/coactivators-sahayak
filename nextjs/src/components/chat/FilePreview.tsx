"use client";

import { useState } from "react";
import { FileText, Image, File, Download, Eye, EyeOff, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FilePreviewProps {
  fileUrl: string;
  fileName: string;
  className?: string;
}

export function FilePreview({ fileUrl, fileName, className = "" }: FilePreviewProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Determine file type
  const getFileType = (fileName: string): "image" | "document" | "other" => {
    const extension = fileName.toLowerCase().split('.').pop();
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'];
    const documentExtensions = ['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt'];
    
    if (imageExtensions.includes(extension || '')) {
      return 'image';
    } else if (documentExtensions.includes(extension || '')) {
      return 'document';
    }
    return 'other';
  };

  const fileType = getFileType(fileName);
  const isImage = fileType === 'image';
  const isDocument = fileType === 'document';

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    link.click();
  };

  const handlePreview = () => {
    if (isImage) {
      setIsExpanded(!isExpanded);
    } else if (isDocument) {
      // For documents, use the view-file API endpoint
      try {
        // Extract the file path from the URL
        const urlParts = fileUrl.split('/uploads/');
        if (urlParts.length > 1) {
          const filePath = urlParts[1];
          const viewUrl = `/api/view-file?path=${encodeURIComponent(filePath)}`;
          window.open(viewUrl, '_blank');
        } else {
          // Fallback to direct URL
          window.open(fileUrl, '_blank');
        }
      } catch (error) {
        // If anything fails, just download the file
        handleDownload();
      }
    } else {
      // For other files, just download
      handleDownload();
    }
  };

  return (
    <div className={`bg-gray-50 border border-gray-200 rounded-lg p-3 ${className}`}>
      {/* File Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          {isImage ? (
            <Image className="w-4 h-4 text-blue-600" />
          ) : isDocument ? (
            <FileText className="w-4 h-4 text-green-600" />
          ) : (
            <File className="w-4 h-4 text-gray-600" />
          )}
          <span className="text-sm font-medium text-gray-700 truncate max-w-32">
            {fileName}
          </span>
        </div>
        <div className="flex items-center space-x-1">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePreview}
            className="h-6 px-2 text-xs border-gray-300 bg-white hover:bg-gray-50 text-gray-700 hover:text-gray-900"
            title={isImage ? (isExpanded ? "Collapse image" : "Expand image") : "View file"}
          >
            {isImage ? (
              isExpanded ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />
            ) : isDocument ? (
              <ExternalLink className="w-3 h-3" />
            ) : (
              <Eye className="w-3 h-3" />
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            className="h-6 px-2 text-xs border-gray-300 bg-white hover:bg-gray-50 text-gray-700 hover:text-gray-900"
            title="Download file"
          >
            <Download className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* File Preview */}
      {isImage && (
        <div className="relative">
          {isExpanded ? (
            <div className="relative">
              <img
                src={fileUrl}
                alt={fileName}
                className="w-full h-auto max-h-64 object-contain rounded border border-gray-300"
                onLoad={() => setIsLoading(false)}
                onError={() => setIsLoading(false)}
              />
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                </div>
              )}
            </div>
          ) : (
            <div className="w-16 h-16 bg-gray-200 rounded border border-gray-300 flex items-center justify-center">
              <Image className="w-6 h-6 text-gray-400" />
            </div>
          )}
        </div>
      )}

      {!isImage && !isDocument && (
        <div className="flex items-center space-x-2 p-2 bg-white border border-gray-300 rounded">
          <File className="w-4 h-4 text-gray-600" />
          <span className="text-xs text-gray-600">
            {fileName}
          </span>
        </div>
      )}
    </div>
  );
} 