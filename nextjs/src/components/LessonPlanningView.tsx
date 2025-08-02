"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Calendar, BookOpen, Send } from "lucide-react";
import { Message } from "@/types";

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

  // Debug: Log messages received
  useEffect(() => {
    console.log("LessonPlanningView received messages:", messages);
    console.log("LessonPlanningView isLoading:", isLoading);
  }, [messages, isLoading]);

  // Parse the last AI message for weekly plan table
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      console.log("Last message in lesson planning:", {
        type: lastMessage.type,
        contentLength: lastMessage.content?.length,
        content: lastMessage.content,
        isLoading
      });
      
      if (lastMessage.type === "ai" && lastMessage.content && !isLoading) {
        console.log("Parsing lesson plan content:", lastMessage.content);
        parseWeeklyPlan(lastMessage.content);
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
    setIsParsing(true);
    console.log("Starting to parse weekly plan from content:", content);
    
    try {
      // Look for table structure in the content
      const lines = content.split('\n').filter(line => line.trim());
      console.log("Filtered lines:", lines);
      const parsedPlan: WeeklyPlan[] = [];
      
      // Find the table rows (lines that start and end with |)
      const tableRows = lines.filter(line => 
        line.trim().startsWith('|') && line.trim().endsWith('|')
      );
      console.log("Table rows found:", tableRows);
      
      if (tableRows.length > 0) {
        // Skip header and separator rows
        const dataRows = tableRows.filter(row => {
          const cleanRow = row.trim();
          return !cleanRow.includes('---') && 
                 !cleanRow.toLowerCase().includes('day') &&
                 !cleanRow.toLowerCase().includes('activity') &&
                 !cleanRow.toLowerCase().includes('objective') &&
                 !cleanRow.toLowerCase().includes('materials');
        });
        console.log("Data rows after filtering:", dataRows);
        
        for (const row of dataRows) {
          // Split by | and filter out empty cells
          const cells = row.split('|').map(cell => cell.trim()).filter(cell => cell);
          console.log("Processing row cells:", cells);
          
          if (cells.length >= 4) {
            const day = cells[0];
            const activity = cells[1];
            const objective = cells[2];
            const material = cells[3];
            
            // Check if this is a valid day
            const dayMatch = day.match(/(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)/i);
            
            if (dayMatch && activity && objective && material) {
              const dayPlan: WeeklyPlan = {
                day: dayMatch[1],
                activities: [activity],
                objectives: [objective],
                materials: [material]
              };
              
              parsedPlan.push(dayPlan);
              console.log("Added day plan:", dayPlan);
            }
          }
        }
        
        if (parsedPlan.length > 0) {
          console.log("Final parsed plan:", parsedPlan);
          setWeeklyPlan(parsedPlan);
        } else {
          console.log("No valid plans found in parsed data");
          // Try alternative parsing method
          parseAlternativeFormat(content);
        }
      } else {
        console.log("No table rows found in content");
        // Try alternative parsing method
        parseAlternativeFormat(content);
      }
    } catch (error) {
      console.error('Error parsing weekly plan:', error);
    }
    
    setIsParsing(false);
  };

  const parseAlternativeFormat = (content: string) => {
    console.log("Trying alternative parsing method");
    
    // Look for day patterns in the content
    const dayPatterns = /(Monday|Tuesday|Wednesday|Thursday|Friday)/gi;
    const matches = content.match(dayPatterns);
    
    if (matches) {
      console.log("Found day matches:", matches);
      const parsedPlan: WeeklyPlan[] = [];
      
      // Split content by days and parse each section
      const sections = content.split(/(Monday|Tuesday|Wednesday|Thursday|Friday)/i);
      
      for (let i = 1; i < sections.length; i += 2) {
        const day = sections[i];
        const content = sections[i + 1] || '';
        
        // Extract activity, objective, and materials from the content
        const activityMatch = content.match(/Activity[:\s]*([^|]*)/i);
        const objectiveMatch = content.match(/Objective[:\s]*([^|]*)/i);
        const materialMatch = content.match(/Materials[:\s]*([^|]*)/i);
        
        if (activityMatch && objectiveMatch && materialMatch) {
          const dayPlan: WeeklyPlan = {
            day: day,
            activities: [activityMatch[1].trim()],
            objectives: [objectiveMatch[1].trim()],
            materials: [materialMatch[1].trim()]
          };
          
          parsedPlan.push(dayPlan);
          console.log("Added day plan (alternative):", dayPlan);
        }
      }
      
      if (parsedPlan.length > 0) {
        console.log("Final parsed plan (alternative):", parsedPlan);
        setWeeklyPlan(parsedPlan);
      } else {
        // Try simple format as last resort
        parseSimpleFormat(content);
      }
    } else {
      // Try simple format as last resort
      parseSimpleFormat(content);
    }
  };

  const parseSimpleFormat = (content: string) => {
    console.log("Trying simple format parsing");
    
    // Look for the table structure in a simpler way
    const tableMatch = content.match(/\|.*\|.*\|.*\|/g);
    if (tableMatch) {
      console.log("Found table structure:", tableMatch);
      
      const parsedPlan: WeeklyPlan[] = [];
      const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
      
      for (const day of daysOfWeek) {
        // Look for the day in the content
        const dayPattern = new RegExp(`\\|\\s*${day}\\s*\\|\\s*([^|]*)\\|\\s*([^|]*)\\|\\s*([^|]*)\\|`, 'i');
        const match = content.match(dayPattern);
        
        if (match) {
          const dayPlan: WeeklyPlan = {
            day: day,
            activities: [match[1].trim()],
            objectives: [match[2].trim()],
            materials: [match[3].trim()]
          };
          
          parsedPlan.push(dayPlan);
          console.log("Added day plan (simple):", dayPlan);
        }
      }
      
      if (parsedPlan.length > 0) {
        console.log("Final parsed plan (simple):", parsedPlan);
        setWeeklyPlan(parsedPlan);
      }
    }
  };

  const handleSubmit = () => {
    if (!grade.trim() || !topic.trim()) return;
    
    const prompt = `You are a lesson planning agent. Create a detailed weekly lesson plan for Grade ${grade} on the topic: "${topic}". 

IMPORTANT: You must respond with ONLY a markdown table in the following format:

| Day | Activity | Objective | Materials |
|-----|----------|-----------|-----------|
| Monday | [Activity description] | [Learning objective] | [Required materials] |
| Tuesday | [Activity description] | [Learning objective] | [Required materials] |
| Wednesday | [Activity description] | [Learning objective] | [Required materials] |
| Thursday | [Activity description] | [Learning objective] | [Required materials] |
| Friday | [Activity description] | [Learning objective] | [Required materials] |

Requirements for each day:
- Activities should be hands-on and engaging for Grade ${grade} students
- Objectives should be clear and measurable
- Materials should be low-cost and easily accessible
- Include differentiated instruction strategies
- Ensure progression of learning throughout the week
- Make activities culturally relevant and age-appropriate

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
                                  Activities
                                </h4>
                                <ul className="text-xs text-gray-600 space-y-1">
                                  {dayPlan.activities.map((activity, index) => (
                                    <li key={index} className="list-disc list-inside">
                                      {activity}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {dayPlan.objectives.length > 0 && (
                              <div>
                                <h4 className="text-sm font-medium text-gray-700 mb-1">
                                  Objectives
                                </h4>
                                <ul className="text-xs text-gray-600 space-y-1">
                                  {dayPlan.objectives.map((objective, index) => (
                                    <li key={index} className="list-disc list-inside">
                                      {objective}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {dayPlan.materials.length > 0 && (
                              <div>
                                <h4 className="text-sm font-medium text-gray-700 mb-1">
                                  Materials
                                </h4>
                                <ul className="text-xs text-gray-600 space-y-1">
                                  {dayPlan.materials.map((material, index) => (
                                    <li key={index} className="list-disc list-inside">
                                      {material}
                                    </li>
                                  ))}
                                </ul>
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
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t-2 border-gray-200 bg-white/95 backdrop-blur-md shadow-lg">
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