scriviq — Enterprise SOW & Contract Intelligence Platform
Product Requirements Document · v1.0 · Claude Code Build Spec
Brand Identity
Name & Concept
scriviq — Intelligence embedded in every clause. The name fuses legal precision ("clause") with cognitive sharpness ("IQ"), signaling an AI-powered platform that makes agencies smarter about their contracts.
Tagline: Know every clause. Miss nothing.
Brand voice: Confident, precise, minimal. Enterprise-grade without being cold. Think: Notion meets Ironclad.
Color System
Design philosophy: Deep navy authority + Electric indigo action + Warm amber urgencyThis trio is rare in legal-tech SaaS (most use flat blue/white), making scriviq immediately distinct.
Primary Palette
───────────────────────────────────────────────────
Abyss Navy      #0A0F1E   Backgrounds, sidebars
Deep Navy       #111827   Card surfaces (dark mode)
Slate Navy      #1E2A45   Elevated surfaces
────────────────────────────────────────────────────
Electric Indigo #4F46E5   Primary CTA, links, highlights
Indigo Hover    #4338CA   CTA hover state
Indigo Muted    #EEF2FF   Indigo tint backgrounds (light mode)
────────────────────────────────────────────────────
Amber Alert     #F59E0B   Deadlines < 7 days, warnings
Amber Soft      #FEF3C7   Amber tint backgrounds
────────────────────────────────────────────────────
Crimson Risk    #EF4444   Overdue, critical clauses
Green Safe      #10B981   Healthy, no action needed
────────────────────────────────────────────────────
Ghost White     #F8FAFC   Light mode page background
Surface White   #FFFFFF   Light mode cards
Border Light    #E2E8F0   Light mode borders
Border Dark     #1E2A45   Dark mode borders
Text Primary    #0F172A   Light mode primary text
Text Secondary  #64748B   Subtext, metadata
Text Inverted   #F1F5F9   Dark mode primary text
Typography
Font Stack
──────────────────────────────────────────────────
Display / Headings:   "Inter", system-ui, sans-serif   (weights: 500, 600, 700)
Body / UI:            "Inter", system-ui, sans-serif   (weights: 400, 500)
Monospace / Clauses:  "JetBrains Mono", monospace      (clause extraction, code)
Scale (rem, base 16px)
──────────────────────────────────────────────────
xs:   0.75rem  (12px)  Badges, timestamps
sm:   0.875rem (14px)  Secondary labels, table cells
base: 1rem     (16px)  Body text
lg:   1.125rem (18px)  Section intros
xl:   1.25rem  (20px)  Card titles
2xl:  1.5rem   (24px)  Page headings
3xl:  1.875rem (30px)  Dashboard hero numbers
4xl:  2.25rem  (36px)  Landing headings
Logo Concept
  ╔═╗  IQ
  ╚═╝ ───
   scriviq
