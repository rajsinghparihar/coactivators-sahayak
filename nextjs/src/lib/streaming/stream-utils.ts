/**
 * Stream Utilities
 *
 * Shared utility functions for streaming operations, including agent
 * identification, event title generation, and common streaming helpers.
 */

import { v4 as uuidv4 } from "uuid";

/**
 * Generates user-friendly event titles based on agent names
 *
 * This function maps technical agent names to user-friendly activity descriptions
 * for display in the activity timeline.
 *
 * @param agentName - The technical name of the agent
 * @returns User-friendly title for the activity
 */
export function getEventTitle(agentName: string): string {
  // Root agent
  if (agentName === "sahayak") {
    return "🤖 Sahayak Assistant";
  }

  // Main agents
  if (agentName === "differentiated_materials_agent") {
    return "📚 Creating Differentiated Materials";
  }
  if (agentName === "hyper_local_content_agent") {
    return "🌍 Generating Local Content";
  }
  if (agentName === "knowledge_base_agent") {
    return "📖 Knowledge Base Assistant";
  }
  if (agentName === "visual_aid_agent") {
    return "🎨 Creating Visual Aids";
  }
  if (agentName === "fun_activity_agent") {
    return "🎮 Generating Fun Activities";
  }
  if (agentName === "lesson_planning_agent") {
    return "📋 Planning Weekly Lessons";
  }

  // Differentiated Materials sub-agents
  if (agentName === "worksheet_generator_agent") {
    return "📝 Generating Worksheets";
  }
  if (agentName === "worksheet_creator_agent") {
    return "📄 Creating Worksheet";
  }
  if (agentName === "answerkey_creator_agent") {
    return "✅ Creating Answer Key";
  }
  if (agentName === "variation_generator_agent") {
    return "🔄 Generating Variations";
  }
  if (agentName === "grade_adapter_agent") {
    return "📊 Adapting for Grade Level";
  }

  // Visual Aid sub-agents
  if (agentName === "mindmap_generator_agent") {
    return "🧠 Creating Mind Maps";
  }
  if (agentName === "diagram_creator_agent") {
    return "📊 Creating Diagrams";
  }
  if (agentName === "visual_guide_generator_agent") {
    return "📖 Creating Visual Guides";
  }

  // Fun Activity sub-agents
  if (agentName === "quiz_generator_agent") {
    return "❓ Creating Quizzes";
  }
  if (agentName === "scenario_generator_agent") {
    return "🎭 Creating Scenarios";
  }
  if (agentName === "fitb_generator_agent") {
    return "🔤 Creating Fill-in-the-Blanks";
  }
  if (agentName === "word_game_generator_agent") {
    return "🎯 Creating Word Games";
  }

  // Lesson Planning sub-agents
  if (agentName === "subtopic_decomposer_agent") {
    return "📋 Breaking Down Topics";
  }
  if (agentName === "objective_mapper_agent") {
    return "🎯 Mapping Learning Objectives";
  }
  if (agentName === "content_planner_agent") {
    return "📚 Planning Content";
  }

  // Fallback patterns for any new agents
  if (agentName.includes("worksheet") || agentName.includes("worksheet")) {
    return "📝 Creating Worksheets";
  }
  if (agentName.includes("answer") || agentName.includes("key")) {
    return "✅ Creating Answer Keys";
  }
  if (agentName.includes("visual") || agentName.includes("diagram")) {
    return "🎨 Creating Visual Aids";
  }
  if (agentName.includes("activity") || agentName.includes("game")) {
    return "🎮 Creating Activities";
  }
  if (agentName.includes("plan") || agentName.includes("planning")) {
    return "📋 Planning Lessons";
  }
  if (agentName.includes("content") || agentName.includes("local")) {
    return "🌍 Creating Content";
  }
  if (agentName.includes("knowledge") || agentName.includes("explain")) {
    return "📖 Knowledge Assistant";
  }

  // Default fallback
  return `Processing (${agentName || "AI Agent"})`;
}

/**
 * Generates a unique message ID for streaming messages
 *
 * @returns Unique identifier string
 */
export function generateMessageId(): string {
  return `msg-${uuidv4()}`;
}

/**
 * Safely truncates data for logging purposes
 *
 * @param data - Data to truncate
 * @param maxLength - Maximum length before truncation (default: 200)
 * @returns Truncated data string
 */
export function truncateForLogging(
  data: string,
  maxLength: number = 200
): string {
  return data.length > maxLength ? data.substring(0, maxLength) + "..." : data;
}

/**
 * Checks if a string represents valid JSON
 *
 * @param str - String to validate
 * @returns True if the string is valid JSON
 */
export function isValidJSON(str: string): boolean {
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
}

/**
 * Formats function call information for display
 *
 * @param name - Function name
 * @param args - Function arguments
 * @returns Formatted display string
 */
export function formatFunctionCall(
  name: string,
  args: Record<string, unknown>
): string {
  const argCount = Object.keys(args).length;
  return `${name}(${argCount} argument${argCount !== 1 ? "s" : ""})`;
}

/**
 * Formats function response information for display
 *
 * @param name - Function name
 * @param response - Function response data
 * @returns Formatted display string
 */
export function formatFunctionResponse(
  name: string,
  response: Record<string, unknown>
): string {
  const hasResponse = Object.keys(response).length > 0;
  return `${name} → ${hasResponse ? "Response received" : "No response"}`;
}
