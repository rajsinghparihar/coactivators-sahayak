import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export const runtime = "nodejs";

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

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const testFile = searchParams.get('file') || 'test-curriculum.txt';
    
    // Test file reading with the same logic as the genkit-chat endpoint
    const fileUrl = `/uploads/${testFile}`;
    const cleanFileUrl = fileUrl.startsWith('/') ? fileUrl.substring(1) : fileUrl;
    const filePath = path.join(process.cwd(), "public", cleanFileUrl);
    
    console.log(`Test file read - Attempting to read: ${filePath}`);
    
    // Check if file exists
    const fileExists = await fs.access(filePath).then(() => true).catch(() => false);
    console.log(`File exists: ${fileExists}`);
    
    if (!fileExists) {
      return NextResponse.json({
        success: false,
        error: "File not found",
        filePath,
        fileUrl,
        cleanFileUrl
      });
    }
    
    // Get file stats
    const stats = await fs.stat(filePath);
    console.log(`File size: ${stats.size} bytes`);
    
    const mimeType = getMimeType(testFile);
    const isText = isTextFile(testFile);
    const isPdf = isPdfFile(testFile);
    
    let content: string;
    let isBase64 = false;
    let contentPreview: string;
    
    // Handle different file types like the main endpoint
    if (isPdf) {
      // Read PDF as binary and convert to base64
      const buffer = await fs.readFile(filePath);
      content = buffer.toString('base64');
      isBase64 = true;
      contentPreview = `[PDF Base64 data, length: ${content.length} characters]`;
      console.log(`Successfully read PDF file, base64 length: ${content.length} characters`);
    } else if (isText) {
      // Read text files as UTF-8
      content = await fs.readFile(filePath, "utf-8");
      contentPreview = content.substring(0, 200) + "...";
      console.log(`Successfully read text file content, length: ${content.length} characters`);
    } else {
      // Read other files as binary and convert to base64
      const buffer = await fs.readFile(filePath);
      content = buffer.toString('base64');
      isBase64 = true;
      contentPreview = `[Binary Base64 data, length: ${content.length} characters]`;
      console.log(`Successfully read binary file, base64 length: ${content.length} characters`);
    }
    
    // Show how this would be formatted for Genkit
    let genkitFormat: any;
    if (isBase64) {
      genkitFormat = {
        type: 'multimodal',
        prompt: [
          { text: "Analyze this file" },
          {
            media: {
              url: `data:${mimeType};base64,${content.substring(0, 50)}...` // Truncated for display
            }
          }
        ]
      };
    } else {
      genkitFormat = {
        type: 'text',
        prompt: `Analyze this file:\n\n=== FILE CONTENT ===\n${content.substring(0, 200)}...\n=== END ===`
      };
    }
    
    return NextResponse.json({
      success: true,
      filePath,
      fileUrl,
      cleanFileUrl,
      fileName: testFile,
      fileSize: stats.size,
      mimeType,
      isTextFile: isText,
      isPdfFile: isPdf,
      isBase64,
      contentLength: content.length,
      contentPreview,
      genkitFormat,
      // Only include full content for small text files
      ...(isText && content.length < 1000 ? { fullContent: content } : {})
    });
    
  } catch (error) {
    console.error("Test file read error:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
} 