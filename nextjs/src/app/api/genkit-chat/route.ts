import { NextRequest, NextResponse } from "next/server";
import { genkit } from "genkit";
import { googleAI } from "@genkit-ai/googleai";
import { promises as fs } from "fs";
import path from "path";

export const runtime = "nodejs";

interface ChatRequest {
  message: string;
  userId: string;
  sessionId: string;
  fileUrl?: string;
  fileName?: string;
}

interface ChatResponse {
  response: string;
  error?: string;
}

// Configure Genkit
const ai = genkit({
  plugins: [googleAI()],
});

// Helper function to determine if a file is text-based
function isTextFile(fileName: string): boolean {
  const textExtensions = [
    '.txt', '.md', '.json', '.csv', '.xml', '.yaml', '.yml',
    '.js', '.ts', '.jsx', '.tsx', '.py', '.java', '.c', '.cpp',
    '.h', '.css', '.html', '.htm', '.sql', '.sh', '.bat',
    '.log', '.ini', '.conf', '.config', '.env', '.rtf'
  ];
  
  const ext = path.extname(fileName).toLowerCase();
  return textExtensions.includes(ext);
}

// Helper function to check if file is a PDF
function isPdfFile(fileName: string): boolean {
  return path.extname(fileName).toLowerCase() === '.pdf';
}

// Helper function to get MIME type from file extension
function getMimeType(fileName: string): string {
  const ext = path.extname(fileName).toLowerCase();
  const mimeTypes: { [key: string]: string } = {
    '.pdf': 'application/pdf',
    '.txt': 'text/plain',
    '.md': 'text/markdown',
    '.json': 'application/json',
    '.csv': 'text/csv',
    '.xml': 'application/xml',
    '.html': 'text/html',
    '.htm': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.ts': 'application/typescript',
    '.py': 'text/x-python',
    '.java': 'text/x-java-source',
    '.c': 'text/x-c',
    '.cpp': 'text/x-c++',
    '.h': 'text/x-c-header',
  };
  
  return mimeTypes[ext] || 'application/octet-stream';
}

