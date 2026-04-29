import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { dbListContracts } from "@/lib/aws/contracts";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const q = req.nextUrl.searchParams.get("q")?.trim().toLowerCase() ?? "";
  if (!q) return NextResponse.json({ contracts: [] });

  try {
    const all = await dbListContracts(session.workspace);
    const contracts = all
      .filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.clientName.toLowerCase().includes(q)
      )
      .slice(0, 8);
    return NextResponse.json({ contracts });
  } catch {
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
