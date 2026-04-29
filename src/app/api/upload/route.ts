import type { NextRequest } from "next/server";
import { getUploadUrl, contractKey } from "@/lib/aws/s3";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { contractId, filename, contentType } = await request.json();
    if (!contractId || !filename || !contentType) {
      return Response.json({ error: "contractId, filename, contentType required" }, { status: 400 });
    }

    const key = contractKey("default", contractId, filename);
    const uploadUrl = await getUploadUrl(key, contentType);

    return Response.json({ uploadUrl, key });
  } catch (err) {
    console.error("POST /api/upload", err);
    return Response.json({ error: "Failed to generate upload URL" }, { status: 500 });
  }
}
