# Genkit Setup Guide

This project now uses Google AI Genkit directly in TypeScript to handle file requests instead of routing them to the run_sse endpoint.

## Setup Instructions

### 1. Install Dependencies

The required Genkit packages have already been installed:
- `genkit`
- `@genkit-ai/googleai`

### 2. Configure Google AI API Key

Create a `.env.local` file in the `nextjs` directory with the following content:

```bash
# Google AI API Key for Genkit
GOOGLE_API_KEY=your-actual-google-ai-api-key-here
```

### 3. Get Your Google AI API Key

1. Visit [Google AI Studio](https://ai.google.dev/gemini-api/docs/api-key)
2. Sign in with your Google account
3. Create a new API key
4. Copy the API key and replace `your-actual-google-ai-api-key-here` in your `.env.local` file

### 4. How It Works

The implementation now works as follows:

- **Text-only requests**: Continue to use the existing SSE streaming endpoint (`/api/run_sse`) for real-time streaming responses
- **File requests**: Use the new Genkit endpoint (`/api/genkit-chat`) which handles file processing directly in TypeScript

### 5. File Processing

When a user uploads a file and sends a message:

1. The file is uploaded to `/api/upload` (existing functionality)
2. The file is saved to `public/uploads/` with a timestamped filename
3. The chat interface detects the presence of a file
4. Instead of using SSE streaming, it routes the request to `/api/genkit-chat`
5. The Genkit endpoint reads the file and processes it based on type:
   - **Text files**: Content is read as UTF-8 and included in text prompt
   - **PDF files**: Content is read as binary, converted to base64, and sent as multimodal input
   - **Other binary files**: Content is read as binary, converted to base64, and sent as multimodal input
6. Google's Gemini model processes the file content along with the user's message
7. The response is returned as a standard JSON response (not streamed)

### 6. File Content Reading

The implementation now properly reads file content with comprehensive handling:

#### Text Files (Text Prompt Format):
- Content is read as UTF-8 text
- Included in prompt with `=== UPLOADED FILE CONTENT ===` markers
- Sent as regular text prompt to Gemini

#### PDF Files (Multimodal Format):
- Content is read as binary buffer
- Converted to base64 encoding
- Sent as multimodal prompt with proper MIME type (`application/pdf`)
- Gemini can natively process PDF content

#### Other Binary Files (Multimodal Format):
- Content is read as binary buffer
- Converted to base64 encoding
- Sent as multimodal prompt with appropriate MIME type
- Supports images, documents, etc.

#### Supported File Types:

**Text Files (UTF-8 Text Processing):**
- Documents: `.txt`, `.md`, `.rtf`
- Data: `.json`, `.csv`, `.xml`, `.yaml`, `.yml`
- Code files: `.js`, `.ts`, `.jsx`, `.tsx`, `.py`, `.java`, `.c`, `.cpp`, `.h`
- Web files: `.css`, `.html`, `.htm`, `.sql`
- Config files: `.sh`, `.bat`, `.log`, `.ini`, `.conf`, `.config`, `.env`

**Binary Files (Base64 Multimodal Processing):**
- PDFs: `.pdf` (full native support)
- Images: `.jpg`, `.jpeg`, `.png`, `.gif`, `.bmp`, `.webp`
- Documents: `.docx`, `.pptx`, `.xlsx` (limited support)
- Other binary formats

### 7. Benefits

- **Full PDF support**: Native PDF processing using Gemini's multimodal capabilities
- **Direct file processing**: No need to route file requests through the Python backend
- **TypeScript-native**: File processing happens directly in the Next.js application
- **Multimodal support**: Handles both text and binary files appropriately
- **Maintained streaming**: Text-only requests still benefit from real-time streaming
- **Proper content handling**: Uses the correct format for each file type

### 8. Technical Implementation

#### Text Files:
```typescript
// Text files are sent as regular prompts
prompt = `${userMessage}\n\n=== UPLOADED FILE CONTENT ===\nFile Name: ${fileName}\n\n${textContent}\n\n=== END OF FILE CONTENT ===`;
```

#### PDF and Binary Files:
```typescript
// PDFs and binary files are sent as multimodal prompts
prompt = [
  { text: userMessage },
  {
    media: {
      url: `data:${mimeType};base64,${base64Content}`
    }
  }
];
```

### 9. Debugging

The implementation includes extensive logging for debugging:

- File path construction and validation
- File existence checks
- File size information
- Content reading success/failure
- Base64 conversion for binary files
- Prompt format identification (text vs multimodal)
- Request/response logging

Check the browser's Network tab and server console for detailed debugging information.

#### Test File Reading

You can test file reading directly using the test endpoint:
```bash
# Test text file
curl "http://localhost:3000/api/test-file-read?file=test-curriculum.txt"

# Test PDF file (if you have one)
curl "http://localhost:3000/api/test-file-read?file=your-pdf-file.pdf"
```

This will show you:
- File type detection
- Processing method (text vs base64)
- MIME type identification
- Genkit format structure

### 10. Error Handling

The implementation includes comprehensive error handling for:
- Missing API keys
- File reading errors (file not found, permission issues, etc.)
- Network errors
- Genkit API errors
- Base64 conversion errors
- Multimodal prompt formatting errors

Errors are displayed to the user as AI messages, maintaining a consistent chat experience.

**Note**: Error handling has been optimized to prevent duplicate error messages. The system ensures that only one error message is displayed when something goes wrong, rather than showing the same error twice.

### 11. Testing File Upload

To test that file content is being properly processed:

#### For Text Files:
1. **Upload a text file** (e.g., `.txt`, `.md`, `.json`)
2. **Send a message** asking about the file content
3. **Expected**: Detailed analysis based on the actual text content

#### For PDF Files:
1. **Upload a PDF file**
2. **Send a message** like "What is this document about?" or "Summarize this PDF"
3. **Expected**: Gemini should read and analyze the PDF content directly
4. **Check logs**: Should show "Sending [filename] as base64 data with MIME type: application/pdf"

#### For Other Binary Files:
1. **Upload an image or other binary file**
2. **Send a message** asking about the file
3. **Expected**: Gemini should process the file according to its capabilities

### 12. Troubleshooting

If you encounter issues:

1. **Check the server logs** - Look for file reading errors or base64 conversion issues
2. **Verify the file type** - Ensure it's a supported format
3. **Test file reading** - Use the `/api/test-file-read` endpoint
4. **Check file permissions** - Ensure the uploaded file is readable
5. **Verify API key** - Make sure your Google AI API key is properly configured
6. **Monitor prompt format** - Check if files are being sent as text or multimodal

#### Common Issues:

**Duplicate Messages**: If you see responses appearing twice, this was a known issue that has been fixed. The system now properly handles errors without creating duplicate messages.

**"Cannot access files" Error**: If Gemini says it cannot access uploaded files, ensure your files are being processed correctly using the test endpoint and check the server logs for file reading errors.

The system now provides comprehensive file support with native PDF processing capabilities! 