// Helper function to read file content
async function readFileContent(fileUrl: string, fileName: string): Promise<{ content: string; isBase64: boolean; mimeType: string }> {
  try {
    // Remove leading slash from fileUrl if present
    const cleanFileUrl = fileUrl.startsWith('/') ? fileUrl.substring(1) : fileUrl;
    
    // Construct the full file path
    const filePath = path.join(process.cwd(), "public", cleanFileUrl);
    
    console.log(`Attempting to read file: ${filePath}`);
    console.log(`File exists: ${await fs.access(filePath).then(() => true).catch(() => false)}`);
    
    // Check if file exists
    await fs.access(filePath);
    
    // Get file stats
    const stats = await fs.stat(filePath);
    console.log(`File size: ${stats.size} bytes`);
    
    const mimeType = getMimeType(fileName);
    
    // Handle PDF files - read as binary and convert to base64
    if (isPdfFile(fileName)) {
      const buffer = await fs.readFile(filePath);
      const base64Content = buffer.toString('base64');
      console.log(`Successfully read PDF file, base64 length: ${base64Content.length} characters`);
      
      return {
        content: base64Content,
        isBase64: true,
        mimeType: 'application/pdf'
      };
    }
    
    // Handle text files
    if (isTextFile(fileName)) {
      const content = await fs.readFile(filePath, "utf-8");
      console.log(`Successfully read text file content, length: ${content.length} characters`);
      
      return {
        content,
        isBase64: false,
        mimeType
      };
    }
    
    // Handle other binary files - read as base64
    const buffer = await fs.readFile(filePath);
    const base64Content = buffer.toString('base64');
    console.log(`Successfully read binary file, base64 length: ${base64Content.length} characters`);
    
    return {
      content: base64Content,
      isBase64: true,
      mimeType
    };
    
  } catch (error) {
    console.error(`Error reading file ${fileName}:`, error);
    throw new Error(`Failed to read file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body: ChatRequest = await request.json();
    const { message, userId, sessionId, fileUrl, fileName } = body;

    console.log("Genkit API called with:", { 
      message: message?.substring(0, 100) + "...", 
      userId, 
      sessionId, 
      fileUrl, 
      fileName 
    });

    // Validate required fields
    if (!message?.trim() && !fileUrl) {
      return NextResponse.json(
        { error: "Message or file is required" },
        { status: 400 }
      );
    }
    
    if (!userId || !sessionId) {
      return NextResponse.json(
        { error: "UserId and sessionId are required" },
        { status: 400 }
      );
    }

    // Create the teaching assistant prompt
    const systemPrompt = `You are Sahayak, an intelligent teaching assistant designed to support teachers working in low-resource, multi-grade classrooms. Your primary function is to understand the teacher's queries and provide clear, actionable solutions or guidance.

Your Core Capabilities:
1. Query Understanding: Accurately interpret the teacher's request or problem, considering the unique challenges of multi-grade, low-resource environments.
2. Multi-Grade Support: Create differentiated materials and activities for mixed-age classrooms.
3. Resource Creation: Generate worksheets, visual aids, and low-cost activities.
4. Local Adaptation: Provide culturally relevant content and hyper-local examples.
5. Weekly Planning: Assist in organizing lessons, activities, and classroom routines efficiently.

When analyzing uploaded files (including PDFs, documents, and other materials), provide detailed insights and practical suggestions based on the file content. Always consider the constraints of low-resource, multi-grade classrooms and be practical, concise, and supportive in your guidance.

User ID: ${userId}
Session ID: ${sessionId}`;

    let prompt: any;
    
    // If there's a file, handle it appropriately based on type
    if (fileUrl && fileName) {
      try {
        console.log(`Processing file: ${fileName} at ${fileUrl}`);
        const { content, isBase64, mimeType } = await readFileContent(fileUrl, fileName);
        
        // Create multimodal prompt for files
        if (isBase64) {
          // For binary files (PDFs, images, etc.) - use multimodal format
          console.log(`Sending ${fileName} as base64 data with MIME type: ${mimeType}`);
          
          const userMessage = message?.trim() || `Please analyze this uploaded file (${fileName}) and provide insights and suggestions.`;
          
          prompt = [
            { text: userMessage },
            {
              media: {
                url: `data:${mimeType};base64,${content}`
              }
            }
          ];
        } else {
          // For text files - include content directly in text prompt
          const userMessage = message?.trim() || `Please analyze this uploaded file and provide insights and suggestions.`;
          
          prompt = `${userMessage}\n\n=== UPLOADED FILE CONTENT ===\nFile Name: ${fileName}\n\n${content}\n\n=== END OF FILE CONTENT ===\n\nPlease analyze the above file content and provide your insights.`;
        }
        
        console.log(`File processed successfully. Using ${isBase64 ? 'multimodal' : 'text'} format.`);
      } catch (fileError) {
        console.error("Error processing file:", fileError);
        return NextResponse.json(
          { 
            error: "Failed to read uploaded file", 
            details: fileError instanceof Error ? fileError.message : "Unknown file error"
          },
          { status: 500 }
        );
      }
    } else {
      // No file - just use the message as text prompt
      prompt = message;
    }

    console.log("Sending request to Gemini...");
    console.log(`Prompt type: ${Array.isArray(prompt) ? 'multimodal' : 'text'}`);

    // Generate response using Genkit
    const result = await ai.generate({
      model: googleAI.model("gemini-1.5-flash"),
      system: systemPrompt,
      prompt: prompt,
      config: {
        temperature: 0.7,
        maxOutputTokens: 2048,
      },
    });

    const response = result.text;
    console.log(`Received response from Gemini, length: ${response.length} characters`);

    return NextResponse.json<ChatResponse>({
      response,
    });

  } catch (error) {
    console.error("Genkit chat error:", error);
    return NextResponse.json(
      { 
        error: "Failed to process chat request",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
} 