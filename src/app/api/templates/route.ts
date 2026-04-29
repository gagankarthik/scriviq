import type { NextRequest } from "next/server";
import { getSession } from "@/lib/auth/session";
import { dbListTemplates, dbPutTemplate } from "@/lib/aws/contracts";
import type { SOWTemplate, SowType, TemplateSection } from "@/lib/mock-data";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const templates = await dbListTemplates(session.workspace);
    return Response.json({ templates });
  } catch (err) {
    console.error("GET /api/templates", err);
    return Response.json({ error: "Failed to fetch templates" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json() as {
      title: string;
      description: string;
      sowType: SowType;
      sections: TemplateSection[];
      variables: string[];
    };

    const now = new Date().toISOString();
    const template: SOWTemplate = {
      id:          `tmpl-${Date.now()}`,
      title:       body.title,
      description: body.description,
      sowType:     body.sowType,
      sections:    body.sections ?? [],
      variables:   body.variables ?? [],
      createdAt:   now,
      updatedAt:   now,
      usageCount:  0,
    };

    await dbPutTemplate(session.workspace, template);
    return Response.json({ template }, { status: 201 });
  } catch (err) {
    console.error("POST /api/templates", err);
    return Response.json({ error: "Failed to create template" }, { status: 500 });
  }
}
