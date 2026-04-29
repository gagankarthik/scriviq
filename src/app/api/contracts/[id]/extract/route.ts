import type { NextRequest } from "next/server";
import OpenAI from "openai";
import { getSession } from "@/lib/auth/session";
import { dbGetContract, dbUpdateContract } from "@/lib/aws/contracts";
import { extractAndSaveClauses } from "@/lib/extractClauses";

export const dynamic    = "force-dynamic";
export const maxDuration = 120; // allow up to 2 min for large docs

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ── OCR fallback: extract text from a scanned image page via GPT-4o Vision ───

async function visionExtract(base64: string, mime: string): Promise<string> {
  const res = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "This is a scanned contract or SOW document. Extract ALL text verbatim — every clause, heading, date, amount, signature block. Preserve numbering and structure. Do not summarize or skip any section.",
          },
          {
            type: "image_url",
            image_url: { url: `data:${mime};base64,${base64}`, detail: "high" },
          },
        ],
      },
    ],
    max_tokens: 4096,
    temperature: 0,
  });
  return res.choices[0].message.content ?? "";
}

// ── Parse uploaded file into plain text ───────────────────────────────────────

async function parseFileToText(buffer: Buffer, filename: string): Promise<string> {
  const name = filename.toLowerCase();

  // ── PDF ───────────────────────────────────────────────────────────────────
  if (name.endsWith(".pdf")) {
    try {
      // Dynamic import avoids the pdf-parse test-file fs.readFileSync at module load
      const pdfParse = (await import("pdf-parse")).default;
      const data     = await pdfParse(buffer, { max: 0 }); // max:0 = all pages
      const text     = data.text?.trim() ?? "";

      if (text.length > 100) return text; // proper text PDF

      // Scanned PDF — fallback to GPT-4o Vision on first page
      console.log("[extract] PDF has no selectable text — using Vision OCR");
      return await visionExtract(buffer.toString("base64"), "application/pdf");
    } catch (err) {
      console.error("[extract] pdf-parse failed:", err);
      // Try vision as last resort
      return await visionExtract(buffer.toString("base64"), "application/pdf");
    }
  }

  // ── DOCX ──────────────────────────────────────────────────────────────────
  if (name.endsWith(".docx")) {
    try {
      const mammoth = await import("mammoth");
      const result  = await mammoth.extractRawText({ buffer });
      const text    = result.value?.trim() ?? "";
      if (result.messages.length) {
        console.log("[extract] mammoth warnings:", result.messages.map((m) => m.message).join("; "));
      }
      if (text.length > 50) return text;
      throw new Error("mammoth returned empty text");
    } catch (err) {
      console.error("[extract] mammoth failed:", err);
      return await visionExtract(buffer.toString("base64"), "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
    }
  }

  // ── Scanned images ────────────────────────────────────────────────────────
  if (name.endsWith(".jpg") || name.endsWith(".jpeg")) {
    return await visionExtract(buffer.toString("base64"), "image/jpeg");
  }
  if (name.endsWith(".png")) {
    return await visionExtract(buffer.toString("base64"), "image/png");
  }
  if (name.endsWith(".tiff") || name.endsWith(".tif")) {
    return await visionExtract(buffer.toString("base64"), "image/tiff");
  }

  // ── Plain text fallback ───────────────────────────────────────────────────
  return buffer.toString("utf-8");
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const contract = await dbGetContract(session.workspace, id);
    if (!contract) return Response.json({ error: "Contract not found" }, { status: 404 });

    let contractText = "";
    let fileName     = contract.title;

    const contentType = request.headers.get("content-type") ?? "";

    // ── Prefer FormData (actual file upload) ───────────────────────────────
    if (contentType.includes("multipart/form-data")) {
      const form = await request.formData();
      const file = form.get("file");

      if (file && typeof file !== "string") {
        // File is a Blob/File object
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        fileName     = (file as File).name ?? fileName;

        console.log(`[extract] parsing ${fileName} (${(buffer.length / 1024).toFixed(0)} KB)`);

        contractText = await parseFileToText(buffer, fileName);

        console.log(`[extract] extracted ${contractText.length} chars of text from ${fileName}`);
      }
    } else {
      // ── JSON fallback (manual text or re-analysis trigger) ─────────────
      const body = await request.json().catch(() => ({})) as {
        text?:   string;
        s3Key?:  string;
      };
      contractText = body.text?.trim() ?? "";
    }

    // If we still have no text, tell GPT what we know so it can generate
    // meaningful clauses from the contract metadata (better than blank)
    if (!contractText || contractText.length < 50) {
      console.warn("[extract] no document text available — generating from metadata only");
      contractText = [
        `CONTRACT METADATA (no document text available)`,
        `Title:          ${contract.title}`,
        `Client:         ${contract.clientName}`,
        `Contract Value: ${contract.contractValue ? `$${contract.contractValue.toLocaleString()}` : "Not specified"}`,
        `Expiry Date:    ${contract.expiryDate ?? "Not specified"}`,
        `SOW Type:       ${contract.sowType ?? "Not specified"}`,
        ``,
        `NOTE: Only metadata is available. Extract reasonable inferred clauses based on the contract type and title. Mark all as low risk unless the type implies otherwise.`,
      ].join("\n");
    }

    const result = await extractAndSaveClauses(
      session.workspace,
      id,
      contractText,
      {
        title:         contract.title,
        clientName:    contract.clientName,
        contractValue: contract.contractValue,
        expiryDate:    contract.expiryDate,
      },
      contract.sowType
    );

    return Response.json(result);
  } catch (err) {
    console.error("POST /api/contracts/[id]/extract", err);
    await dbUpdateContract(session.workspace, id, { status: "error" }).catch(() => {});
    return Response.json({ error: "Extraction failed" }, { status: 500 });
  }
}
