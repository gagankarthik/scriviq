// Type definitions — shared across server and client components
export type ContractStatus = "processing" | "ready" | "error";
export type RiskLevel = "low" | "medium" | "high";
export type ClauseType =
  | "payment_milestone"
  | "renewal_auto"
  | "ip_ownership"
  | "termination_notice"
  | "liability_cap"
  | "confidentiality"
  | "penalty_clause"
  | "acceptance_criteria"
  | "governing_law"
  | "dispute_resolution"
  | "force_majeure"
  | "scope_change"
  | "other";
export type ClauseStatus = "active" | "actioned" | "expired";
export type AlertType = "7_day" | "1_day" | "overdue" | "budget_80pct";
export type AlertStatus = "pending" | "sent" | "dismissed";
export type TeamRole = "owner" | "admin" | "member";
export type PlanType = "trial" | "pro" | "enterprise";
export type SowType = "fixed-price" | "performance-based" | "loe";
export type ApprovalStatus = "draft" | "pending_approval" | "approved" | "rejected";
export type ComplianceRuleCondition = "must_contain" | "must_not_contain" | "must_exist" | "must_not_exist";
export type ComplianceSeverity = "error" | "warning";

export const PROJECT_COLORS = [
  "#0072E5", "#8b5cf6", "#10b981", "#f59e0b",
  "#ef4444", "#ec4899", "#14b8a6", "#f97316",
] as const;
export type ProjectColor = typeof PROJECT_COLORS[number];

export interface Project {
  id: string;
  name: string;
  description: string;
  clientName: string;
  color: ProjectColor;
  createdAt: string;
  status: "active" | "archived";
}

export interface Contract {
  id: string;
  title: string;
  clientName: string;
  projectId?: string;
  status: ContractStatus;
  riskScore: RiskLevel | null;
  clauseCount: number;
  contractValue: number | null;
  currency: string;
  expiryDate: string | null;
  uploadedAt: string;
  uploadedBy: string;
  fileType: "pdf" | "docx";
  pageCount: number;
  aiSummary: string | null;
  sowType?: SowType;
  approvalStatus?: ApprovalStatus;
  approvers?: string[];
  approvalComments?: string;
  budgetHours?: number;
  budgetRate?: number;
}

export interface Clause {
  id: string;
  contractId: string;
  type: ClauseType;
  title: string;
  summary: string;
  rawText: string;
  dueDate: string | null;
  amount: number | null;
  noticeDays: number | null;
  riskLevel: RiskLevel;
  riskReason: string | null;
  status: ClauseStatus;
  tags: string[];
  complianceFlags?: string[];
}

export interface ComplianceRule {
  id: string;
  name: string;
  description: string;
  clauseType: ClauseType | "any";
  condition: ComplianceRuleCondition;
  value?: string;
  severity: ComplianceSeverity;
  createdAt: string;
}

export interface ApprovalStep {
  id: string;
  contractId: string;
  step: number;
  approverEmail: string;
  approverName: string;
  status: "pending" | "approved" | "rejected";
  comments?: string;
  timestamp?: string;
}

export interface TemplateSection {
  id: string;
  clauseType: ClauseType;
  title: string;
  content: string;
  required: boolean;
  riskLevel: RiskLevel;
}

export interface SOWTemplate {
  id: string;
  title: string;
  description: string;
  sowType: SowType;
  sections: TemplateSection[];
  variables: string[];
  createdAt: string;
  updatedAt: string;
  usageCount: number;
}

export interface TimesheetEntry {
  id: string;
  contractId: string;
  memberName: string;
  date: string;
  hours: number;
  rate?: number;
  description: string;
  createdAt: string;
}

export interface Alert {
  id: string;
  contractId: string;
  clauseId: string;
  contractTitle: string;
  clientName: string;
  clauseTitle: string;
  clauseType: ClauseType;
  type: AlertType;
  status: AlertStatus;
  dueDate: string;
  sentAt: string | null;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: TeamRole;
  initials: string;
  joinedAt: string;
  lastActiveAt: string;
}

