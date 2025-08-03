"use client";

import { useState } from "react";

export function MermaidSyntaxHelper() {
  const [isExpanded, setIsExpanded] = useState(false);

  const commonErrors = [
    {
      error: "Unclosed brackets",
      example: "A[Start --> B[End",
      fix: "A[Start] --> B[End]",
      description: "Make sure all brackets are properly closed"
    },
    {
      error: "Invalid arrow syntax",
      example: "A -->B",
      fix: "A --> B",
      description: "Add spaces around arrows"
    },
    {
      error: "Missing semicolons",
      example: "A[Start]\nB[End]",
      fix: "A[Start];\nB[End];",
      description: "Add semicolons at the end of node definitions"
    },
    {
      error: "Invalid node names",
      example: "A-B[Start]",
      fix: "A_B[Start]",
      description: "Use underscores instead of hyphens in node names"
    },
    {
      error: "Unclosed quotes",
      example: 'A["Start]',
      fix: 'A["Start"]',
      description: "Make sure all quotes are properly closed"
    }
  ];

  const syntaxExamples = [
    {
      type: "Flowchart",
      code: `graph TD
    A[Start] --> B{Decision?}
    B -->|Yes| C[Do Something]
    B -->|No| D[Do Something Else]
    C --> E[End]
    D --> E`
    },
    {
      type: "Sequence Diagram",
      code: `sequenceDiagram
    participant User
    participant System
    participant Database
    
    User->>System: Request
    System->>Database: Query
    Database-->>System: Response
    System-->>User: Result`
    },
    {
      type: "Pie Chart",
      code: `pie title Distribution
    "Category A" : 30
    "Category B" : 25
    "Category C" : 45`
    }
  ];

  return (
    <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Mermaid Syntax Helper</h3>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors"
        >
          {isExpanded ? "Hide" : "Show"} Helper
        </button>
      </div>

      {isExpanded && (
        <div className="space-y-6">
          {/* Common Errors */}
          <div>
            <h4 className="font-medium text-gray-700 mb-3">Common Syntax Errors</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {commonErrors.map((error, index) => (
                <div key={index} className="bg-white border border-gray-200 rounded-lg p-3">
                  <h5 className="font-medium text-red-600 text-sm mb-2">{error.error}</h5>
                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-gray-500">❌ Wrong:</span>
                      <pre className="bg-red-50 p-1 rounded mt-1">{error.example}</pre>
                    </div>
                    <div>
                      <span className="text-gray-500">✅ Correct:</span>
                      <pre className="bg-green-50 p-1 rounded mt-1">{error.fix}</pre>
                    </div>
                    <p className="text-gray-600">{error.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Syntax Examples */}
          <div>
            <h4 className="font-medium text-gray-700 mb-3">Syntax Examples</h4>
            <div className="space-y-4">
              {syntaxExamples.map((example, index) => (
                <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                  <h5 className="font-medium text-gray-800 mb-2">{example.type}</h5>
                  <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
                    <code>{example.code}</code>
                  </pre>
                </div>
              ))}
            </div>
          </div>

          {/* Tips */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-800 mb-2">💡 Tips for Better Charts</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Use descriptive node names and labels</li>
              <li>• Keep charts simple and focused</li>
              <li>• Test your syntax in small chunks</li>
              <li>• Use comments (%% comment %%) for notes</li>
              <li>• Check for proper spacing around arrows and brackets</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
} 