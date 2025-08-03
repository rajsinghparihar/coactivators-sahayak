import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const filePath = searchParams.get('path');
  
  if (!filePath) {
    return NextResponse.json({ error: "No file path provided" }, { status: 400 });
  }

  try {
    // Ensure the file path is within the uploads directory for security
    const uploadsDir = path.join(process.cwd(), "public/uploads");
    const fullPath = path.join(uploadsDir, filePath);
    
    // Check if the path is within the uploads directory
    if (!fullPath.startsWith(uploadsDir)) {
      return NextResponse.json({ error: "Invalid file path" }, { status: 403 });
    }

    // Check if file exists
    await fs.access(fullPath);
    
    // Read the file
    const fileBuffer = await fs.readFile(fullPath);
    const fileName = path.basename(fullPath);
    const fileExtension = path.extname(fileName).toLowerCase();
    
    // Determine content type based on file extension
    let contentType = 'application/octet-stream';
    switch (fileExtension) {
      case '.pdf':
        contentType = 'application/pdf';
        break;
      case '.txt':
        contentType = 'text/plain';
        break;
      case '.doc':
        contentType = 'application/msword';
        break;
      case '.docx':
        contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        break;
      case '.rtf':
        contentType = 'application/rtf';
        break;
      case '.odt':
        contentType = 'application/vnd.oasis.opendocument.text';
        break;
      case '.jpg':
      case '.jpeg':
        contentType = 'image/jpeg';
        break;
      case '.png':
        contentType = 'image/png';
        break;
      case '.gif':
        contentType = 'image/gif';
        break;
      case '.webp':
        contentType = 'image/webp';
        break;
      case '.svg':
        contentType = 'image/svg+xml';
        break;
    }

    // Return the file with appropriate headers
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `inline; filename="${fileName}"`,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Error serving file:', error);
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }
} 