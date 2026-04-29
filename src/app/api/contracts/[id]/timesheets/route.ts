import type { NextRequest } from "next/server";
import { getSession } from "@/lib/auth/session";
import { dbGetContract, dbListTimesheets, dbPutTimesheet } from "@/lib/aws/contracts";
import type { TimesheetEntry } from "@/lib/mock-data";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const entries = await dbListTimesheets(session.workspace, id);
    return Response.json({ entries });
  } catch (err) {
    console.error("GET /api/contracts/[id]/timesheets", err);
    return Response.json({ error: "Failed to fetch timesheets" }, { status: 500 });
  }
}

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

    const body = await request.json() as {
      memberName: string;
      date: string;
      hours: number;
      rate?: number;
      description: string;
    };

    const entry: TimesheetEntry = {
      id:          `time-${Date.now()}`,
      contractId:  id,
      memberName:  body.memberName,
      date:        body.date,
      hours:       body.hours,
      rate:        body.rate,
      description: body.description,
      createdAt:   new Date().toISOString(),
    };

    await dbPutTimesheet(session.workspace, entry);
    return Response.json({ entry }, { status: 201 });
  } catch (err) {
    console.error("POST /api/contracts/[id]/timesheets", err);
    return Response.json({ error: "Failed to log time" }, { status: 500 });
  }
}
