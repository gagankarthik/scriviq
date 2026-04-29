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

export interface Contract {
  id: string;
  title: string;
  clientName: string;
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
