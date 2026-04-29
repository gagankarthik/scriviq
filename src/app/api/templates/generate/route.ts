import type { NextRequest } from "next/server";
import OpenAI from "openai";
import { getSession } from "@/lib/auth/session";
import { dbGetTemplate, dbPutContract, dbUpdateTemplate, dbPutActivity } from "@/lib/aws/contracts";
import { extractAndSaveClauses } from "@/lib/extractClauses";
import type { Contract } from "@/lib/mock-data";

export const dynamic = "force-dynamic";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json() as {
      templateId: string;
      variables: Record<string, string>;
      contractTitle: string;
      clientName: string;
      contractValue?: number;
      expiryDate?: string;
    };

    const template = await dbGetTemplate(session.workspace, body.templateId);
    if (!template) return Response.json({ error: "Template not found" }, { status: 404 });

    // Fill template variables
    let templateText = template.sections
      .map((s) => `## ${s.title}\n${s.content}`)
      .join("\n\n");

    for (const [key, value] of Object.entries(body.variables)) {
      templateText = templateText.replaceAll(`{{${key}}}`, value);
    }

    // GPT fill-in for remaining unfilled variables
    const fillCompletion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a contract drafting AI. Fill in any remaining {{variable}} placeholders in the contract text with reasonable defaults based on context. Return only the filled contract text, no JSON wrapper.`,
        },
        {
          role: "user",
          content: `Client: ${body.clientName}\nContract Value: ${body.contractValue ? `$${body.contractValue}` : "TBD"}\nExpiry: ${body.expiryDate ?? "TBD"}\n\n${templateText}`,
        },
      ],
      temperature: 0.1,
      max_tokens: 3000,
    });

    const filledText = fillCompletion.choices[0].message.content ?? templateText;

    // Create contract record
    const contractId = `contract-${Date.now()}`;
    const now = new Date().toISOString();
    const contract: Contract = {
      id:            contractId,
      title:         body.contractTitle,
      clientName:    body.clientName,
      status:        "processing",
      riskScore:     null,
      clauseCount:   0,
      contractValue: body.contractValue ?? null,
      currency:      "USD",
      expiryDate:    body.expiryDate ?? null,
      uploadedAt:    now,
      uploadedBy:    session.userId,
      fileType:      "docx",
      pageCount:     0,
      aiSummary:     null,
      sowType:       template.sowType,
    };

    await dbPutContract(session.workspace, contract);

    await dbPutActivity(session.workspace, {
      id:          `activity-${Date.now()}`,
      type:        "contract_uploaded",
      description: `${body.contractTitle} created from template "${template.title}"`,
      contractId,
      timestamp:   now,
    }).catch(() => {});

    // Extract clauses from filled text
    const result = await extractAndSaveClauses(
      session.workspace,
      contractId,
      filledText,
      {
        title:         body.contractTitle,
        clientName:    body.clientName,
        contractValue: body.contractValue ?? null,
        expiryDate:    body.expiryDate ?? null,
      },
      template.sowType
    );

    // Increment template usage
    await dbUpdateTemplate(session.workspace, body.templateId, {
      usageCount: template.usageCount + 1,
      updatedAt:  new Date().toISOString(),
    }).catch(() => {});

    return Response.json({ contractId, ...result }, { status: 201 });
  } catch (err) {
    console.error("POST /api/templates/generate", err);
    return Response.json({ error: "Failed to generate contract" }, { status: 500 });
  }
}
