"use client";

import { useState, useMemo } from "react";
import { MermaidChart } from "./MermaidChart";
import { MermaidErrorBoundary } from "./MermaidErrorBoundary";

interface MermaidRendererProps {
  content: string;
  className?: string;
}

export function MermaidRenderer({ content, className = "" }: MermaidRendererProps) {
  const [expandedCharts, setExpandedCharts] = useState<Set<number>>(new Set());
  const [fixedCodes, setFixedCodes] = useState<Map<number, string>>(new Map());

  // Function to detect Mermaid code blocks
  const extractMermaidBlocks = (text: string): Array<{ type: 'text' | 'mermaid', content: string, index: number }> => {
    const blocks: Array<{ type: 'text' | 'mermaid', content: string, index: number }> = [];
    let blockIndex = 0;

    // Split by Mermaid code blocks - improved regex
    const mermaidRegex = /```mermaid\s*\n([\s\S]*?)\n```/g;
    let lastIndex = 0;
    let match;

    while ((match = mermaidRegex.exec(text)) !== null) {
      // Add text before the mermaid block
      if (match.index > lastIndex) {
        const textContent = text.slice(lastIndex, match.index).trim();
        if (textContent) {
          blocks.push({
            type: 'text',
            content: textContent,
            index: blockIndex++
          });
        }
      }

      // Add the mermaid block
      const mermaidCode = match[1].trim();
      if (mermaidCode) {
        blocks.push({
          type: 'mermaid',
          content: mermaidCode,
          index: blockIndex++
        });
      }

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text after the last mermaid block
    if (lastIndex < text.length) {
      const remainingText = text.slice(lastIndex).trim();
      if (remainingText) {
        blocks.push({
          type: 'text',
          content: remainingText,
          index: blockIndex++
        });
      }
    }

    return blocks;
  };

  // Memoize blocks to prevent unnecessary re-renders
  const blocks = useMemo(() => extractMermaidBlocks(content), [content]);

  const toggleChartExpansion = (index: number) => {
    setExpandedCharts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  // Handle code fixes
  const handleCodeFix = (blockIndex: number, fixedCode: string) => {
    setFixedCodes(prev => {
      const newMap = new Map(prev);
      newMap.set(blockIndex, fixedCode);
      return newMap;
    });
  };

  if (blocks.length === 0) {
    // No Mermaid blocks found, return plain text
    return <div className={className}>{content}</div>;
  }

  return (
    <div className={className}>
      {blocks.map((block, idx) => {
        if (block.type === 'text') {
          return (
            <div key={`text-${block.index}`} className="mb-4">
              {block.content}
            </div>
          );
        } else if (block.type === 'mermaid') {
          const isExpanded = expandedCharts.has(block.index);
          const fixedCode = fixedCodes.get(block.index);
          const displayCode = fixedCode || block.content;
          
          return (
            <div key={`mermaid-${block.index}`} className="mb-6">
              <div className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
                {/* Chart Header */}
                <div className="flex items-center justify-between p-3 bg-gray-100 border-b border-gray-200">
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-medium text-gray-700">Mermaid Chart</span>
                    {fixedCode && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        Fixed
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleChartExpansion(block.index)}
                      className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded hover:bg-gray-200 transition-colors"
                    >
                      {isExpanded ? 'Collapse' : 'Expand'}
                    </button>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(displayCode);
                      }}
                      className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded hover:bg-gray-200 transition-colors"
                      title="Copy Mermaid code"
                    >
                      Copy
                    </button>
                  </div>
                </div>
                
                {/* Chart Content */}
                <div className="p-4">
                  <MermaidErrorBoundary>
                    <MermaidChart 
                      key={`chart-${block.index}-${displayCode.length}`}
                      code={displayCode}
                      onCodeFix={(fixedCode) => handleCodeFix(block.index, fixedCode)}
                    />
                  </MermaidErrorBoundary>
                  
                  {/* Code Preview (when expanded) */}
                  {isExpanded && (
                    <details className="mt-4">
                      <summary className="text-sm text-gray-600 cursor-pointer hover:text-gray-800">
                        Show Mermaid Code
                      </summary>
                      <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-x-auto">
                        <code>{displayCode}</code>
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            </div>
          );
        }
        
        return null;
      })}
    </div>
  );
} 