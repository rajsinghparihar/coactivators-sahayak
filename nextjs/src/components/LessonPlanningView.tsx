"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Calendar, BookOpen, Send } from "lucide-react";
import { Message } from "@/types";
import ReactMarkdown from "react-markdown";

interface LessonPlanningViewProps {
  onSubmit: (query: string, fileUrl?: string, fileName?: string) => void;
  isLoading: boolean;
  onCancel: () => void;
  messages: Message[];
}

interface WeeklyPlan {
  day: string;
  activities: string[];
  objectives: string[];
  materials: string[];
}

export function LessonPlanningView({
  onSubmit,
  isLoading,
  onCancel,
  messages,
}: LessonPlanningViewProps) {
  const [grade, setGrade] = useState("");
  const [topic, setTopic] = useState("");
  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyPlan[]>([]);
  const [isParsing, setIsParsing] = useState(false);

  // Function to preprocess content and convert HTML to markdown
  const preprocessContent = (content: string): string => {
    return content
      .replace(/<br\s*\/?>/gi, '\n') // Convert <br> to line breaks
      .replace(/<br\s*\/?>/gi, '\n') // Handle self-closing <br/>
      .replace(/<strong>(.*?)<\/strong>/gi, '**$1**') // Convert <strong> to **
      .replace(/<b>(.*?)<\/b>/gi, '**$1**') // Convert <b> to **
      .replace(/<em>(.*?)<\/em>/gi, '*$1*') // Convert <em> to *
      .replace(/<i>(.*?)<\/i>/gi, '*$1*') // Convert <i> to *
      .replace(/<u>(.*?)<\/u>/gi, '__$1__') // Convert <u> to __
      .replace(/<div>(.*?)<\/div>/gi, '\n$1\n') // Convert <div> to line breaks
      .replace(/<span>(.*?)<\/span>/gi, '$1') // Remove <span> tags
      .replace(/\n\s*\n/g, '\n\n') // Clean up multiple line breaks
      .trim();
  };

  // Debug: Log messages received
  useEffect(() => {
    console.log("LessonPlanningView received messages:", messages);
    console.log("LessonPlanningView isLoading:", isLoading);
  }, [messages, isLoading]);

  // Parse the last AI message for weekly plan table
  useEffect(() => {
    console.log("=== LessonPlanningView Debug ===");
    console.log("Messages length:", messages.length);
    console.log("Is loading:", isLoading);
    console.log("Weekly plan state:", weeklyPlan);
    
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      console.log("Last message in lesson planning:", {
        type: lastMessage.type,
        contentLength: lastMessage.content?.length,
        content: lastMessage.content?.substring(0, 200) + "...",
        isLoading
      });
      
      if (lastMessage.type === "ai" && lastMessage.content && !isLoading) {
        console.log("Starting to parse lesson plan content");
        setIsParsing(true);
        parseWeeklyPlan(lastMessage.content);
        setIsParsing(false);
      } else {
        console.log("Not parsing because:", {
          isAI: lastMessage.type === "ai",
          hasContent: !!lastMessage.content,
          isLoading
        });
      }
    } else {
      console.log("No messages available for parsing");
    }
  }, [messages, isLoading]);

  const parseWeeklyPlan = (content: string) => {
    console.log("=== parseWeeklyPlan called ===");
    console.log("Content length:", content.length);
    console.log("Content preview:", content.substring(0, 500));
    
    // Try multiple table patterns
    const tablePatterns = [
      /\|.*\|.*\|.*\|.*\|.*\|[\s\S]*?(\|.*\|.*\|.*\|.*\|.*\|[\s\S]*?)(?=\n\n|\n$|$)/,
      /\|.*\|.*\|.*\|.*\|[\s\S]*?(\|.*\|.*\|.*\|.*\|[\s\S]*?)(?=\n\n|\n$|$)/,
      /\|.*\|.*\|.*\|[\s\S]*?(\|.*\|.*\|.*\|[\s\S]*?)(?=\n\n|\n$|$)/
    ];
    
    let match = null;
    let tableContent = "";
    
    for (const pattern of tablePatterns) {
      match = content.match(pattern);
      if (match) {
        tableContent = match[1];
        console.log("Found table with pattern:", pattern);
        break;
      }
    }
    
    console.log("Table pattern match:", !!match);
    
    if (match && tableContent) {
      console.log("Found table content:", tableContent);
      
      // Split into rows and parse
      const rows = tableContent.trim().split('\n').filter(row => row.trim() && row.includes('|'));
      console.log("Number of rows found:", rows.length);
      
      const parsedPlan: WeeklyPlan[] = [];
      
      for (const row of rows) {
        console.log("Processing row:", row);
        // Skip header row and separator row
        if (row.includes('Day') || row.includes('---') || row.includes('|--')) {
          console.log("Skipping header/separator row");
          continue;
        }
        
        const columns = row.split('|').map(col => col.trim()).filter(col => col);
        console.log("Columns found:", columns.length, columns);
        
        // Handle different column counts
        if (columns.length >= 4) {
          const day = columns[0];
          const lessonContent = columns[1] || "";
          const learningObjectives = columns[2] || "";
          const instructionalMethods = columns[3] || "";
          const assessment = columns[4] || "";
          
          // Validate that this is actually a day
          const dayMatch = day.match(/(Monday|Tuesday|Wednesday|Thursday|Friday)/i);
          if (dayMatch) {
            const dayPlan: WeeklyPlan = {
              day: dayMatch[1],
              activities: [lessonContent],
              objectives: [learningObjectives],
              materials: [instructionalMethods, assessment]
            };
            
            parsedPlan.push(dayPlan);
            console.log("Added day plan:", dayPlan);
          } else {
            console.log("Not a valid day:", day);
          }
        } else {
          console.log("Row doesn't have enough columns:", columns.length);
        }
      }
      
      if (parsedPlan.length > 0) {
        console.log("Final parsed plan:", parsedPlan);
        setWeeklyPlan(parsedPlan);
      } else {
        console.log("No plans parsed from table, trying alternative parsing");
        parseAlternativeFormat(content);
      }
    } else {
      console.log("No table pattern found, trying alternative parsing");
      parseAlternativeFormat(content);
    }
  };

  const parseAlternativeFormat = (content: string) => {
    console.log("Trying alternative format parsing");
    
    // Look for any table-like structure or structured content
    const lines = content.split('\n').filter(line => line.trim());
    const parsedPlan: WeeklyPlan[] = [];
    
    // First, try to find day sections
    const daySections: { [key: string]: string[] } = {};
    let currentDay = "";
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Look for day patterns
      const dayMatch = line.match(/(Monday|Tuesday|Wednesday|Thursday|Friday)/i);
      if (dayMatch) {
        currentDay = dayMatch[1];
        daySections[currentDay] = [];
        console.log("Found day section:", currentDay);
      } else if (currentDay && line.trim()) {
        // Add content to current day
        daySections[currentDay].push(line.trim());
      }
    }
    
    console.log("Day sections found:", Object.keys(daySections));
    
    // Parse each day's content
    for (const [day, content] of Object.entries(daySections)) {
      if (content.length > 0) {
        const fullContent = content.join('\n');
        console.log(`Parsing content for ${day}:`, fullContent.substring(0, 200));
        
        // Extract different sections
        let lessonContent = "";
        let learningObjectives = "";
        let instructionalMethods = "";
        let assessment = "";
        
        // Look for content indicators
        for (const line of content) {
          if (line.includes('Content:') || line.includes('Lesson:') || line.includes('**Introduction')) {
            lessonContent = line.replace(/^(Content|Lesson):\s*/, '').trim();
          } else if (line.includes('Objective:') || line.includes('Goal:') || line.includes('**Remember:') || line.includes('**Understand:')) {
            learningObjectives = line.replace(/^(Objective|Goal):\s*/, '').trim();
          } else if (line.includes('Method:') || line.includes('Strategy:') || line.includes('**Direct Instruction:') || line.includes('**Inquiry-Based')) {
            instructionalMethods = line.replace(/^(Method|Strategy):\s*/, '').trim();
          } else if (line.includes('Assessment:') || line.includes('Evaluation:') || line.includes('**Formative:') || line.includes('**Summative:')) {
            assessment = line.replace(/^(Assessment|Evaluation):\s*/, '').trim();
          }
        }
        
        // If we found any content, create a plan
        if (lessonContent || learningObjectives || instructionalMethods || assessment) {
          const dayPlan: WeeklyPlan = {
            day: day,
            activities: [lessonContent],
            objectives: [learningObjectives],
            materials: [instructionalMethods, assessment]
          };
          
          parsedPlan.push(dayPlan);
          console.log("Added day plan (alternative):", dayPlan);
        }
      }
    }
    
    if (parsedPlan.length > 0) {
      console.log("Alternative parsing successful:", parsedPlan);
      setWeeklyPlan(parsedPlan);
    } else {
      console.log("Alternative parsing failed, trying simple format");
      parseSimpleFormat(content);
    }
  };

  const parseSimpleFormat = (content: string) => {
    console.log("Trying simple format parsing");
    
    const parsedPlan: WeeklyPlan[] = [];
    const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    
    // Try different table patterns for each day
    for (const day of daysOfWeek) {
      console.log(`Looking for ${day} in content`);
      
      // Try multiple patterns for each day
      const patterns = [
        new RegExp(`\\|\\s*${day}\\s*\\|\\s*([^|]*)\\|\\s*([^|]*)\\|\\s*([^|]*)\\|\\s*([^|]*)\\|`, 'i'),
        new RegExp(`\\|\\s*${day}\\s*\\|\\s*([^|]*)\\|\\s*([^|]*)\\|\\s*([^|]*)\\|`, 'i'),
        new RegExp(`\\|\\s*${day}\\s*\\|\\s*([^|]*)\\|\\s*([^|]*)\\|`, 'i')
      ];
      
      let dayPlan: WeeklyPlan | null = null;
      
      for (const pattern of patterns) {
        const match = content.match(pattern);
        if (match) {
          console.log(`Found ${day} with pattern:`, pattern);
          
          const lessonContent = match[1]?.trim() || "";
          const learningObjectives = match[2]?.trim() || "";
          const instructionalMethods = match[3]?.trim() || "";
          const assessment = match[4]?.trim() || "";
          
          dayPlan = {
            day: day,
            activities: [lessonContent],
            objectives: [learningObjectives],
            materials: [instructionalMethods, assessment]
          };
          
          console.log("Created day plan (simple):", dayPlan);
          break;
        }
      }
      
      if (dayPlan) {
        parsedPlan.push(dayPlan);
      }
    }
    
    if (parsedPlan.length > 0) {
      console.log("Final parsed plan (simple):", parsedPlan);
      setWeeklyPlan(parsedPlan);
    } else {
      console.log("All parsing methods failed");
    }
  };

  const handleSubmit = () => {
    if (!grade.trim() || !topic.trim()) return;
    
    const prompt = `You are an expert curriculum developer and lesson planner. Create a comprehensive weekly lesson plan for Grade ${grade} on the topic: "${topic}". 

IMPORTANT: You must respond with ONLY a markdown table in the following format:

| Day | Lesson Content | Learning Objectives | Instructional Methods | Assessment/Evaluation |
|-----|----------------|-------------------|---------------------|---------------------|
| Monday | [Core content/concept introduction] | [Specific, measurable learning objectives] | [Teaching strategies and methods] | [How to assess learning] |
| Tuesday | [Content development and practice] | [Specific, measurable learning objectives] | [Teaching strategies and methods] | [How to assess learning] |
| Wednesday | [Application and problem-solving] | [Specific, measurable learning objectives] | [Teaching strategies and methods] | [How to assess learning] |
| Thursday | [Review and reinforcement] | [Specific, measurable learning objectives] | [Teaching strategies and methods] | [How to assess learning] |
| Friday | [Assessment and synthesis] | [Specific, measurable learning objectives] | [Teaching strategies and methods] | [How to assess learning] |

Requirements for each day:
- Lesson Content: Focus on core academic concepts, skills, and knowledge development
- Learning Objectives: Use Bloom's Taxonomy (Remember, Understand, Apply, Analyze, Evaluate, Create) with specific, measurable outcomes
- Instructional Methods: Include direct instruction, guided practice, collaborative learning, inquiry-based learning, and differentiated instruction strategies
- Assessment/Evaluation: Include formative and summative assessment methods appropriate for Grade ${grade} level
- Ensure logical progression of learning throughout the week
- Align with grade-level standards and curriculum expectations
- Include scaffolding and support for diverse learners
- Maintain academic rigor while being age-appropriate

FORMATTING REQUIREMENTS:
- Use markdown formatting (**, *, __) for emphasis, NOT HTML tags
- Use bullet points (- or *) for lists
- Keep content concise but comprehensive

Respond with ONLY the table, no additional text or explanations.`;

    onSubmit(prompt);
  };

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

  return (
    <div className="flex flex-col h-full w-full relative">
      {/* Fixed background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-50 pointer-events-none"></div>

      {/* Fixed Header */}
      <div className="relative z-10 flex-shrink-0 border-b border-gray-200 bg-white/95 backdrop-blur-sm shadow-sm">
        <div className="w-full px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-md">
              <BookOpen className="h-4 w-4 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                Lesson Planning
              </h1>
              <p className="text-xs text-gray-500">Create weekly lesson plans</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex-1 overflow-y-auto pb-32 sm:pb-36">
        <div className="w-full px-4 py-6 sm:px-6">
          {/* Input Form */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Lesson Plan Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Grade Level
                  </label>
                  <Input
                    placeholder="e.g., 3, 4, 5"
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Topic/Subject
                  </label>
                  <Input
                    placeholder="e.g., Fractions, Photosynthesis, Ancient Egypt"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>
              
              <Button
                onClick={handleSubmit}
                disabled={!grade.trim() || !topic.trim() || isLoading}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Creating Lesson Plan...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Generate Weekly Plan
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Weekly Plan Calendar */}
          {weeklyPlan.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Weekly Lesson Plan - Grade {grade} - {topic}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
                  {daysOfWeek.map((day) => {
                    const dayPlan = weeklyPlan.find(plan => 
                      plan.day.toLowerCase() === day.toLowerCase()
                    );
                    
                    console.log(`Looking for ${day}, found:`, dayPlan);
                    
                    return (
                      <div key={day} className="border rounded-lg p-3 sm:p-4 bg-white shadow-sm">
                        <h3 className="font-semibold text-gray-900 mb-2 sm:mb-3 text-center text-sm sm:text-base">
                          {day}
                        </h3>
                        
                        {dayPlan ? (
                          <div className="space-y-3">
                            {dayPlan.activities.length > 0 && (
                              <div>
                                <h4 className="text-sm font-medium text-gray-700 mb-1">
                                  Lesson Content
                                </h4>
                                <div className="text-xs text-gray-600 space-y-1">
                                  {dayPlan.activities.map((activity, index) => (
                                    <div key={index} className="prose prose-sm max-w-none">
                                      <ReactMarkdown
                                        components={{
                                          p: ({ children }) => <p className="mb-1">{children}</p>,
                                          ul: ({ children }) => <ul className="list-disc list-inside space-y-1">{children}</ul>,
                                          li: ({ children }) => <li className="text-xs">{children}</li>,
                                          strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                                          em: ({ children }) => <em className="italic">{children}</em>,
                                          br: () => <br />,
                                          // Handle HTML elements
                                          div: ({ children, ...props }) => <div {...props}>{children}</div>,
                                          span: ({ children, ...props }) => <span {...props}>{children}</span>,
                                        }}
                                        remarkPlugins={[]}
                                        rehypePlugins={[]}
                                      >
                                        {preprocessContent(activity)}
                                      </ReactMarkdown>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {dayPlan.objectives.length > 0 && (
                              <div>
                                <h4 className="text-sm font-medium text-gray-700 mb-1">
                                  Learning Objectives
                                </h4>
                                <div className="text-xs text-gray-600 space-y-1">
                                  {dayPlan.objectives.map((objective, index) => (
                                    <div key={index} className="prose prose-sm max-w-none">
                                      <ReactMarkdown
                                        components={{
                                          p: ({ children }) => <p className="mb-1">{children}</p>,
                                          ul: ({ children }) => <ul className="list-disc list-inside space-y-1">{children}</ul>,
                                          li: ({ children }) => <li className="text-xs">{children}</li>,
                                          strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                                          em: ({ children }) => <em className="italic">{children}</em>,
                                          br: () => <br />,
                                          // Handle HTML elements
                                          div: ({ children, ...props }) => <div {...props}>{children}</div>,
                                          span: ({ children, ...props }) => <span {...props}>{children}</span>,
                                        }}
                                        remarkPlugins={[]}
                                        rehypePlugins={[]}
                                      >
                                        {preprocessContent(objective)}
                                      </ReactMarkdown>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {dayPlan.materials.length > 0 && (
                              <div>
                                <h4 className="text-sm font-medium text-gray-700 mb-1">
                                  Instructional Methods
                                </h4>
                                <div className="text-xs text-gray-600 space-y-1">
                                  {dayPlan.materials.slice(0, 1).map((material, index) => (
                                    <div key={index} className="prose prose-sm max-w-none">
                                      <ReactMarkdown
                                        components={{
                                          p: ({ children }) => <p className="mb-1">{children}</p>,
                                          ul: ({ children }) => <ul className="list-disc list-inside space-y-1">{children}</ul>,
                                          li: ({ children }) => <li className="text-xs">{children}</li>,
                                          strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                                          em: ({ children }) => <em className="italic">{children}</em>,
                                          br: () => <br />,
                                          // Handle HTML elements
                                          div: ({ children, ...props }) => <div {...props}>{children}</div>,
                                          span: ({ children, ...props }) => <span {...props}>{children}</span>,
                                        }}
                                        remarkPlugins={[]}
                                        rehypePlugins={[]}
                                      >
                                        {preprocessContent(material)}
                                      </ReactMarkdown>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {dayPlan.materials.length > 1 && (
                              <div>
                                <h4 className="text-sm font-medium text-gray-700 mb-1">
                                  Assessment/Evaluation
                                </h4>
                                <div className="text-xs text-gray-600 space-y-1">
                                  {dayPlan.materials.slice(1).map((material, index) => (
                                    <div key={index} className="prose prose-sm max-w-none">
                                      <ReactMarkdown
                                        components={{
                                          p: ({ children }) => <p className="mb-1">{children}</p>,
                                          ul: ({ children }) => <ul className="list-disc list-inside space-y-1">{children}</ul>,
                                          li: ({ children }) => <li className="text-xs">{children}</li>,
                                          strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                                          em: ({ children }) => <em className="italic">{children}</em>,
                                          br: () => <br />,
                                          // Handle HTML elements
                                          div: ({ children, ...props }) => <div {...props}>{children}</div>,
                                          span: ({ children, ...props }) => <span {...props}>{children}</span>,
                                        }}
                                        remarkPlugins={[]}
                                        rehypePlugins={[]}
                                      >
                                        {preprocessContent(material)}
                                      </ReactMarkdown>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <p className="text-xs text-gray-500 text-center">
                            No plan available
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Loading indicator */}
          {(isLoading || isParsing) && (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center gap-3 bg-white/90 border border-gray-200 rounded-lg px-4 py-3 backdrop-blur-sm shadow-md">
                <Loader2 className="h-5 w-5 animate-spin text-green-500" />
                <span className="text-sm text-gray-600">
                  {isParsing ? "Parsing weekly plan..." : "Creating your lesson plan..."}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Fixed Input Area */}
      <div className="absolute bottom-0 left-0 right-0 z-50 border-t-2 border-gray-200 bg-white/95 backdrop-blur-md shadow-lg">
        <div className="w-full px-4 py-3 sm:px-6 sm:py-4">
          {isLoading && (
            <div className="flex justify-center">
              <Button
                variant="outline"
                onClick={onCancel}
                className="text-red-500 hover:text-red-600 border-red-300 hover:border-red-400 bg-red-50 hover:bg-red-100 text-sm"
              >
                Cancel
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 