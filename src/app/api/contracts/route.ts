import type { NextRequest } from "next/server";
import { getSession } from "@/lib/auth/session";
import { dbListContracts, dbPutContract, dbPutActivity } from "@/lib/aws/contracts";
import { getUploadUrl, contractKey } from "@/lib/aws/s3";
import type { Contract, ActivityEvent } from "@/lib/mock-data";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const sp     = request.nextUrl.searchParams;
  const status = sp.get("status") ?? undefined;
  const risk   = sp.get("risk")   ?? undefined;
  const q      = sp.get("q")      ?? undefined;

  try {
    const contracts = await dbListContracts(session.workspace, { status, risk, q });
    return Response.json({ contracts });
  } catch (err) {
    console.error("GET /api/contracts", err);
    return Response.json({ error: "Failed to fetch contracts" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json() as {
      id: string;
      title: string;
      clientName: string;
      fileType: "pdf" | "docx";
      pageCount?: number;
      contractValue?: number;
      expiryDate?: string;
    };

    const now: string = new Date().toISOString();
    const contract: Contract = {
      id:            body.id,
      title:         body.title,
      clientName:    body.clientName,
      status:        "processing",
      riskScore:     null,
      clauseCount:   0,
      contractValue: body.contractValue ?? null,
      currency:      "USD",
      expiryDate:    body.expiryDate ?? null,
      uploadedAt:    now,
      uploadedBy:    session.userId,
      fileType:      body.fileType,
      pageCount:     body.pageCount ?? 0,
      aiSummary:     null,
    };

    await dbPutContract(session.workspace, contract);

    const key = contractKey(session.userId, body.id, `contract.${body.fileType}`);
    let uploadUrl: string | null = null;
    try {
      uploadUrl = await getUploadUrl(
        key,
        body.fileType === "pdf"
          ? "application/pdf"
          : "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      );
    } catch { /* S3 might not be configured */ }

    const activity: ActivityEvent = {
      id:          `activity-${Date.now()}`,
      type:        "contract_uploaded",
      description: `${body.title} uploaded and processing`,
      contractId:  body.id,
      timestamp:   now,
    };
    await dbPutActivity(session.workspace, activity).catch(() => {});

    return Response.json({ contract, uploadUrl, s3Key: key }, { status: 201 });
  } catch (err) {
    console.error("POST /api/contracts", err);
    return Response.json({ error: "Failed to create contract" }, { status: 500 });
  }
}
