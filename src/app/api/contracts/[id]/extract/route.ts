import type { NextRequest } from "next/server";
import { getSession } from "@/lib/auth/session";
import { dbGetContract, dbUpdateContract } from "@/lib/aws/contracts";
import { getDownloadUrl } from "@/lib/aws/s3";
import { extractAndSaveClauses } from "@/lib/extractClauses";

export const dynamic = "force-dynamic";

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

    const body = await request.json().catch(() => ({})) as { text?: string; s3Key?: string };

    let contractText = body.text ?? "";

    if (!contractText && body.s3Key) {
      try {
        const downloadUrl = await getDownloadUrl(body.s3Key);
        const res = await fetch(downloadUrl);
        if (res.ok) contractText = await res.text();
      } catch { /* S3 not accessible */ }
    }

    if (!contractText) {
      contractText = `[Contract: ${contract.title} — Client: ${contract.clientName}]
This contract has been uploaded but text extraction from the binary file is not yet implemented.
Generating sample clauses based on contract metadata for demonstration purposes.`;
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
