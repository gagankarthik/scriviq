import type { Buffer } from "buffer";

// Both packages are in serverExternalPackages so webpack won't bundle them.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require("pdf-parse");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const mammoth   = require("mammoth");

export async function extractTextFromBuffer(
  buf: Buffer,
  filename: string
): Promise<string> {
  const lower = filename.toLowerCase();

  if (lower.endsWith(".pdf")) {
    try {
      const data = await pdfParse(buf);
      return (data.text as string).trim();
    } catch {
      return "";
    }
  }

  if (lower.endsWith(".docx")) {
    try {
      const result = await mammoth.extractRawText({ buffer: buf });
      return (result.value as string).trim();
    } catch {
      return "";
    }
  }

  // Plain text fallback
  return buf.toString("utf-8").trim();
}
