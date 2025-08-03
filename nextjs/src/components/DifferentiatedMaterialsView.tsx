"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Copy, Download, Eye, FileText, GraduationCap, Users, BookOpen } from "lucide-react";
import { Message } from "@/types";



interface DifferentiatedMaterialsViewProps {
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

export function DifferentiatedMaterialsView({
  messages,
  isLoading,
  onSubmit,
}: DifferentiatedMaterialsViewProps): React.JSX.Element {
  const [selectedGrades, setSelectedGrades] = useState<string[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [materialsType, setMaterialsType] = useState<string>("worksheets");
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

  const materialsTypeOptions = [
    { value: "worksheets", label: "Worksheets", icon: "📝" },
    { value: "activities", label: "Activities", icon: "🎯" },
    { value: "assessments", label: "Assessments", icon: "📊" },
    { value: "games", label: "Games", icon: "🎮" },
    { value: "projects", label: "Projects", icon: "🏗️" },
    { value: "reading", label: "Reading Materials", icon: "📚" }
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

  const handleGenerateMaterials = () => {
    if (selectedGrades.length === 0 || selectedTopics.length === 0) {
      return;
    }

    const gradesText = selectedGrades.join(", ");
    const topicsText = selectedTopics.join(", ");
    const materialsText = materialsTypeOptions.find(opt => opt.value === materialsType)?.label || materialsType;
    const subtopicText = subtopic.trim() ? ` on the subtopic of ${subtopic.trim()}` : "";

    const prompt = `Generate differentiated ${materialsText} for ${gradesText} on the topic of ${topicsText}${subtopicText}. 

Please create materials that are:
- Age-appropriate for each grade level
- Engaging and interactive
- Accessible for different learning styles
- Include clear instructions and objectives
- Provide multiple difficulty levels where appropriate

For each grade level, include:
1. Learning objectives
2. Materials needed
3. Step-by-step instructions
4. Assessment criteria
5. Extension activities for advanced learners
6. Support strategies for struggling learners

Please format the response as individual materials that can be displayed as cards.`;

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

  return (
    <div className="flex flex-col h-full w-full relative">
      {/* Fixed background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-50 pointer-events-none"></div>

      {/* Fixed Header */}
      <div className="relative z-10 flex-shrink-0 border-b border-gray-200 bg-white/95 backdrop-blur-sm shadow-sm">
        <div className="w-full px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-md">
              <GraduationCap className="h-4 w-4 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                Differentiated Materials Generator
              </h1>
              <p className="text-xs text-gray-500">Create tailored materials for multiple grades</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex-1 overflow-hidden h-full">
        {messages.length === 0 ? (
          /* Differentiated Materials Generator Placeholder */
          <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 text-center min-h-[60vh]">
            <div className="w-full max-w-4xl space-y-4 sm:space-y-6">
              {/* Main header */}
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center justify-center space-x-2 sm:space-x-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500/10 rounded-xl flex items-center justify-center">
                    <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" />
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500/10 rounded-xl flex items-center justify-center">
                    <Users className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
                  </div>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-500/10 rounded-xl flex items-center justify-center">
                    <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-purple-500" />
                  </div>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Differentiated Materials Generator
                </h1>
                <p className="text-base sm:text-lg text-gray-600">
                  Create tailored educational materials for multiple grades
                </p>
              </div>

              {/* Description */}
              <div className="space-y-2 sm:space-y-3">
                <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto px-4">
                  Generate age-appropriate, engaging materials that accommodate different learning styles and abilities across multiple grade levels.
                </p>
              </div>

              {/* Configuration Section - Scrollable */}
              <div className="bg-white border border-gray-200 rounded-lg max-w-2xl mx-auto max-h-[60vh] overflow-y-auto">
                <div className="p-4 sm:p-6">
                  <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-800">Configure Your Materials</h2>
                  
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

                  {/* Materials Type Selection */}
                  <div className="mb-4 sm:mb-6">
                    <h3 className="text-sm font-medium text-gray-700 mb-2 sm:mb-3">Materials Type:</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {materialsTypeOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => setMaterialsType(option.value)}
                          className={`px-2 sm:px-3 py-1 sm:py-2 text-xs rounded-lg border transition-colors ${
                            materialsType === option.value
                              ? 'bg-purple-500 text-white border-purple-500'
                              : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                          }`}
                        >
                          <span className="mr-1">{option.icon}</span>
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Generate Button */}
                  <Button
                    onClick={handleGenerateMaterials}
                    disabled={selectedGrades.length === 0 || selectedTopics.length === 0}
                    className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    Generate Differentiated Materials
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Materials Cards Grid */
          <div className="p-4 sm:p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Generated Materials</h2>
              <p className="text-gray-600">Click on any card to view the full content</p>
              
              {/* Filters and Search */}
              <div className="flex flex-col sm:flex-row gap-4 mt-4">
                <div className="flex-1">
                  <Input
                    type="text"
                    placeholder="Search materials..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div className="flex gap-2">
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="all">All Types</option>
                    <option value="human">User Requests</option>
                    <option value="ai">Generated Materials</option>
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
                  className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-green-300"
                  onClick={() => setSelectedCard(message)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">📝</span>
                        <div>
                          <CardTitle className="text-sm font-semibold text-gray-900 line-clamp-2">
                            {message.type === "human" ? "User Request" : "Generated Material"}
                          </CardTitle>
                          <p className="text-xs text-gray-500 mt-1">{message.type}</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {message.type === "human" ? "Request" : "Material"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <FileText className="w-3 h-3" />
                        <span>Generated Content</span>
                      </div>
                      
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
                            handleDownload(message.content, message.type === "human" ? "User Request" : "Generated Material");
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
                  <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-gray-600">Generating materials...</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Material Detail Modal */}
      <Dialog open={!!selectedCard} onOpenChange={() => setSelectedCard(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="text-2xl">📝</span>
              <div>
                <div className="text-lg font-semibold">
                  {selectedCard?.type === "human" ? "User Request" : "Generated Material"}
                </div>
                <div className="text-sm text-gray-500">{selectedCard?.type}</div>
              </div>
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="prose prose-sm max-w-none p-4">
              <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-4 rounded-lg">
                {selectedCard?.content}
              </pre>
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
                onClick={() => selectedCard && handleDownload(selectedCard.content, selectedCard.type === "human" ? "User Request" : "Generated Material")}
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