Monogram: A bold "C" with an embedded circuit-node dot at the apex,
suggesting both a clause bracket and intelligent processing.
Color: Electric Indigo on Abyss Navy.
Tech Stack
Layer               Service                     Purpose
──────────────────────────────────────────────────────────────────
Auth                AWS Cognito                 Multi-tenant user pools, JWT tokens
File Storage        AWS S3                      PDF/DOCX contract uploads
AI Extraction       OpenAI GPT-4o-mini          Clause parsing, risk scoring
Database            AWS DynamoDB                Contracts, clauses, teams, alerts
Email               AWS SES                     Deadline reminder emails
Hosting             AWS Lambda + API Gateway    Serverless backend
Frontend            Next.js 14 (App Router)     React UI, SSR
Styling             Tailwind CSS v3             Utility-first design system
Payments            Stripe                      $49/mo per team billing
Infra-as-Code       AWS CDK (TypeScript)        All infra declarative
Project Structure
scriviq/
├── apps/
│   └── web/                          # Next.js 14 App Router
│       ├── app/
│       │   ├── auth/
│       │   │   ├── login/page.tsx
│       │   │   ├── signup/page.tsx
│       │   │   └── layout.tsx
│       │   ├── dashboard/
│       │   │   ├── layout.tsx        # Sidebar + top nav shell
│       │   │   ├── page.tsx          # Dashboard home
│       │   │   ├── contracts/
│       │   │   │   ├── page.tsx      # Contract list
│       │   │   │   ├── upload/page.tsx
│       │   │   │   └── [id]/
│       │   │   │       ├── page.tsx  # Contract detail
│       │   │   │       └── clauses/page.tsx
│       │   │   ├── alerts/page.tsx   # Upcoming deadlines
│       │   │   ├── team/page.tsx     # Team management
│       │   │   └── settings/page.tsx
│       │   └── api/
│       │       ├── auth/[...nextauth]/route.ts
│       │       ├── contracts/route.ts
│       │       ├── contracts/[id]/route.ts
│       │       ├── contracts/[id]/extract/route.ts
│       │       ├── alerts/route.ts
│       │       └── webhooks/stripe/route.ts
│       ├── components/
│       │   ├── ui/                   # Design system primitives
│       │   │   ├── Button.tsx
│       │   │   ├── Badge.tsx
│       │   │   ├── Card.tsx
│       │   │   ├── Input.tsx
│       │   │   ├── Modal.tsx
│       │   │   ├── Table.tsx
│       │   │   ├── Tooltip.tsx
│       │   │   └── Toast.tsx
│       │   ├── contracts/
│       │   │   ├── ContractCard.tsx
│       │   │   ├── ContractUploader.tsx
│       │   │   ├── ClauseList.tsx
│       │   │   ├── ClauseRow.tsx
│       │   │   ├── ExtractionProgress.tsx
│       │   │   └── RiskBadge.tsx
│       │   ├── dashboard/
│       │   │   ├── StatsBar.tsx
│       │   │   ├── AlertsWidget.tsx
│       │   │   └── ActivityFeed.tsx
│       │   ├── layout/
│       │   │   ├── Sidebar.tsx
│       │   │   ├── TopNav.tsx
│       │   │   └── MobileSidebar.tsx
│       │   └── alerts/
│       │       ├── AlertRow.tsx
│       │       └── AlertFilters.tsx
│       ├── lib/
│       │   ├── aws/
│       │   │   ├── cognito.ts
│       │   │   ├── s3.ts
│       │   │   └── dynamodb.ts
│       │   ├── openai/
│       │   │   ├── extract.ts        # Main extraction function
│       │   │   └── prompts.ts        # All GPT prompts
│       │   ├── stripe/
│       │   │   └── client.ts
│       │   ├── email/
│       │   │   └── ses.ts
│       │   └── utils/
│       │       ├── dates.ts
│       │       └── risk.ts
│       ├── hooks/
│       │   ├── useContracts.ts
│       │   ├── useClauses.ts
│       │   └── useAlerts.ts
│       ├── types/
│       │   └── index.ts
│       ├── tailwind.config.ts
│       └── next.config.ts
├── infra/                            # AWS CDK
│   ├── lib/
│   │   ├── scriviq-stack.ts
│   │   ├── cognito-construct.ts
│   │   ├── dynamodb-construct.ts
│   │   └── s3-construct.ts
│   └── bin/
│       └── app.ts
├── scripts/
│   └── seed-dev.ts
└── package.json                      # Turborepo monorepo root
Data Models
DynamoDB Table Design
Single-table design. All entities in one table: scriviq-main
// Partition Key: PK, Sort Key: SK
// GSI1: GSI1PK + GSI1SK (for queries across entities)
// ── TEAM ──────────────────────────────────────────────────
PK: "TEAM#<teamId>"        SK: "METADATA"
{
  teamId:        string,     // uuid
  name:          string,
  plan:          "trial" | "pro" | "enterprise",
  stripeCustomerId: string,
  trialEndsAt:   string,     // ISO 8601
  createdAt:     string,
  ownerUserId:   string
}
// ── USER ──────────────────────────────────────────────────
PK: "USER#<cognitoSub>"    SK: "PROFILE"
{
  userId:        string,     // Cognito sub
  teamId:        string,
  email:         string,
  name:          string,
  role:          "owner" | "admin" | "member",
  createdAt:     string
}
GSI1PK: "TEAM#<teamId>"   GSI1SK: "USER#<cognitoSub>"
// ── CONTRACT ──────────────────────────────────────────────
PK: "TEAM#<teamId>"        SK: "CONTRACT#<contractId>"
{
  contractId:    string,     // uuid
  teamId:        string,
  title:         string,     // e.g. "Acme Corp — Web Redesign SOW"
  clientName:    string,
  s3Key:         string,     // path in S3 bucket
  fileType:      "pdf" | "docx",
  status:        "processing" | "ready" | "error",
  uploadedBy:    string,     // userId
  uploadedAt:    string,
  contractValue: number | null,
  currency:      string,     // "USD"
  expiryDate:    string | null,
  riskScore:     "low" | "medium" | "high" | null,
  pageCount:     number
}
GSI1PK: "CONTRACT#<contractId>"  GSI1SK: "METADATA"
// ── CLAUSE ────────────────────────────────────────────────
PK: "CONTRACT#<contractId>"  SK: "CLAUSE#<clauseId>"
{
  clauseId:      string,     // uuid
  contractId:    string,
  teamId:        string,
  type:          ClauseType, // see enum below
  title:         string,     // e.g. "Payment Milestone 1"
  rawText:       string,     // original text from doc
  summary:       string,     // AI-generated 1-sentence summary
  dueDate:       string | null,
  amount:        number | null,
  noticeDays:    number | null,  // e.g. 30 for termination notice
  riskLevel:     "low" | "medium" | "high",
  riskReason:    string | null,
  status:        "active" | "actioned" | "expired",
  tags:          string[],
  extractedAt:   string
}
GSI1PK: "TEAM#<teamId>"    GSI1SK: "DUEDATE#<dueDate>#<clauseId>"
// ── ALERT ─────────────────────────────────────────────────
PK: "TEAM#<teamId>"        SK: "ALERT#<alertId>"
{
  alertId:       string,
  clauseId:      string,
  contractId:    string,
  teamId:        string,
  type:          "7_day" | "1_day" | "overdue",
  sentAt:        string | null,
  status:        "pending" | "sent" | "dismissed",
  dueDate:       string
}
Clause Types Enum
type ClauseType =
  | "payment_milestone"
  | "termination_notice"
  | "scope_change"
  | "renewal_auto"
  | "liability_cap"
  | "ip_ownership"
  | "confidentiality"
  | "penalty_clause"
  | "acceptance_criteria"
  | "governing_law"
  | "dispute_resolution"
  | "force_majeure"
  | "other"
