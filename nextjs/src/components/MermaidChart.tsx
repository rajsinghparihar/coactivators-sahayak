"use client";

import { useEffect, useRef, useState } from "react";

interface MermaidChartProps {
  code: string;
  className?: string;
  onCodeFix?: (fixedCode: string) => void;
}

interface ErrorInfo {
  lineNumber?: number;
  message: string;
  originalCode: string;
  fixedCode: string;
}

export function MermaidChart({ code, className = "", onCodeFix }: MermaidChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isRendered, setIsRendered] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [chartHtml, setChartHtml] = useState<string>("");
  const [errorInfo, setErrorInfo] = useState<ErrorInfo | null>(null);


  // Initialize Mermaid once
  useEffect(() => {
    let isMounted = true;

    const initializeMermaid = async () => {
      try {
        const mermaidModule = await import('mermaid');
        const mermaid = mermaidModule.default;

        await mermaid.initialize({
          startOnLoad: false,
          theme: 'default',
          securityLevel: 'loose',
          fontFamily: 'Inter, system-ui, sans-serif',
          fontSize: 14
        });
        
        if (isMounted) {
          setIsInitialized(true);
          console.log('Mermaid initialized successfully');
        }
      } catch (error) {
        console.error('Failed to initialize Mermaid:', error);
        if (isMounted) {
          setError('Failed to initialize chart library');
          setIsInitialized(false);
        }
      }
    };

    initializeMermaid();

    return () => {
      isMounted = false;
    };
  }, []);

  // Function to clean up problematic characters in node labels
  const cleanNodeLabels = (code: string): string => {
    return code
      .replace(/\[([^\]]*)\]/g, (match, content) => {
        // Clean up the content inside brackets
        const cleaned = content
          .replace(/[()]/g, '') // Remove parentheses
          .replace(/[\/\\]/g, '-') // Replace slashes with hyphens
          .replace(/[&]/g, 'and') // Replace & with 'and'
          .replace(/[#]/g, '') // Remove #
          .replace(/[{}]/g, '') // Remove braces
          .replace(/[<>]/g, '') // Remove angle brackets
          .replace(/[|]/g, '') // Remove pipes
          .replace(/[`]/g, '') // Remove backticks
          .replace(/['"]/g, '') // Remove quotes
          .replace(/\s+/g, ' ') // Normalize whitespace
          .trim();
        return `[${cleaned}]`;
      })
      .replace(/-->/g, '-->') // Ensure proper arrow spacing
      .replace(/<--/g, '<--') // Ensure proper arrow spacing
      .replace(/;\s*$/g, '') // Remove trailing semicolons
      .trim();
  };

  // Function to safely comment out problematic lines
  const safelyCommentLine = (lines: string[], lineIndex: number): string[] => {
    const newLines = [...lines];
    const originalLine = newLines[lineIndex];
    
    // Create a clean comment without error message details
    const comment = `%% ${originalLine.trim()} %% FIXED`;
    newLines[lineIndex] = comment;
    
    return newLines;
  };

  // Function to clean up error messages from the code
  const cleanErrorMessages = (code: string): string => {
    return code
      .split('\n')
      .filter(line => {
        const trimmed = line.trim();
        // Remove lines that contain error message patterns
        return !trimmed.includes('FIXED: Parse error') &&
               !trimmed.includes('Expecting') &&
               !trimmed.includes('got') &&
               !trimmed.includes('^') &&
               !trimmed.includes('----------------------') &&
               !trimmed.includes('NODE_STRING') &&
               !trimmed.includes('SEMI') &&
               !trimmed.includes('NEWLINE') &&
               !trimmed.includes('EOF') &&
               !trimmed.includes('AMP') &&
               !trimmed.includes('START_LINK') &&
               !trimmed.includes('LINK') &&
               !trimmed.includes('LINK_ID');
      })
      .join('\n');
  };

  // Function to try rendering with progressive error fixing
  const tryRenderWithFixes = async (originalCode: string, mermaid: typeof import('mermaid').default): Promise<{ success: boolean; svg?: string; errorInfo?: ErrorInfo }> => {
    let currentCode = originalCode;
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      try {
        // Clean up the code
        const processedCode = cleanNodeLabels(currentCode);
        console.log(`Attempt ${attempts + 1} - Processed Mermaid code:`, processedCode);

        const { svg } = await mermaid.render(`mermaid-chart-${Date.now()}`, processedCode);
        return { success: true, svg };
      } catch (err) {
        attempts++;
        console.log(`Attempt ${attempts} failed:`, err);

        if (attempts >= maxAttempts) {
          // Try to identify and comment out problematic lines
          const lines = currentCode.split('\n');
          const errorMessage = err instanceof Error ? err.message : 'Unknown error';
          
          // Try to identify the problematic line from error message
          let problematicLine = -1;
          if (errorMessage.includes('line')) {
            const lineMatch = errorMessage.match(/line\s+(\d+)/i);
            if (lineMatch) {
              problematicLine = parseInt(lineMatch[1]) - 1;
            }
          }

          if (problematicLine >= 0 && problematicLine < lines.length) {
            // Comment out the problematic line
            const fixedLines = safelyCommentLine(lines, problematicLine);
            let fixedCode = fixedLines.join('\n');
            
            // Clean up any error messages that might have been added
            fixedCode = cleanErrorMessages(fixedCode);
            
            return {
              success: false,
              errorInfo: {
                lineNumber: problematicLine + 1,
                message: `Commented out problematic line ${problematicLine + 1}: ${errorMessage}`,
                originalCode: originalCode,
                fixedCode: fixedCode
              }
            };
          } else {
            // If we can't identify the specific line, try commenting out the last non-empty, non-comment line
            for (let i = lines.length - 1; i >= 0; i--) {
              const trimmedLine = lines[i].trim();
              if (trimmedLine && !trimmedLine.startsWith('%%') && !trimmedLine.startsWith('graph') && !trimmedLine.startsWith('flowchart')) {
                const fixedLines = safelyCommentLine(lines, i);
                let fixedCode = fixedLines.join('\n');
                
                // Clean up any error messages that might have been added
                fixedCode = cleanErrorMessages(fixedCode);
                
                return {
                  success: false,
                  errorInfo: {
                    lineNumber: i + 1,
                    message: `Commented out line ${i + 1} due to syntax error: ${errorMessage}`,
                    originalCode: originalCode,
                    fixedCode: fixedCode
                  }
                };
              }
            }
          }

          return {
            success: false,
            errorInfo: {
              message: `Failed to render chart after ${maxAttempts} attempts: ${errorMessage}`,
              originalCode: originalCode,
              fixedCode: cleanErrorMessages(originalCode)
            }
          };
        }

        // For the next attempt, try a more aggressive cleanup
        currentCode = cleanNodeLabels(currentCode);
      }
    }

    return { success: false };
  };

  // Render chart when code changes or mermaid is initialized
  useEffect(() => {
    if (!isInitialized || !code.trim()) return;

    let isMounted = true;

    const renderChart = async () => {
      try {
        if (!isMounted) return;

        setError(null);
        setErrorInfo(null);
        setIsRendered(false);
        setChartHtml("");

        const mermaidModule = await import('mermaid');
        const mermaid = mermaidModule.default;

        const result = await tryRenderWithFixes(code, mermaid);

        if (isMounted) {
          if (result.success && result.svg) {
            setChartHtml(result.svg);
            setIsRendered(true);
            console.log('Chart rendered successfully');
          } else if (result.errorInfo) {
            setErrorInfo(result.errorInfo);
            setError(result.errorInfo.message);
            setIsRendered(false);
            setChartHtml("");
          } else {
            setError('Failed to render chart after multiple attempts');
            setIsRendered(false);
            setChartHtml("");
          }
        }
      } catch (err) {
        if (!isMounted) return;
        
        console.error('Mermaid rendering error:', err);
        setError(err instanceof Error ? err.message : 'Failed to render chart');
        setIsRendered(false);
        setChartHtml("");
      }
    };

    const timeoutId = setTimeout(renderChart, 300);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [code, isInitialized]);

  // Handle applying fixed code
  const handleApplyFixedCode = () => {
    if (errorInfo && onCodeFix) {
      onCodeFix(errorInfo.fixedCode);
    }
  };

  if (error) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center space-x-2">
          <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <span className="text-red-700 font-medium">Chart Rendering Error</span>
        </div>
        <p className="text-red-600 text-sm mt-2">{error}</p>
        
        {errorInfo && (
          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-yellow-800 text-sm font-medium mb-2">Auto-fix attempted:</p>
            <details className="text-xs">
              <summary className="cursor-pointer text-yellow-700 hover:text-yellow-800">
                Show fixed code
              </summary>
              <pre className="mt-2 p-2 bg-white border rounded text-xs overflow-x-auto">
                <code>{errorInfo.fixedCode}</code>
              </pre>
            </details>
            {onCodeFix && (
              <button
                onClick={handleApplyFixedCode}
                className="mt-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded hover:bg-yellow-200 transition-colors"
              >
                Try with fixed code
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`mermaid-chart-container ${className}`}>
      <div 
        ref={containerRef} 
        className="mermaid-chart bg-white border border-gray-200 rounded-lg p-4 overflow-auto"
        style={{ minHeight: '200px' }}
      >
        {!isRendered ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">
              {!isInitialized ? 'Initializing chart library...' : 'Rendering chart...'}
            </span>
          </div>
        ) : (
          <div 
            className="mermaid-chart-content flex justify-center"
            dangerouslySetInnerHTML={{ __html: chartHtml }}
          />
        )}
      </div>
    </div>
  );
} 