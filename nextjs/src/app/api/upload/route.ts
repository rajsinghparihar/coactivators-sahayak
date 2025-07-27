import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const uploadsDir = path.join(process.cwd(), "public/uploads");
  await fs.mkdir(uploadsDir, { recursive: true });
  const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_")}`;
  const filePath = path.join(uploadsDir, fileName);
  await fs.writeFile(filePath, buffer);
  const fileUrl = `/uploads/${fileName}`;
  const fileType = file.type || "application/octet-stream";
  // Return a document object for agent input
  const document = { fileUrl, fileName: file.name, fileType };
  return NextResponse.json({ fileUrl, fileName: file.name, document });
} 