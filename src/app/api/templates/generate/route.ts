import type { NextRequest } from "next/server";
import OpenAI from "openai";
import { getSession } from "@/lib/auth/session";
import { dbGetTemplate, dbPutContract, dbUpdateTemplate, dbPutActivity } from "@/lib/aws/contracts";
import { extractAndSaveClauses } from "@/lib/extractClauses";
import type { Contract, TemplateSection, SowType } from "@/lib/mock-data";

export const dynamic = "force-dynamic";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json() as {
      templateId:       string;
      templateTitle?:   string;
      templateSections?: TemplateSection[];
      templateVariables?: string[];
      sowType?:         SowType;
      variables:        Record<string, string>;
      contractTitle:    string;
      clientName:       string;
      contractValue?:   number;
      startDate?:       string;
      expiryDate?:      string;
      projectId?:       string;
      // enriched context
      scope?:           string;
      deliverables?:    string;
      teamComposition?: string;
      paymentSchedule?: string;
      noticePeriod?:    string;
      latePayment?:     string;
      extraNotes?:      string;
    };

    // Resolve template — seed templates come with their sections in the body
    let sections:  TemplateSection[];
    let variables: string[];
    let sowType:   SowType;
    let templateTitle: string;

    if (body.templateId.startsWith("seed-") && body.templateSections) {
      sections      = body.templateSections;
      variables     = body.templateVariables ?? [];
      sowType       = body.sowType ?? "fixed-price";
      templateTitle = body.templateTitle ?? body.templateId;
    } else {
      const template = await dbGetTemplate(session.workspace, body.templateId);
      if (!template) return Response.json({ error: "Template not found" }, { status: 404 });
      sections      = template.sections;
      variables     = template.variables;
      sowType       = template.sowType;
      templateTitle = template.title;
    }

    // Apply user-supplied variable replacements
    let templateText = sections
      .map((s) => `## ${s.title}\n${s.content}`)
      .join("\n\n");

    for (const [key, value] of Object.entries(body.variables)) {
      if (value) templateText = templateText.replaceAll(`{{${key}}}`, value);
    }

    // Build rich system prompt using all provided context
    const systemPrompt = `You are an expert contract lawyer specialising in digital agency agreements. Generate a complete, professional, legally-sound Statement of Work (SOW) that is ready to be signed.

CONTRACT DETAILS:
- Title: ${body.contractTitle}
- Client: ${body.clientName}
- Value: ${body.contractValue ? `$${body.contractValue.toLocaleString()}` : "To be agreed"}
- Start Date: ${body.startDate ?? "Upon signing"}
- End Date / Expiry: ${body.expiryDate ?? "As per project timeline"}
- Agreement Type: ${sowType.replace("-", " ").replace(/\b\w/g, (c) => c.toUpperCase())}

SCOPE OF WORK:
${body.scope ?? "Professional services as described in the template sections below."}

KEY DELIVERABLES:
${body.deliverables ?? "As outlined in the project scope above."}

TEAM & RESOURCES:
${body.teamComposition ?? "Agency team as appropriate to the engagement."}

PAYMENT TERMS PREFERENCE:
${body.paymentSchedule ?? "As per the payment schedule defined in this agreement."}

NOTICE PERIOD:
${body.noticePeriod ?? "30 days written notice."}

LATE PAYMENT CLAUSE:
${body.latePayment ?? "None specified."}

ADDITIONAL NOTES / SPECIAL REQUIREMENTS:
${body.extraNotes ?? "None."}

BASE TEMPLATE SECTIONS (expand and enrich these):
${templateText}

INSTRUCTIONS:
1. Write a complete, formal SOW with every section fully fleshed out using the context above.
2. Replace ALL remaining {{variable}} placeholders with appropriate values.
3. Make payment amounts, dates, and deliverables specific and consistent throughout.
4. Use numbered clauses and proper legal formatting.
5. Include standard agency-protective clauses (IP, liability, confidentiality) even if not in the template.
6. The tone must be professional, clear, and legally precise.
7. Return ONLY the full contract text — no preamble, no JSON wrapper.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Generate the complete SOW now. Client: ${body.clientName}. Project: ${body.contractTitle}.`,
        },
      ],
      temperature: 0.2,
      max_tokens:  4000,
    });

    const filledText = completion.choices[0].message.content ?? templateText;

    // Create contract record
    const contractId = `contract-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`;
    const now        = new Date().toISOString();

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
      sowType,
      ...(body.projectId && { projectId: body.projectId }),
    };

    await dbPutContract(session.workspace, contract);

    await dbPutActivity(session.workspace, {
      id:          `activity-${Date.now()}`,
      type:        "contract_uploaded",
      description: `${body.contractTitle} generated from template "${templateTitle}"`,
      contractId,
      timestamp:   now,
    }).catch(() => {});

    // Extract clauses
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
      sowType
    );

    // Increment usage for saved templates
    if (!body.templateId.startsWith("seed-")) {
      await dbUpdateTemplate(session.workspace, body.templateId, {
        usageCount: 0, // will be fetched and incremented
        updatedAt:  now,
      }).catch(() => {});
    }

    return Response.json({ contractId, projectId: body.projectId, ...result }, { status: 201 });
  } catch (err) {
    console.error("POST /api/templates/generate", err);
    return Response.json({ error: "Failed to generate contract" }, { status: 500 });
  }
}
