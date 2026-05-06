import type { NextRequest } from "next/server";
import { getSession } from "@/lib/auth/session";
import { dbListProjects, dbPutProject, dbListContracts } from "@/lib/aws/contracts";
import type { Project, ProjectColor } from "@/lib/mock-data";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const [projects, contracts] = await Promise.all([
      dbListProjects(session.workspace),
      dbListContracts(session.workspace),
    ]);

    const projectsWithStats = projects.map((p) => {
      const projectContracts = contracts.filter((c) => c.projectId === p.id);
      const totalValue = projectContracts.reduce((s, c) => s + (c.contractValue ?? 0), 0);
      const risks = projectContracts.map((c) => c.riskScore).filter(Boolean);
      const riskScore = risks.includes("high")
        ? "high"
        : risks.includes("medium")
        ? "medium"
        : risks.includes("low")
        ? "low"
        : null;
      return { ...p, contractCount: projectContracts.length, totalValue, riskScore };
    });

    return Response.json({ projects: projectsWithStats });
  } catch (err) {
    console.error("GET /api/projects", err);
    return Response.json({ error: "Failed to fetch projects" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json() as {
      name: string;
      clientName: string;
      description?: string;
      color: ProjectColor;
    };

    if (!body.name?.trim() || !body.clientName?.trim()) {
      return Response.json({ error: "Name and client name are required" }, { status: 400 });
    }

    const project: Project = {
      id:          `proj-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name:        body.name.trim(),
      clientName:  body.clientName.trim(),
      description: body.description?.trim() ?? "",
      color:       body.color,
      createdAt:   new Date().toISOString(),
      status:      "active",
    };

    await dbPutProject(session.workspace, project);
    return Response.json({ project }, { status: 201 });
  } catch (err) {
    console.error("POST /api/projects", err);
    return Response.json({ error: "Failed to create project" }, { status: 500 });
  }
}