export interface ActivityEvent {
  id: string;
  type: "contract_uploaded" | "extraction_complete" | "alert_sent" | "clause_actioned" | "member_added";
  description: string;
  contractId?: string;
  timestamp: string;
}

export type AmendmentStatus    = "pending_review" | "resolved";
export type ClauseChangeType   = "added" | "modified" | "removed";
export type ClauseChangeStatus = "pending" | "accepted" | "rejected";

export interface ClauseChange {
  id:           string;
  changeType:   ClauseChangeType;
  clauseId:     string | null;    // null for newly added clauses
  title:        string;
  originalText: string | null;    // null when changeType === "added"
  newText:      string | null;    // null when changeType === "removed"
  riskLevel:    RiskLevel;
  riskReason:   string | null;
  status:       ClauseChangeStatus;
}

export interface Amendment {
  id:          string;
  contractId:  string;
  title:       string;
  description: string;
  status:      AmendmentStatus;
  uploadedAt:  string;
  changes:     ClauseChange[];
}

// ── SOW Analysis ──────────────────────────────────────────────────────────────

export interface SowVaguePhrase {
  id: string;
  clauseContext: string;
  phrase: string;
  reason: string;
  suggestion: string;
  riskImpact: RiskLevel;
}

export interface RaciEntry {
  task: string;
  responsible: string;
  accountable: string;
  consulted: string;
  informed: string;
}

export interface MissingClause {
  name: string;
  importance: "critical" | "recommended" | "optional";
  description: string;
  example: string;
}

export interface SowQaFlag {
  type: "date_inconsistency" | "undefined_acronym" | "missing_reference" | "grammar" | "style";
  message: string;
  severity: "error" | "warning";
  context?: string;
}

export interface SowCoachingTip {
  clauseTitle: string;
  riskLevel: RiskLevel;
  why: string;
  fix: string;
}

export interface SowAnalysis {
  contractId: string;
  analysedAt: string;
  healthScore: number;
  tone: "professional" | "collaborative" | "aggressive" | "vague" | "balanced";
  toneNotes: string;
  vagueCount: number;
  criticalMissingCount: number;
  vaguePhrases: SowVaguePhrase[];
  missingClauses: MissingClause[];
  raciMatrix: RaciEntry[];
  qaFlags: SowQaFlag[];
  coachingTips: SowCoachingTip[];
}

// ── Multi-Document Version Intelligence ───────────────────────────────────────

export type DocType = "base_sow" | "amendment" | "change_order" | "informal" | "side_sow";

export interface DocTimelineEntry {
  contractId: string;
  title: string;
  uploadedAt: string;
  docType: DocType;
  isInformal: boolean;
  contractValue: number | null;
  expiryDate: string | null;
  clauseCount: number;
  keyChanges: string[];
}

export interface CrossDocConflict {
  id: string;
  severity: "critical" | "warning" | "info";
  type: "contradiction" | "scope_budget_mismatch" | "timeline_resource_mismatch" | "missing_approval" | "overlap" | "external_reference" | "informal_change";
  title: string;
  description: string;
  docAId: string;
  docATitle: string;
  docBId?: string;
  docBTitle?: string;
  recommendation: string;
}

export interface ConsolidatedClause {
  clauseType: string;
  clauseTitle: string;
  currentText: string;
  sourceDocId: string;
  sourceDocTitle: string;
  isOverridden: boolean;
  originalText?: string;
  originalDocTitle?: string;
}

export interface ProjectConsolidation {
  projectId: string;
  analysedAt: string;
  docCount: number;
  baseDocId: string | null;
  baseDocTitle: string | null;
  originalValue: number | null;
  currentValue: number | null;
  valueDelta: number | null;
  originalEndDate: string | null;
  currentEndDate: string | null;
  timelineDeltaDays: number | null;
  informalChangeCount: number;
  conflictCount: number;
  criticalConflictCount: number;
  timeline: DocTimelineEntry[];
  conflicts: CrossDocConflict[];
  consolidatedClauses: ConsolidatedClause[];
  executiveSummary: string;
  masterSowText: string;
}
