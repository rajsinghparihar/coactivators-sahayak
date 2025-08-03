"use client";

import { useEffect, useState } from "react";

interface MermaidPreviewProps {
  code: string;
  className?: string;
}

export function MermaidPreview({ code, className = "" }: MermaidPreviewProps) {
  const [isRendered, setIsRendered] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chartHtml, setChartHtml] = useState<string>("");

  useEffect(() => {
    let isMounted = true;

    const renderChart = async () => {
      try {
        if (!isMounted || !code.trim()) return;

        setError(null);
        setIsRendered(false);
        setChartHtml("");

        console.log("Loading Mermaid module...");
        const mermaidModule = await import('mermaid');
        const mermaid = mermaidModule.default;
        console.log("Mermaid module loaded successfully:", !!mermaid);

        // Initialize with smaller settings for preview
        await mermaid.initialize({
          startOnLoad: false,
          theme: 'default',
          securityLevel: 'loose',
          fontFamily: 'Inter, system-ui, sans-serif',
          fontSize: 10,
          flowchart: {
            useMaxWidth: true,
            htmlLabels: true,
            curve: 'basis'
          },
          sequence: {
            useMaxWidth: true,
            diagramMarginX: 8,
            diagramMarginY: 8
          }
        });

        if (!isMounted) return;

        // Generate unique ID for this chart
        const chartId = `mermaid-preview-${Math.random().toString(36).substr(2, 9)}`;
        
        // Create a temporary div for rendering
        const tempDiv = document.createElement('div');
        tempDiv.id = chartId;
        tempDiv.className = 'mermaid';
        tempDiv.textContent = code;
        
        // Temporarily add to DOM
        document.body.appendChild(tempDiv);

        try {
          await mermaid.run({ nodes: [tempDiv] });
          
          if (isMounted) {
            const svg = tempDiv.querySelector('svg');
                         if (svg) {
               console.log("SVG generated successfully, size:", svg.outerHTML.length);
               // Clone the SVG and clean it up for preview
               const clonedSvg = svg.cloneNode(true) as SVGElement;
               clonedSvg.style.maxWidth = '100%';
               clonedSvg.style.height = 'auto';
               clonedSvg.style.maxHeight = '100px';
               clonedSvg.style.minHeight = '60px';
               
               setChartHtml(clonedSvg.outerHTML);
               setIsRendered(true);
               console.log("Chart rendered successfully");
             } else {
               console.log("No SVG found in rendered chart");
               setError('Failed to generate chart');
             }
          }
        } finally {
          // Clean up
          document.body.removeChild(tempDiv);
        }
      } catch (err) {
        if (!isMounted) return;
        
        console.error('Mermaid preview rendering error:', err);
        setError(err instanceof Error ? err.message : 'Failed to render chart');
        setIsRendered(false);
        setChartHtml("");
      }
    };

    const timeoutId = setTimeout(renderChart, 100);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [code]);

  if (error) {
    return (
      <div className={`text-xs text-gray-500 p-1 ${className}`}>
        Chart preview unavailable
      </div>
    );
  }

  return (
    <div className={`mermaid-preview-container ${className}`}>
      {!isRendered ? (
        <div className="flex items-center justify-center h-16">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
        </div>
      ) : (
        <div 
          className="mermaid-preview-content flex justify-center"
          dangerouslySetInnerHTML={{ __html: chartHtml }}
        />
      )}
    </div>
  );
} 