AWS Infrastructure
Cognito Setup
// infra/lib/cognito-construct.ts
export class CognitoConstruct extends Construct {
  public readonly userPool: UserPool;
  public readonly userPoolClient: UserPoolClient;
  constructor(scope: Construct, id: string) {
    super(scope, id);
    this.userPool = new UserPool(this, "scriviqUserPool", {
      userPoolName: "scriviq-users",
      selfSignUpEnabled: true,
      signInAliases: { email: true },
      autoVerify: { email: true },
      standardAttributes: {
        email: { required: true, mutable: true },
        fullname: { required: true, mutable: true },
      },
      customAttributes: {
        teamId: new StringAttribute({ mutable: true }),
        role: new StringAttribute({ mutable: true }),
      },
      passwordPolicy: {
        minLength: 8,
        requireLowercase: true,
        requireUppercase: true,
        requireDigits: true,
      },
      accountRecovery: AccountRecovery.EMAIL_ONLY,
      removalPolicy: RemovalPolicy.RETAIN,
    });
    this.userPoolClient = this.userPool.addClient("WebClient", {
      userPoolClientName: "scriviq-web",
      authFlows: {
        userPassword: true,
        userSrp: true,
      },
      oAuth: {
        flows: { authorizationCodeGrant: true },
        scopes: [OAuthScope.EMAIL, OAuthScope.OPENID, OAuthScope.PROFILE],
      },
    });
  }
}
S3 Setup
// infra/lib/s3-construct.ts
export class S3Construct extends Construct {
  public readonly contractsBucket: Bucket;
  constructor(scope: Construct, id: string) {
    super(scope, id);
    this.contractsBucket = new Bucket(this, "ContractsBucket", {
      bucketName: `scriviq-contracts-${Stack.of(this).account}`,
      encryption: BucketEncryption.S3_MANAGED,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      versioned: true,
      lifecycleRules: [
        {
          id: "expire-tmp",
          prefix: "tmp/",
          expiration: Duration.days(1),
        },
      ],
      cors: [
        {
          allowedMethods: [HttpMethods.PUT, HttpMethods.GET],
          allowedOrigins: ["https://scriviq.com", "http://localhost:3000"],
          allowedHeaders: ["*"],
          maxAge: 3000,
        },
      ],
    });
  }
}
S3 Key Structure
contracts/
  <teamId>/
    <contractId>/
      original.<pdf|docx>          # Raw upload
      extracted-text.txt           # Plain text for GPT
