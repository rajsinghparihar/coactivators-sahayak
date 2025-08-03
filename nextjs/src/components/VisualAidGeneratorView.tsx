"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Copy, Download, Eye, FileText, Image, Palette, BarChart3 } from "lucide-react";
import { MermaidChart } from "@/components/MermaidChart";
import { MermaidPreview } from "@/components/MermaidPreview";
import { Message } from "@/types";



interface VisualAidGeneratorViewProps {
  messages: Message[];
  isLoading: boolean;
  onSubmit: (query: string, fileUrl?: string, fileName?: string) => void;
  onCancel: () => void;
  userId: string;
  onUserIdChange: (newUserId: string) => void;
  onUserIdConfirm: (confirmedUserId: string) => void;
  sessionId: string;
  onSessionIdChange: (sessionId: string) => void;
  onCreateSession: (sessionUserId: string, initialMessage?: string) => Promise<void>;
}

export function VisualAidGeneratorView({
  messages,
  isLoading,
  onSubmit,
}: VisualAidGeneratorViewProps): React.JSX.Element {
  const [selectedGrades, setSelectedGrades] = useState<string[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [visualType, setVisualType] = useState<string>("mermaid");
  const [subtopic, setSubtopic] = useState<string>("");
  const [selectedCard, setSelectedCard] = useState<Message | null>(null);
  const [copiedCardId, setCopiedCardId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const handleCopy = async (content: string, cardId: string): Promise<void> => {
    await navigator.clipboard.writeText(content);
    setCopiedCardId(cardId);
    setTimeout(() => setCopiedCardId(null), 2000);
  };

  const handleDownload = (content: string, title: string): void => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const gradeOptions = [
    "Kindergarten", "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5",
    "Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12"
  ];

  const topicOptions = [
    "Mathematics", "Science", "English", "History", "Geography", "Art",
    "Music", "Physical Education", "Social Studies", "Computer Science",
    "Literature", "Writing", "Reading", "Grammar", "Spelling"
  ];

  const visualTypeOptions = [
    { value: "mermaid", label: "Mermaid Charts", icon: "📊", description: "Flowcharts, diagrams, and process charts" },
    { value: "infographics", label: "Infographics", icon: "📈", description: "Visual data representations" },
    { value: "mindmaps", label: "Mind Maps", icon: "🧠", description: "Concept mapping and brainstorming" },
    { value: "timelines", label: "Timelines", icon: "⏰", description: "Historical and chronological events" },
    { value: "posters", label: "Educational Posters", icon: "🖼️", description: "Classroom posters and displays" },
    { value: "flashcards", label: "Flashcards", icon: "🗂️", description: "Study cards and memory aids" }
  ];

  const handleGradeToggle = (grade: string) => {
    setSelectedGrades(prev => 
      prev.includes(grade) 
        ? prev.filter(g => g !== grade)
        : [...prev, grade]
    );
  };

  const handleTopicToggle = (topic: string) => {
    setSelectedTopics(prev => 
      prev.includes(topic) 
        ? prev.filter(t => t !== topic)
        : [...prev, topic]
    );
  };

  const handleGenerateVisualAid = () => {
    if (selectedGrades.length === 0 || selectedTopics.length === 0) {
      return;
    }

    const gradesText = selectedGrades.join(", ");
    const topicsText = selectedTopics.join(", ");
    const visualText = visualTypeOptions.find(opt => opt.value === visualType)?.label || visualType;
    const subtopicText = subtopic.trim() ? ` on the subtopic of ${subtopic.trim()}` : "";

    let prompt = `Generate ${visualText} for ${gradesText} on the topic of ${topicsText}${subtopicText}. `;

    if (visualType === "mermaid") {
      prompt += `Please create Mermaid charts that are:
- Age-appropriate for each grade level
- Clear and easy to understand
- Visually engaging
- Include proper Mermaid syntax

Create the following types of charts:
1. Flowcharts showing processes and steps
2. Mind maps for concept organization
3. Timeline charts for historical events
4. Relationship diagrams for connections
5. Hierarchy charts for classifications

For each chart, include:
- Clear title and description
- Proper Mermaid syntax with \`\`\`mermaid code blocks
- Color coding where appropriate
- Multiple difficulty levels if needed

Please format the response as individual visual aids that can be displayed as cards with Mermaid code blocks using \`\`\`mermaid syntax.`;
    } else {
      prompt += `Please create visual aids that are:
- Age-appropriate for each grade level
- Engaging and interactive
- Accessible for different learning styles
- Include clear instructions for implementation
- Provide multiple difficulty levels where appropriate

For each visual aid, include:
1. Learning objectives
2. Materials needed
3. Step-by-step creation instructions
4. Usage guidelines
5. Assessment criteria
6. Extension ideas

Please format the response as individual visual aids that can be displayed as cards.`;
    }

    onSubmit(prompt);
  };



  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const extractMermaidCode = (content: string): string[] => {
    const mermaidMatches = content.match(/```mermaid\n([\s\S]*?)\n```/g);
    if (!mermaidMatches) return [];
    
    const extractedCodes = mermaidMatches.map(match => {
      const codeMatch = match.match(/```mermaid\n([\s\S]*?)\n```/);
      return codeMatch ? codeMatch[1] : "";
    }).filter(code => code.trim() !== "");
    
    console.log("Extracting Mermaid codes:", { 
      totalMatches: mermaidMatches.length, 
      extractedCodes: extractedCodes.length,
      contentLength: content.length 
    });
    
    return extractedCodes;
  };

  return (
    <div className="flex flex-col h-full w-full relative">
      {/* Fixed background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-50 pointer-events-none"></div>

      {/* Fixed Header */}
      <div className="relative z-10 flex-shrink-0 border-b border-gray-200 bg-white/95 backdrop-blur-sm shadow-sm">
        <div className="w-full px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center shadow-md">
              <Image className="h-4 w-4 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                Visual Aid Generator
              </h1>
              <p className="text-xs text-gray-500">Create engaging visual materials</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex-1 overflow-hidden h-full">
        {messages.length === 0 ? (
          /* Visual Aid Generator Placeholder */
          <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 text-center min-h-[60vh]">
            <div className="w-full max-w-4xl space-y-4 sm:space-y-6">
              {/* Main header */}
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center justify-center space-x-2 sm:space-x-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-500/10 rounded-xl flex items-center justify-center">
                    <Image className="w-5 h-5 sm:w-6 sm:h-6 text-purple-500" />
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500/10 rounded-xl flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500/10 rounded-xl flex items-center justify-center">
                    <Palette className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" />
                  </div>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Visual Aid Generator
                </h1>
                <p className="text-base sm:text-lg text-gray-600">
                  Create engaging visual materials for your lessons
                </p>
              </div>

              {/* Description */}
              <div className="space-y-2 sm:space-y-3">
                <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto px-4">
                  Generate charts, diagrams, infographics, and other visual aids that make complex concepts easy to understand and engaging for students.
                </p>
              </div>

              {/* Configuration Section - Scrollable */}
              <div className="bg-white border border-gray-200 rounded-lg max-w-2xl mx-auto max-h-[60vh] overflow-y-auto">
                <div className="p-4 sm:p-6">
                  <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-800">Configure Your Visual Aids</h2>
                  
                  {/* Grade Selection */}
                  <div className="mb-4 sm:mb-6">
                    <h3 className="text-sm font-medium text-gray-700 mb-2 sm:mb-3">Select Grade Levels:</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {gradeOptions.map((grade) => (
                        <button
                          key={grade}
                          onClick={() => handleGradeToggle(grade)}
                          className={`px-2 sm:px-3 py-1 sm:py-2 text-xs rounded-lg border transition-colors ${
                            selectedGrades.includes(grade)
                              ? 'bg-blue-500 text-white border-blue-500'
                              : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                          }`}
                        >
                          {grade}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Topic Selection */}
                  <div className="mb-4 sm:mb-6">
                    <h3 className="text-sm font-medium text-gray-700 mb-2 sm:mb-3">Select Topics:</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {topicOptions.map((topic) => (
                        <button
                          key={topic}
                          onClick={() => handleTopicToggle(topic)}
                          className={`px-2 sm:px-3 py-1 sm:py-2 text-xs rounded-lg border transition-colors ${
                            selectedTopics.includes(topic)
                              ? 'bg-green-500 text-white border-green-500'
                              : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                          }`}
                        >
                          {topic}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Subtopic Input */}
                  <div className="mb-4 sm:mb-6">
                    <h3 className="text-sm font-medium text-gray-700 mb-2 sm:mb-3">Subtopic (Optional):</h3>
                    <Input
                      type="text"
                      placeholder="e.g., Fractions, Photosynthesis, World War II..."
                      value={subtopic}
                      onChange={(e) => setSubtopic(e.target.value)}
                      className="w-full"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Specify a particular subtopic to focus on within the selected topics
                    </p>
                  </div>

                  {/* Visual Type Selection */}
                  <div className="mb-4 sm:mb-6">
                    <h3 className="text-sm font-medium text-gray-700 mb-2 sm:mb-3">Visual Aid Type:</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                      {visualTypeOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => setVisualType(option.value)}
                          className={`p-2 sm:p-3 rounded-lg border transition-colors text-left ${
                            visualType === option.value
                              ? 'bg-purple-500 text-white border-purple-500'
                              : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-base sm:text-lg">{option.icon}</span>
                            <div>
                              <div className="font-medium text-xs sm:text-sm">{option.label}</div>
                              <div className="text-xs opacity-75">{option.description}</div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Generate Button */}
                  <Button
                    onClick={handleGenerateVisualAid}
                    disabled={selectedGrades.length === 0 || selectedTopics.length === 0}
                    className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white"
                  >
                    <Image className="w-4 h-4 mr-2" />
                    Generate Visual Aids
                  </Button>
                  

                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Visual Aids Cards Grid */
          <div className="p-4 sm:p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Generated Visual Aids</h2>
              <p className="text-gray-600">Click on any card to view the full visual aid</p>
              
              {/* Filters and Search */}
              <div className="flex flex-col sm:flex-row gap-4 mt-4">
                <div className="flex-1">
                  <Input
                    type="text"
                    placeholder="Search visual aids..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div className="flex gap-2">
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="all">All Types</option>
                    <option value="human">User Requests</option>
                    <option value="ai">Generated Visual Aids</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {messages
                .filter((message) => {
                  // Filter by type
                  if (filterType !== "all" && message.type !== filterType) {
                    return false;
                  }
                  // Filter by search query
                  if (searchQuery && !message.content.toLowerCase().includes(searchQuery.toLowerCase())) {
                    return false;
                  }
                  return true;
                })
                .map((message) => (
                <Card 
                  key={message.id} 
                  className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-purple-300"
                  onClick={() => setSelectedCard(message)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">📊</span>
                        <div>
                          <CardTitle className="text-sm font-semibold text-gray-900 line-clamp-2">
                            {message.type === "human" ? "User Request" : "Generated Visual Aid"}
                          </CardTitle>
                          <p className="text-xs text-gray-500 mt-1">{message.type}</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {message.type === "human" ? "Request" : "Visual Aid"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <FileText className="w-3 h-3" />
                        <span>Generated Content</span>
                      </div>
                      
                      {/* Mermaid Chart Preview - extract from content */}
                      {message.type === "ai" && message.content.includes("```mermaid") && (
                        <div className="bg-gray-50 rounded-lg p-2 max-h-32 overflow-hidden">
                          {(() => {
                            const mermaidCodes = extractMermaidCode(message.content);
                            console.log("Rendering Mermaid charts:", { 
                              messageId: message.id, 
                              hasMermaidCodes: mermaidCodes.length > 0,
                              codeCount: mermaidCodes.length 
                            });
                            return mermaidCodes.length > 0 ? (
                              <div className="space-y-2">
                                <div className="text-xs text-gray-500 mb-1">
                                  {mermaidCodes.length} chart{mermaidCodes.length > 1 ? 's' : ''} found
                                </div>
                                {mermaidCodes.slice(0, 2).map((code, index) => (
                                  <div key={index} className="border-b border-gray-200 pb-2 last:border-b-0">
                                    <MermaidPreview code={code} />
                                  </div>
                                ))}
                                {mermaidCodes.length > 2 && (
                                  <div className="text-xs text-gray-500 text-center pt-1">
                                    +{mermaidCodes.length - 2} more chart{mermaidCodes.length - 2 > 1 ? 's' : ''}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="text-xs text-gray-500 p-2">
                                Mermaid code detected but could not be extracted
                              </div>
                            );
                          })()}
                        </div>
                      )}
                      
                      <p className="text-xs text-gray-500">
                        {formatDate(message.timestamp)}
                      </p>
                      <div className="flex items-center gap-2 pt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-6 px-2 text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopy(message.content, message.id);
                          }}
                        >
                          <Copy className="w-3 h-3 mr-1" />
                          {copiedCardId === message.id ? "Copied!" : "Copy"}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-6 px-2 text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCard(message);
                          }}
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          View
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-6 px-2 text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownload(message.content, message.type === "human" ? "User Request" : "Generated Visual Aid");
                          }}
                        >
                          <Download className="w-3 h-3 mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Loading indicator */}
            {isLoading && (
              <div className="flex items-center justify-center py-8">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-gray-600">Generating visual aids...</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Visual Aid Detail Modal */}
      <Dialog open={!!selectedCard} onOpenChange={() => setSelectedCard(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="text-2xl">📊</span>
              <div>
                <div className="text-lg font-semibold">
                  {selectedCard?.type === "human" ? "User Request" : "Generated Visual Aid"}
                </div>
                <div className="text-sm text-gray-500">{selectedCard?.type}</div>
              </div>
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="p-4 space-y-4">
              {/* Mermaid Chart */}
              {selectedCard?.type === "ai" && selectedCard?.content.includes("```mermaid") && (
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h3 className="text-sm font-semibold mb-3">Visual Charts</h3>
                  {(() => {
                    const mermaidCodes = extractMermaidCode(selectedCard.content);
                    return mermaidCodes.length > 0 ? (
                      <div className="space-y-4">
                        {mermaidCodes.map((code, index) => (
                          <div key={index} className="border border-gray-200 rounded-lg p-3">
                            <div className="text-sm font-medium mb-2">Chart {index + 1}</div>
                            <MermaidChart code={code} />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500">No Mermaid charts found</div>
                    );
                  })()}
                </div>
              )}
              
              {/* Content */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold mb-2">Content</h3>
                <pre className="text-sm text-gray-700 whitespace-pre-wrap">{selectedCard?.content}</pre>
              </div>
              
              {/* Mermaid Code */}
              {selectedCard?.type === "ai" && selectedCard?.content.includes("```mermaid") && (
                <div className="bg-gray-900 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-white mb-2">Mermaid Code</h3>
                  {(() => {
                    const mermaidCodes = extractMermaidCode(selectedCard.content);
                    return mermaidCodes.length > 0 ? (
                      <div className="space-y-3">
                        {mermaidCodes.map((code, index) => (
                          <div key={index} className="border border-gray-700 rounded p-2">
                            <div className="text-xs text-gray-300 mb-1">Chart {index + 1}</div>
                            <pre className="text-xs text-green-400 overflow-x-auto">
                              <code>{code}</code>
                            </pre>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs text-gray-400">No Mermaid code found</div>
                    );
                  })()}
                </div>
              )}
            </div>
          </ScrollArea>
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => selectedCard && handleCopy(selectedCard.content, selectedCard.id)}
              >
                <Copy className="w-4 h-4 mr-2" />
                {copiedCardId === selectedCard?.id ? "Copied!" : "Copy Content"}
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => selectedCard && handleDownload(selectedCard.content, selectedCard.type === "human" ? "User Request" : "Generated Visual Aid")}
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
            <div className="text-xs text-gray-500">
              {selectedCard && formatDate(selectedCard.timestamp)}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 