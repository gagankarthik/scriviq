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
export type AlertType = "7_day" | "1_day" | "overdue";
export type AlertStatus = "pending" | "sent" | "dismissed";
export type TeamRole = "owner" | "admin" | "member";
export type PlanType = "trial" | "pro" | "enterprise";

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