AI Extraction Engine
Main Extraction Function
// lib/openai/extract.ts
import OpenAI from "openai";
import { ClauseType } from "@/types";
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
export interface ExtractedClause {
  type: ClauseType;
  title: string;
  rawText: string;
  summary: string;
  dueDate: string | null;        // ISO 8601 or null
  amount: number | null;
  noticeDays: number | null;
  riskLevel: "low" | "medium" | "high";
  riskReason: string | null;
  tags: string[];
}
export interface ExtractionResult {
  clauses: ExtractedClause[];
  contractValue: number | null;
  currency: string;
  expiryDate: string | null;
  overallRisk: "low" | "medium" | "high";
  summary: string;
}
export async function extractClauses(
  documentText: string,
  currentDate: string
): Promise<ExtractionResult> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: `Today's date: ${currentDate}\n\nContract text:\n${documentText}`,
      },
    ],
    max_tokens: 4000,
  });
  const raw = response.choices[0].message.content;
  if (!raw) throw new Error("Empty response from OpenAI");
  return JSON.parse(raw) as ExtractionResult;
}
System Prompt
// lib/openai/prompts.ts
export const SYSTEM_PROMPT = `
You are scriviq, an expert contract analyst for digital agencies and IT consultancies.
Your job is to extract ALL legally and commercially significant clauses from Statements of Work (SOWs),
service agreements, and consulting contracts.
Return ONLY valid JSON matching this exact schema. No markdown, no explanation.
{
  "clauses": [
    {
      "type": "<ClauseType>",
      "title": "<short human-readable title, max 60 chars>",
      "rawText": "<verbatim text from document, max 500 chars>",
      "summary": "<one sentence plain-English summary>",
      "dueDate": "<ISO 8601 date string or null>",
      "amount": <number in base currency units or null>,
      "noticeDays": <integer days notice required or null>,
      "riskLevel": "<low|medium|high>",
      "riskReason": "<one sentence explaining risk or null if low>",
      "tags": ["<tag1>", "<tag2>"]
    }
  ],
  "contractValue": <total contract value as number or null>,
  "currency": "<ISO 4217 currency code>",
  "expiryDate": "<ISO 8601 date string or null>",
  "overallRisk": "<low|medium|high>",
  "summary": "<2-3 sentence executive summary of this contract>"
}
ClauseType options:
  payment_milestone, termination_notice, scope_change, renewal_auto,
  liability_cap, ip_ownership, confidentiality, penalty_clause,
  acceptance_criteria, governing_law, dispute_resolution, force_majeure, other
Risk scoring guidelines:
  HIGH:   auto-renewal within 30 days, liability > contract value, IP transfer to client,
          termination notice < 14 days, penalty > 10% of contract value
  MEDIUM: payment terms > 45 days, termination notice 14–30 days, uncapped liability,
          narrow acceptance criteria that could delay payment
  LOW:    standard clauses, payment < 30 days, normal NDA terms
Extract ALL dates, dollar amounts, and notice periods. If a value is ambiguous, err on HIGH risk.
Today's date is provided; use it to calculate whether deadlines are urgent.
`;
API Routes
Upload Contract
// app/api/contracts/route.ts
// POST /api/contracts — create contract record + get S3 presigned URL
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { putItem } from "@/lib/aws/dynamodb";
import { getPresignedUploadUrl } from "@/lib/aws/s3";
import { v4 as uuidv4 } from "uuid";
export async function POST(req: NextRequest) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { title, clientName, fileName, fileType, fileSize } = await req.json();
  // Validate
  if (!title || !clientName || !fileName || !fileType)
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  if (!["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]
    .includes(fileType))
    return NextResponse.json({ error: "Only PDF and DOCX supported" }, { status: 400 });
  if (fileSize > 25 * 1024 * 1024)
    return NextResponse.json({ error: "Max file size 25MB" }, { status: 400 });
  const contractId = uuidv4();
  const ext = fileType.includes("pdf") ? "pdf" : "docx";
  const s3Key = `contracts/${session.user.teamId}/${contractId}/original.${ext}`;
  // Create DynamoDB record
  await putItem({
    PK: `TEAM#${session.user.teamId}`,
    SK: `CONTRACT#${contractId}`,
    contractId,
    teamId: session.user.teamId,
    title,
    clientName,
    s3Key,
    fileType: ext,
    status: "processing",
    uploadedBy: session.user.id,
    uploadedAt: new Date().toISOString(),
    contractValue: null,
    expiryDate: null,
    riskScore: null,
    pageCount: 0,
  });
  // Get presigned PUT URL (5-min expiry)
  const uploadUrl = await getPresignedUploadUrl(s3Key, fileType, 300);
  return NextResponse.json({ contractId, uploadUrl, s3Key });
}
Trigger Extraction
// app/api/contracts/[id]/extract/route.ts
// POST /api/contracts/:id/extract — pull from S3, run GPT, store clauses
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { getItem, putItem, updateItem, batchWriteItems } from "@/lib/aws/dynamodb";
import { getTextFromS3 } from "@/lib/aws/s3";
import { extractClauses } from "@/lib/openai/extract";
import { v4 as uuidv4 } from "uuid";
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const contract = await getItem({
    PK: `TEAM#${session.user.teamId}`,
    SK: `CONTRACT#${params.id}`,
  });
  if (!contract) return NextResponse.json({ error: "Not found" }, { status: 404 });
  try {
    // 1. Fetch text from S3
    const documentText = await getTextFromS3(contract.s3Key);
    // 2. Run GPT extraction
    const result = await extractClauses(documentText, new Date().toISOString().split("T")[0]);
    // 3. Store clauses in DynamoDB (batch write)
    const clauseItems = result.clauses.map((clause) => ({
      PutRequest: {
        Item: {
          PK: `CONTRACT#${params.id}`,
          SK: `CLAUSE#${uuidv4()}`,
          clauseId: uuidv4(),
          contractId: params.id,
          teamId: session.user.teamId,
          GSI1PK: `TEAM#${session.user.teamId}`,
          GSI1SK: clause.dueDate
            ? `DUEDATE#${clause.dueDate}#${uuidv4()}`
            : `DUEDATE#9999-12-31#${uuidv4()}`,
          ...clause,
          status: "active",
          extractedAt: new Date().toISOString(),
        },
      },
    }));
    await batchWriteItems("scriviq-main", clauseItems);
    // 4. Update contract record
    await updateItem({
      PK: `TEAM#${session.user.teamId}`,
      SK: `CONTRACT#${params.id}`,
      updates: {
        status: "ready",
        contractValue: result.contractValue,
        expiryDate: result.expiryDate,
        riskScore: result.overallRisk,
        aiSummary: result.summary,
        extractedAt: new Date().toISOString(),
      },
    });
    return NextResponse.json({ success: true, clauseCount: result.clauses.length });
  } catch (err) {
    await updateItem({
      PK: `TEAM#${session.user.teamId}`,
      SK: `CONTRACT#${params.id}`,
      updates: { status: "error" },
    });
    return NextResponse.json({ error: "Extraction failed" }, { status: 500 });
  }
}
Frontend Components
Design Tokens (Tailwind Config)
// tailwind.config.ts
import type { Config } from "tailwindcss";
export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // scriviq brand palette
        abyss:   { DEFAULT: "#0A0F1E", 800: "#111827", 700: "#1E2A45" },
        indigo:  { DEFAULT: "#4F46E5", hover: "#4338CA", muted: "#EEF2FF", faint: "#F5F3FF" },
        amber:   { DEFAULT: "#F59E0B", soft: "#FEF3C7" },
        crimson: { DEFAULT: "#EF4444", soft: "#FEF2F2" },
        emerald: { DEFAULT: "#10B981", soft: "#ECFDF5" },
        slate:   {
          50: "#F8FAFC", 100: "#F1F5F9", 200: "#E2E8F0",
          300: "#CBD5E1", 400: "#94A3B8", 500: "#64748B",
          600: "#475569", 700: "#334155", 800: "#1E293B", 900: "#0F172A",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      boxShadow: {
        card:   "0 1px 3px 0 rgb(0 0 0 / 0.08), 0 1px 2px -1px rgb(0 0 0 / 0.06)",
        "card-hover": "0 4px 12px 0 rgb(0 0 0 / 0.1), 0 2px 4px -1px rgb(0 0 0 / 0.06)",
        glow:   "0 0 20px rgb(79 70 229 / 0.3)",
      },
      borderRadius: {
        sm: "6px", md: "8px", lg: "12px", xl: "16px",
      },
    },
  },
  plugins: [],
} satisfies Config;
RiskBadge Component
// components/contracts/RiskBadge.tsx
type Risk = "low" | "medium" | "high";
const config: Record<Risk, { label: string; className: string }> = {
  low: {
    label: "Low Risk",
    className: "bg-emerald-soft text-emerald-700 border border-emerald-200",
  },
  medium: {
    label: "Medium Risk",
    className: "bg-amber-soft text-amber-700 border border-amber-200",
  },
  high: {
    label: "High Risk",
    className: "bg-crimson-soft text-crimson-700 border border-crimson-200",
  },
};
export function RiskBadge({ level }: { level: Risk }) {
  const { label, className } = config[level];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      {label}
    </span>
  );
}
ContractCard Component
// components/contracts/ContractCard.tsx
import { RiskBadge } from "./RiskBadge";
import { formatDistanceToNow } from "date-fns";
interface ContractCardProps {
  contractId: string;
  title: string;
  clientName: string;
  riskScore: "low" | "medium" | "high" | null;
  status: "processing" | "ready" | "error";
  clauseCount: number;
  expiryDate: string | null;
  contractValue: number | null;
  uploadedAt: string;
}
export function ContractCard({ title, clientName, riskScore, status, clauseCount,
  expiryDate, contractValue, uploadedAt, contractId }: ContractCardProps) {
  const daysUntilExpiry = expiryDate
    ? Math.ceil((new Date(expiryDate).getTime() - Date.now()) / 86400000)
    : null;
  return (
    <a
      href={`/contracts/${contractId}`}
      className="group block bg-white border border-slate-200 rounded-xl p-5
                 shadow-card hover:shadow-card-hover hover:border-indigo/30
                 transition-all duration-200"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <p className="text-sm text-slate-500 truncate">{clientName}</p>
          <h3 className="font-semibold text-slate-900 truncate mt-0.5">{title}</h3>
        </div>
        {riskScore && <RiskBadge level={riskScore} />}
        {status === "processing" && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs
                           font-medium bg-indigo-muted text-indigo border border-indigo/20">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo animate-pulse" />
            Processing
          </span>
        )}
      </div>
      {/* Meta row */}
      <div className="flex items-center gap-4 text-xs text-slate-500 mt-4 pt-3
                      border-t border-slate-100">
        <span>{clauseCount} clauses</span>
        {contractValue && (
          <span className="font-medium text-slate-700">
            ${contractValue.toLocaleString()}
          </span>
        )}
        {daysUntilExpiry !== null && (
          <span className={daysUntilExpiry <= 7 ? "text-amber-600 font-medium" : ""}>
            {daysUntilExpiry <= 0
              ? "Expired"
              : `Expires in ${daysUntilExpiry}d`}
          </span>
        )}
        <span className="ml-auto">
          {formatDistanceToNow(new Date(uploadedAt), { addSuffix: true })}
        </span>
      </div>
    </a>
  );
}
ClauseRow Component
// components/contracts/ClauseRow.tsx
import { RiskBadge } from "./RiskBadge";
import { format, parseISO, differenceInDays } from "date-fns";
interface ClauseRowProps {
  title: string;
  type: string;
  summary: string;
  dueDate: string | null;
  amount: number | null;
  noticeDays: number | null;
  riskLevel: "low" | "medium" | "high";
  riskReason: string | null;
  status: "active" | "actioned" | "expired";
  rawText: string;
}
export function ClauseRow({ title, type, summary, dueDate, amount,
  noticeDays, riskLevel, riskReason, rawText }: ClauseRowProps) {
  const daysLeft = dueDate ? differenceInDays(parseISO(dueDate), new Date()) : null;
  return (
    <div className="group border border-slate-200 rounded-lg p-4 hover:border-indigo/30
                    hover:bg-slate-50/50 transition-all duration-150">
      <div className="flex items-start gap-3">
        {/* Type pill */}
        <span className="shrink-0 mt-0.5 px-2 py-0.5 rounded text-[11px] font-mono
                         font-medium bg-slate-100 text-slate-600 uppercase tracking-wide">
          {type.replace(/_/g, " ")}
        </span>
        <div className="flex-1 min-w-0">
          {/* Title + risk */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-slate-900 text-sm">{title}</span>
            <RiskBadge level={riskLevel} />
          </div>
          {/* Summary */}
          <p className="text-sm text-slate-600 mt-1 leading-relaxed">{summary}</p>
          {/* Risk reason */}
          {riskReason && riskLevel !== "low" && (
            <p className="text-xs text-amber-700 bg-amber-soft border border-amber-200
                          rounded px-2 py-1 mt-2">
              ⚠ {riskReason}
            </p>
          )}
          {/* Raw text (collapsed) */}
          <details className="mt-2">
            <summary className="text-xs text-indigo cursor-pointer hover:underline">
              View original text
            </summary>
            <p className="font-mono text-xs text-slate-500 bg-slate-50 rounded p-2 mt-1
                          border border-slate-100 whitespace-pre-wrap">
              {rawText}
            </p>
          </details>
        </div>
        {/* Right meta column */}
        <div className="shrink-0 text-right space-y-1">
          {dueDate && (
            <div>
              <p className="text-xs text-slate-500">Due date</p>
              <p className={`text-sm font-medium ${
                daysLeft !== null && daysLeft <= 7 ? "text-amber-600" : "text-slate-800"
              }`}>
                {format(parseISO(dueDate), "MMM d, yyyy")}
              </p>
              {daysLeft !== null && (
                <p className="text-xs text-slate-400">
                  {daysLeft <= 0 ? "Overdue" : `${daysLeft}d left`}
                </p>
              )}
            </div>
          )}
          {amount && (
            <div>
              <p className="text-xs text-slate-500">Amount</p>
              <p className="text-sm font-semibold text-slate-800">
                ${amount.toLocaleString()}
              </p>
            </div>
          )}
          {noticeDays && (
            <div>
              <p className="text-xs text-slate-500">Notice</p>
              <p className="text-sm font-medium text-slate-800">{noticeDays} days</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
Dashboard StatsBar
// components/dashboard/StatsBar.tsx
interface Stat {
  label: string;
  value: string | number;
  sub?: string;
  urgent?: boolean;
}
export function StatsBar({ stats }: { stats: Stat[] }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className={`rounded-xl p-5 border ${
            stat.urgent
              ? "bg-amber-soft border-amber-200"
              : "bg-white border-slate-200"
          }`}
        >
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
            {stat.label}
          </p>
          <p className={`text-3xl font-bold mt-1 ${
            stat.urgent ? "text-amber-700" : "text-slate-900"
          }`}>
            {stat.value}
          </p>
          {stat.sub && (
            <p className="text-xs text-slate-400 mt-1">{stat.sub}</p>
          )}
        </div>
      ))}
    </div>
  );
}
// Usage in dashboard/page.tsx:
// <StatsBar stats={[
//   { label: "Active Contracts", value: 24, sub: "+3 this month" },
//   { label: "Open Clauses", value: 87, sub: "across 24 contracts" },
//   { label: "Due This Week", value: 5, sub: "action required", urgent: true },
//   { label: "Total Value Tracked", value: "$1.2M" },
// ]} />
Sidebar Layout
// components/layout/Sidebar.tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
const nav = [
  { href: "/",            label: "Dashboard",  icon: "▦" },
  { href: "/contracts",   label: "Contracts",  icon: "⊡" },
  { href: "/alerts",      label: "Alerts",     icon: "◎" },
  { href: "/team",        label: "Team",       icon: "⊕" },
  { href: "/settings",    label: "Settings",   icon: "⊙" },
];
export function Sidebar() {
  const path = usePathname();
  return (
    <aside className="w-60 shrink-0 h-screen sticky top-0 flex flex-col
                       bg-abyss border-r border-abyss-700">
      {/* Logo */}
      <div className="px-5 pt-6 pb-5 border-b border-abyss-700">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo flex items-center justify-center
                           text-white text-sm font-bold shadow-glow">
            C
          </div>
          <span className="text-white font-semibold tracking-tight">scriviq</span>
        </div>
      </div>
      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {nav.map(({ href, label, icon }) => {
          const active = path === href || (href !== "/" && path.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm
                          transition-all duration-150 ${
                active
                  ? "bg-indigo text-white font-medium shadow-glow"
                  : "text-slate-400 hover:text-white hover:bg-abyss-700"
              }`}
            >
              <span className="text-base">{icon}</span>
              {label}
            </Link>
          );
        })}
      </nav>
      {/* Plan badge at bottom */}
      <div className="px-5 py-4 border-t border-abyss-700">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald animate-pulse" />
          <span className="text-xs text-slate-400">Pro Plan · 14d trial</span>
        </div>
      </div>
    </aside>
  );
}
Email Alerts (AWS SES)
// lib/email/ses.ts
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
const ses = new SESClient({ region: process.env.AWS_REGION });
interface AlertEmailParams {
  toEmail: string;
  teamName: string;
  contractTitle: string;
  clientName: string;
  clauses: Array<{
    title: string;
    type: string;
    dueDate: string;
    daysLeft: number;
    amount?: number;
  }>;
}
export async function sendDeadlineAlert({
  toEmail, teamName, contractTitle, clientName, clauses,
}: AlertEmailParams) {
  const clauseRows = clauses
    .map(
      (c) => `
      <tr style="border-bottom: 1px solid #E2E8F0;">
        <td style="padding: 12px 16px; font-size: 14px; color: #0F172A;">${c.title}</td>
        <td style="padding: 12px 16px; font-size: 13px; color: #64748B; font-family: monospace;">
          ${c.type.replace(/_/g, " ").toUpperCase()}
        </td>
        <td style="padding: 12px 16px; font-size: 14px; color: #F59E0B; font-weight: 600;">
          ${new Date(c.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </td>
        <td style="padding: 12px 16px; font-size: 14px; font-weight: 600;
                   color: ${c.daysLeft <= 1 ? "#EF4444" : "#F59E0B"};">
          ${c.daysLeft <= 0 ? "OVERDUE" : c.daysLeft === 1 ? "1 day left" : `${c.daysLeft} days`}
        </td>
      </tr>`
    )
    .join("");
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body style="margin: 0; padding: 0; background: #F8FAFC; font-family: Inter, system-ui, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding: 40px 20px;">
      <table width="600" cellpadding="0" cellspacing="0"
             style="background: #FFFFFF; border-radius: 12px; border: 1px solid #E2E8F0; overflow: hidden;">
        <!-- Header -->
        <tr>
          <td style="background: #0A0F1E; padding: 24px 32px;">
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="width: 32px; height: 32px; background: #4F46E5; border-radius: 8px;
                           text-align: center; line-height: 32px; font-size: 14px; font-weight: 700;
                           color: white;">C</td>
                <td style="padding-left: 10px; font-size: 18px; font-weight: 600; color: #F1F5F9;">
                  scriviq
                </td>
              </tr>
            </table>
            <p style="margin: 16px 0 0; color: #94A3B8; font-size: 14px;">
              Deadline Alert · ${teamName}
            </p>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding: 32px;">
            <h2 style="margin: 0 0 8px; font-size: 20px; font-weight: 600; color: #0F172A;">
              Action required on ${contractTitle}
            </h2>
            <p style="margin: 0 0 24px; font-size: 15px; color: #64748B;">
              ${clauses.length} clause${clauses.length !== 1 ? "s" : ""} need your attention
              in your contract with <strong>${clientName}</strong>.
            </p>
            <!-- Clauses table -->
            <table width="100%" cellpadding="0" cellspacing="0"
                   style="border: 1px solid #E2E8F0; border-radius: 8px; overflow: hidden;">
              <thead>
                <tr style="background: #F8FAFC;">
                  <th style="padding: 10px 16px; text-align: left; font-size: 12px;
                             font-weight: 600; color: #64748B; text-transform: uppercase;
                             letter-spacing: 0.05em;">Clause</th>
                  <th style="padding: 10px 16px; text-align: left; font-size: 12px;
                             font-weight: 600; color: #64748B; text-transform: uppercase;
                             letter-spacing: 0.05em;">Type</th>
                  <th style="padding: 10px 16px; text-align: left; font-size: 12px;
                             font-weight: 600; color: #64748B; text-transform: uppercase;
                             letter-spacing: 0.05em;">Due Date</th>
                  <th style="padding: 10px 16px; text-align: left; font-size: 12px;
                             font-weight: 600; color: #64748B; text-transform: uppercase;
                             letter-spacing: 0.05em;">Status</th>
                </tr>
              </thead>
              <tbody>${clauseRows}</tbody>
            </table>
            <!-- CTA -->
            <div style="margin-top: 28px; text-align: center;">
              <a href="https://scriviq.com/contracts"
                 style="display: inline-block; background: #4F46E5; color: white;
                        padding: 13px 28px; border-radius: 8px; font-size: 14px;
                        font-weight: 600; text-decoration: none;">
                Review in scriviq →
              </a>
            </div>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="padding: 20px 32px; border-top: 1px solid #E2E8F0; background: #F8FAFC;">
            <p style="margin: 0; font-size: 12px; color: #94A3B8; text-align: center;">
              You're receiving this because you enabled deadline alerts in scriviq.
              <a href="https://scriviq.com/settings/alerts" style="color: #4F46E5;">
                Manage alerts
              </a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
  await ses.send(
    new SendEmailCommand({
      Source: "alerts@scriviq.com",
      Destination: { ToAddresses: [toEmail] },
      Message: {
        Subject: {
          Data: `⏰ ${clauses.length} clause deadline${clauses.length !== 1 ? "s" : ""} — ${contractTitle}`,
        },
        Body: { Html: { Data: html } },
      },
    })
  );
}
Environment Variables
# .env.local
# AWS
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_COGNITO_USER_POOL_ID=
AWS_COGNITO_CLIENT_ID=
AWS_S3_BUCKET=scriviq-contracts-<account-id>
DYNAMODB_TABLE=scriviq-main
# OpenAI
OPENAI_API_KEY=
# NextAuth
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000
# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_ID=price_xxxxx    # $49/mo
# Email
SES_FROM_ADDRESS=alerts@scriviq.com
# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
Package Dependencies
{
  "dependencies": {
    "next": "14.2.x",
    "react": "18.x",
    "react-dom": "18.x",
    "typescript": "5.x",
    "tailwindcss": "3.x",
    "@aws-sdk/client-cognito-identity-provider": "^3",
    "@aws-sdk/client-dynamodb": "^3",
    "@aws-sdk/lib-dynamodb": "^3",
    "@aws-sdk/client-s3": "^3",
    "@aws-sdk/s3-request-presigner": "^3",
    "@aws-sdk/client-ses": "^3",
    "openai": "^4",
    "next-auth": "^4",
    "stripe": "^14",
    "date-fns": "^3",
    "uuid": "^9",
    "pdf-parse": "^1",
    "mammoth": "^1"       // DOCX → plain text
  },
  "devDependencies": {
    "@types/react": "18.x",
    "@types/node": "20.x",
    "aws-cdk": "^2",
    "aws-cdk-lib": "^2"
  }
}
Feature Roadmap
v1 — MVP (Weeks 1–3)
[x] AWS Cognito auth with team-scoped sign-up
[x] S3 presigned upload for PDF and DOCX
[x] GPT-4o-mini clause extraction with structured JSON
[x] DynamoDB single-table contract + clause storage
[x] Dashboard with contracts list and risk overview
[x] Contract detail view with all extracted clauses
[x] Deadline alerts via AWS SES (7-day, 1-day, overdue)
[x] Stripe billing at $49/mo per team
v2 — Growth (Month 2)
[ ] Slack notifications for deadline alerts
[ ] Clause status workflow (active → actioned)
[ ] Team member comments on individual clauses
[ ] CSV export of all clauses for a contract
[ ] Contract search and filter by client/risk/date
[ ] Onboarding checklist for new teams
v3 — Enterprise (Month 3+)
[ ] SSO via Cognito identity federation (Google Workspace, Okta)
[ ] Audit log of all clause status changes
[ ] Custom clause types per team
[ ] Webhook delivery for integrations
[ ] API access (read-only) for power users
[ ] White-label option for agency resellers
Build Instructions for Claude Code
1. Scaffold:  npx create-next-app@latest scriviq-web --typescript --tailwind --app
2. Install deps from package.json above
3. Set up tailwind.config.ts with scriviq design tokens
4. Create /types/index.ts with all TypeScript interfaces
5. Implement AWS lib wrappers (cognito.ts, s3.ts, dynamodb.ts)
6. Implement OpenAI extraction (lib/openai/extract.ts + prompts.ts)
7. Build API routes in order: POST /contracts → POST /contracts/[id]/extract → GET routes
8. Build layout shell: Sidebar + TopNav
9. Build pages in order: /login → / (dashboard) → /contracts → /contracts/[id] → /alerts
10. Build components bottom-up: primitives (Button, Badge) → domain (ClauseRow, ContractCard)
11. Wire Stripe: /api/webhooks/stripe for subscription lifecycle
12. Wire SES alerts: cron job via Vercel Cron or EventBridge
13. Deploy infra: cdk deploy
14. Set all env vars in Vercel dashboard