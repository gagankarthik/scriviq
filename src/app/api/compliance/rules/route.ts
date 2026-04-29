import type { NextRequest } from "next/server";
import { getSession } from "@/lib/auth/session";
import { dbListComplianceRules, dbPutComplianceRule } from "@/lib/aws/contracts";
import type { ComplianceRule, ClauseType, ComplianceRuleCondition, ComplianceSeverity } from "@/lib/mock-data";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const rules = await dbListComplianceRules(session.workspace);
    return Response.json({ rules });
  } catch (err) {
    console.error("GET /api/compliance/rules", err);
    return Response.json({ error: "Failed to fetch rules" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json() as {
      name: string;
      description: string;
      clauseType: ClauseType | "any";
      condition: ComplianceRuleCondition;
      value?: string;
      severity: ComplianceSeverity;
    };

    const rule: ComplianceRule = {
      id:          `rule-${Date.now()}`,
      name:        body.name,
      description: body.description,
      clauseType:  body.clauseType,
      condition:   body.condition,
      value:       body.value,
      severity:    body.severity,
      createdAt:   new Date().toISOString(),
    };

    await dbPutComplianceRule(session.workspace, rule);
    return Response.json({ rule }, { status: 201 });
  } catch (err) {
    console.error("POST /api/compliance/rules", err);
    return Response.json({ error: "Failed to create rule" }, { status: 500 });
  }
}
