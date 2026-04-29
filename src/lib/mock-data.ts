// Mock data — all dates relative to 2026-04-28
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

// ─── Contracts ────────────────────────────────────────────────────────────────

export const CONTRACTS: Contract[] = [
  {
    id: "contract-001",
    title: "Acme Corp — Brand & Web Redesign",
    clientName: "Acme Corporation",
    status: "ready",
    riskScore: "high",
    clauseCount: 7,
    contractValue: 48000,
    currency: "USD",
    expiryDate: "2026-05-28",
    uploadedAt: "2026-04-10T09:14:00Z",
    uploadedBy: "user-001",
    fileType: "pdf",
    pageCount: 24,
    aiSummary:
      "High-value web redesign engagement. Contains an IP transfer clause vesting all deliverables in the client, an auto-renewal within 30 days of expiry, and a Phase 1 payment due in 8 days. Overall risk is HIGH — immediate review recommended.",
  },
  {
    id: "contract-002",
    title: "TechFlow Solutions — Cloud Migration SOW",
    clientName: "TechFlow Solutions Inc.",
    status: "ready",
    riskScore: "medium",
    clauseCount: 9,
    contractValue: 125000,
    currency: "USD",
    expiryDate: "2026-10-31",
    uploadedAt: "2026-03-22T14:30:00Z",
    uploadedBy: "user-002",
    fileType: "docx",
    pageCount: 41,
    aiSummary:
      "Large cloud migration engagement across three phases. Payment milestones are standard 30-day net. Termination requires 90 days written notice. Liability is capped at contract value. Medium risk overall.",
  },
  {
    id: "contract-003",
    title: "BlueSky Digital — Mobile App Dev",
    clientName: "BlueSky Digital Ltd.",
    status: "processing",
    riskScore: null,
    clauseCount: 0,
    contractValue: null,
    currency: "USD",
    expiryDate: null,
    uploadedAt: "2026-04-28T08:02:00Z",
    uploadedBy: "user-001",
    fileType: "pdf",
    pageCount: 18,
    aiSummary: null,
  },
  {
    id: "contract-004",
    title: "GlobalMed — UX Audit & Research",
    clientName: "GlobalMed Corp.",
    status: "ready",
    riskScore: "low",
    clauseCount: 5,
    contractValue: 22000,
    currency: "USD",
    expiryDate: "2026-08-15",
    uploadedAt: "2026-04-05T11:20:00Z",
    uploadedBy: "user-003",
    fileType: "pdf",
    pageCount: 12,
    aiSummary:
      "UX research and audit engagement. All clauses are standard. 30-day payment terms, NDA for 2 years, no auto-renewal, liability capped at engagement value. Low risk — no immediate action required.",
  },
  {
    id: "contract-005",
    title: "StartupXYZ — Brand Identity Package",
    clientName: "StartupXYZ Labs",
    status: "error",
    riskScore: null,
    clauseCount: 0,
    contractValue: null,
    currency: "USD",
    expiryDate: null,
    uploadedAt: "2026-04-27T16:45:00Z",
    uploadedBy: "user-002",
    fileType: "docx",
    pageCount: 8,
    aiSummary: null,
  },
  {
    id: "contract-006",
    title: "MegaCorp — Enterprise Portal v2",
    clientName: "MegaCorp Industries",
    status: "ready",
    riskScore: "high",
    clauseCount: 12,
    contractValue: 340000,
    currency: "USD",
    expiryDate: "2026-05-01",
    uploadedAt: "2026-02-14T10:00:00Z",
    uploadedBy: "user-001",
    fileType: "pdf",
    pageCount: 67,
    aiSummary:
      "Largest active engagement. Contract expires in 3 days — renewal or termination notice required immediately. Contains uncapped liability clause, broad IP assignment, and a penalty clause for missed acceptance milestones. HIGH RISK.",
  },
];

// ─── Clauses ──────────────────────────────────────────────────────────────────

export const CLAUSES: Clause[] = [
  // contract-001 clauses
  {
    id: "clause-001-01",
    contractId: "contract-001",
    type: "payment_milestone",
    title: "Phase 1 Payment — Design Discovery",
    summary:
      "Payment of $15,000 due within 30 days of Phase 1 acceptance. Late payments accrue 1.5% monthly interest.",
    rawText:
      "§ 4.1  Upon Client's written acceptance of Phase 1 deliverables, Agency shall invoice Client for USD 15,000. Payment shall be due within thirty (30) days of invoice date. Any amounts not paid when due shall accrue interest at the rate of 1.5% per month, compounded monthly.",
    dueDate: "2026-05-06",
    amount: 15000,
    noticeDays: null,
    riskLevel: "medium",
    riskReason: "Late interest compound clause increases financial exposure",
    status: "active",
    tags: ["payment", "phase-1", "interest"],
  },
  {
    id: "clause-001-02",
    contractId: "contract-001",
    type: "renewal_auto",
    title: "Auto-Renewal — 12-Month Extension",
    summary:
      "Agreement auto-renews for successive 12-month terms unless 30 days written notice given before expiry.",
    rawText:
      "§ 9.3  This Agreement shall automatically renew for successive twelve (12) month terms unless either party provides the other with written notice of non-renewal no less than thirty (30) days prior to the expiration of the then-current term.",
    dueDate: "2026-04-28",
    amount: null,
    noticeDays: 30,
    riskLevel: "high",
    riskReason: "Auto-renewal within 30 days of current expiry — notice window has closed",
    status: "active",
    tags: ["renewal", "auto", "notice"],
  },
  {
    id: "clause-001-03",
    contractId: "contract-001",
    type: "ip_ownership",
    title: "IP Transfer — All Deliverables",
    summary:
      "All work product and deliverables are works made for hire. All IP vests irrevocably in client upon payment.",
    rawText:
      "§ 12.1  Agency hereby assigns to Client all right, title, and interest in and to all work product, designs, code, and deliverables created under this Agreement. Such works shall be deemed 'works made for hire' under applicable copyright law. To the extent any such works do not qualify as works made for hire, Agency irrevocably assigns all intellectual property rights therein to Client.",
    dueDate: null,
    amount: null,
    noticeDays: null,
    riskLevel: "high",
    riskReason: "Full IP transfer — agency retains no rights to reuse deliverables",
    status: "active",
    tags: ["ip", "assignment", "copyright"],
  },
  {
    id: "clause-001-04",
    contractId: "contract-001",
    type: "termination_notice",
    title: "Termination for Convenience",
    summary:
      "Either party may terminate with 30 days written notice. Client owes payment for work completed to termination date.",
    rawText:
      "§ 10.2  Either party may terminate this Agreement for convenience upon thirty (30) days written notice. Upon termination, Client shall pay Agency for all work satisfactorily performed through the termination date at the applicable hourly or milestone rates.",
    dueDate: null,
    amount: null,
    noticeDays: 30,
    riskLevel: "medium",
    riskReason: "30-day notice period is below the recommended 60-day minimum",
    status: "active",
    tags: ["termination", "convenience"],
  },
  {
    id: "clause-001-05",
    contractId: "contract-001",
    type: "liability_cap",
    title: "Liability Cap — Contract Value",
    summary:
      "Agency's total liability capped at the total fees paid under the agreement. Excludes gross negligence.",
    rawText:
      "§ 11.1  In no event shall Agency's aggregate liability to Client for any claims arising under or related to this Agreement exceed the total fees paid by Client to Agency during the twelve (12) months preceding the claim. This limitation does not apply to claims arising from Agency's gross negligence or willful misconduct.",
    dueDate: null,
    amount: 48000,
    noticeDays: null,
    riskLevel: "medium",
    riskReason: "Cap equals contract value — exposure may exceed cap if scope expands",
    status: "active",
    tags: ["liability", "cap", "limitation"],
  },
  {
    id: "clause-001-06",
    contractId: "contract-001",
    type: "confidentiality",
    title: "Mutual NDA — 2 Years Post-Termination",
    summary: "Both parties agree to keep confidential information secret for 2 years after agreement ends.",
    rawText:
      "§ 13.1  Each party agrees to maintain the confidentiality of the other party's Confidential Information for a period of two (2) years following termination of this Agreement.",
    dueDate: null,
    amount: null,
    noticeDays: null,
    riskLevel: "low",
    riskReason: null,
    status: "active",
    tags: ["nda", "confidentiality"],
  },
  {
    id: "clause-001-07",
    contractId: "contract-001",
    type: "payment_milestone",
    title: "Phase 2 Payment — Final Delivery",
    summary: "Payment of $33,000 due within 30 days of final delivery acceptance.",
    rawText:
      "§ 4.2  Upon Client's written acceptance of all Phase 2 deliverables, Agency shall invoice Client for USD 33,000. Payment shall be due within thirty (30) days of invoice date.",
    dueDate: "2026-07-15",
    amount: 33000,
    noticeDays: null,
    riskLevel: "low",
    riskReason: null,
    status: "active",
    tags: ["payment", "phase-2"],
  },

  // contract-002 clauses
  {
    id: "clause-002-01",
    contractId: "contract-002",
    type: "payment_milestone",
    title: "Phase 1 — Infrastructure Assessment",
    summary: "Payment of $41,666 due 30 days after Phase 1 milestone sign-off.",
    rawText:
      "§ 5.1  Client shall pay Agency USD 41,666 within thirty (30) days following written sign-off of the Phase 1 Infrastructure Assessment deliverable.",
    dueDate: "2026-05-03",
    amount: 41666,
    noticeDays: null,
    riskLevel: "low",
    riskReason: null,
    status: "active",
    tags: ["payment", "phase-1"],
  },
  {
    id: "clause-002-02",
    contractId: "contract-002",
    type: "termination_notice",
    title: "Termination — 90-Day Notice",
    summary: "Termination requires 90 days written notice from either party.",
    rawText:
      "§ 8.1  Either party may terminate this Agreement upon ninety (90) days prior written notice to the other party.",
    dueDate: null,
    amount: null,
    noticeDays: 90,
    riskLevel: "low",
    riskReason: null,
    status: "active",
    tags: ["termination", "notice"],
  },
  {
    id: "clause-002-03",
    contractId: "contract-002",
    type: "penalty_clause",
    title: "SLA Breach Penalty",
    summary: "Agency pays 5% of monthly fee per week of SLA breach, capped at 20% of monthly fee.",
    rawText:
      "§ 6.3  For each week in which Agency fails to meet the agreed Service Level Agreements, Client may deduct five percent (5%) of that month's fees, up to a maximum deduction of twenty percent (20%) of the monthly fee.",
    dueDate: null,
    amount: null,
    noticeDays: null,
    riskLevel: "medium",
    riskReason: "SLA penalties could reduce revenue by up to 20% monthly",
    status: "active",
    tags: ["sla", "penalty", "deduction"],
  },

  // contract-004 clauses
  {
    id: "clause-004-01",
    contractId: "contract-004",
    type: "payment_milestone",
    title: "Research Phase Payment",
    summary: "Payment of $22,000 due within 30 days of research report delivery.",
    rawText:
      "§ 3.1  Client shall pay Agency USD 22,000 within thirty (30) days of delivery of the final research report.",
    dueDate: "2026-07-01",
    amount: 22000,
    noticeDays: null,
    riskLevel: "low",
    riskReason: null,
    status: "active",
    tags: ["payment"],
  },
  {
    id: "clause-004-02",
    contractId: "contract-004",
    type: "confidentiality",
    title: "NDA — Patient Data",
    summary: "Agency must keep all patient-related research data strictly confidential under HIPAA.",
    rawText:
      "§ 7.1  Agency acknowledges that it may receive access to patient health information and agrees to comply with all applicable HIPAA requirements and to maintain strict confidentiality of all such data.",
    dueDate: null,
    amount: null,
    noticeDays: null,
    riskLevel: "low",
    riskReason: null,
    status: "active",
    tags: ["hipaa", "confidentiality", "patient-data"],
  },

  // contract-006 clauses
  {
    id: "clause-006-01",
    contractId: "contract-006",
    type: "renewal_auto",
    title: "Auto-Renewal — 3-Day Notice Window",
    summary: "Contract auto-renews unless 60 days notice given. Contract expires 2026-05-01 — URGENT.",
    rawText:
      "§ 11.1  This Agreement shall automatically renew for successive one-year terms unless either party provides sixty (60) days written notice of non-renewal prior to the expiration date. The current term expires May 1, 2026.",
    dueDate: "2026-03-02",
    amount: null,
    noticeDays: 60,
    riskLevel: "high",
    riskReason: "60-day notice deadline was 2026-03-02 — already passed. Auto-renewal will occur.",
    status: "active",
    tags: ["renewal", "urgent", "overdue"],
  },
  {
    id: "clause-006-02",
    contractId: "contract-006",
    type: "liability_cap",
    title: "Uncapped Liability — Unlimited Exposure",
    summary: "No liability cap is specified. Agency has unlimited financial exposure under this agreement.",
    rawText:
      "§ 14.2  Notwithstanding any other provision herein, the limitations on liability set forth in Section 14.1 shall not apply to claims arising from Agency's breach of its obligations under this Agreement.",
    dueDate: null,
    amount: null,
    noticeDays: null,
    riskLevel: "high",
    riskReason: "No effective liability cap — full contract value ($340,000) plus consequential damages potentially at risk",
    status: "active",
    tags: ["liability", "uncapped", "critical"],
  },
  {
    id: "clause-006-03",
    contractId: "contract-006",
    type: "penalty_clause",
    title: "Missed Milestone Penalty",
    summary: "Agency owes $5,000 per week for each missed milestone, up to $50,000 total.",
    rawText:
      "§ 6.5  For each calendar week that Agency fails to deliver a milestone as scheduled, Client may assess a penalty of USD 5,000 per week, not to exceed USD 50,000 in aggregate.",
    dueDate: null,
    amount: 50000,
    noticeDays: null,
    riskLevel: "high",
    riskReason: "Significant per-week penalty — any delay beyond 10 weeks hits the $50K cap",
    status: "active",
    tags: ["penalty", "milestone", "weekly"],
  },
];

// ─── Alerts ───────────────────────────────────────────────────────────────────

export const ALERTS: Alert[] = [
  {
    id: "alert-001",
    contractId: "contract-006",
    clauseId: "clause-006-01",
    contractTitle: "MegaCorp — Enterprise Portal v2",
    clientName: "MegaCorp Industries",
    clauseTitle: "Auto-Renewal — 3-Day Notice Window",
    clauseType: "renewal_auto",
    type: "overdue",
    status: "sent",
    dueDate: "2026-03-02",
    sentAt: "2026-03-02T08:00:00Z",
  },
  {
    id: "alert-002",
    contractId: "contract-001",
    clauseId: "clause-001-02",
    contractTitle: "Acme Corp — Brand & Web Redesign",
    clientName: "Acme Corporation",
    clauseTitle: "Auto-Renewal — 12-Month Extension",
    clauseType: "renewal_auto",
    type: "1_day",
    status: "pending",
    dueDate: "2026-04-29",
    sentAt: null,
  },
  {
    id: "alert-003",
    contractId: "contract-001",
    clauseId: "clause-001-01",
    contractTitle: "Acme Corp — Brand & Web Redesign",
    clientName: "Acme Corporation",
    clauseTitle: "Phase 1 Payment — Design Discovery",
    clauseType: "payment_milestone",
    type: "7_day",
    status: "sent",
    dueDate: "2026-05-06",
    sentAt: "2026-04-29T08:00:00Z",
  },
  {
    id: "alert-004",
    contractId: "contract-002",
    clauseId: "clause-002-01",
    contractTitle: "TechFlow Solutions — Cloud Migration SOW",
    clientName: "TechFlow Solutions Inc.",
    clauseTitle: "Phase 1 — Infrastructure Assessment",
    clauseType: "payment_milestone",
    type: "7_day",
    status: "pending",
    dueDate: "2026-05-03",
    sentAt: null,
  },
  {
    id: "alert-005",
    contractId: "contract-006",
    clauseId: "clause-006-03",
    contractTitle: "MegaCorp — Enterprise Portal v2",
    clientName: "MegaCorp Industries",
    clauseTitle: "Missed Milestone Penalty",
    clauseType: "penalty_clause",
    type: "overdue",
    status: "dismissed",
    dueDate: "2026-04-10",
    sentAt: "2026-04-10T08:00:00Z",
  },
  {
    id: "alert-006",
    contractId: "contract-004",
    clauseId: "clause-004-01",
    contractTitle: "GlobalMed — UX Audit & Research",
    clientName: "GlobalMed Corp.",
    clauseTitle: "Research Phase Payment",
    clauseType: "payment_milestone",
    type: "7_day",
    status: "pending",
    dueDate: "2026-05-05",
    sentAt: null,
  },
];

// ─── Team ─────────────────────────────────────────────────────────────────────

export const TEAM_MEMBERS: TeamMember[] = [
  {
    id: "user-001",
    name: "Gagan Karthik",
    email: "gagan@scriviq.com",
    role: "owner",
    initials: "GK",
    joinedAt: "2026-01-15T00:00:00Z",
    lastActiveAt: "2026-04-28T09:30:00Z",
  },
  {
    id: "user-002",
    name: "Maya Patel",
    email: "maya@scriviq.com",
    role: "admin",
    initials: "MP",
    joinedAt: "2026-02-01T00:00:00Z",
    lastActiveAt: "2026-04-28T08:15:00Z",
  },
  {
    id: "user-003",
    name: "James Okafor",
    email: "james@scriviq.com",
    role: "member",
    initials: "JO",
    joinedAt: "2026-03-10T00:00:00Z",
    lastActiveAt: "2026-04-27T14:00:00Z",
  },
  {
    id: "user-004",
    name: "Sara Chen",
    email: "sara@scriviq.com",
    role: "member",
    initials: "SC",
    joinedAt: "2026-04-01T00:00:00Z",
    lastActiveAt: "2026-04-26T11:00:00Z",
  },
];

// ─── Activity Feed ────────────────────────────────────────────────────────────

export const ACTIVITY: ActivityEvent[] = [
  {
    id: "activity-001",
    type: "contract_uploaded",
    description: "BlueSky Digital — Mobile App Dev uploaded and processing",
    contractId: "contract-003",
    timestamp: "2026-04-28T08:02:00Z",
  },
  {
    id: "activity-002",
    type: "alert_sent",
    description: "7-day alert sent for Acme Corp Phase 1 Payment ($15,000 due May 6)",
    contractId: "contract-001",
    timestamp: "2026-04-27T08:00:00Z",
  },
  {
    id: "activity-003",
    type: "contract_uploaded",
    description: "StartupXYZ — Brand Identity Package uploaded",
    contractId: "contract-005",
    timestamp: "2026-04-27T16:45:00Z",
  },
  {
    id: "activity-004",
    type: "clause_actioned",
    description: "Liability cap clause marked as actioned on MegaCorp contract",
    contractId: "contract-006",
    timestamp: "2026-04-26T14:22:00Z",
  },
  {
    id: "activity-005",
    type: "extraction_complete",
    description: "GlobalMed — UX Audit extracted 5 clauses, risk: LOW",
    contractId: "contract-004",
    timestamp: "2026-04-05T11:28:00Z",
  },
  {
    id: "activity-006",
    type: "member_added",
    description: "Sara Chen added as member",
    timestamp: "2026-04-01T09:00:00Z",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getContractClauses(contractId: string): Clause[] {
  return CLAUSES.filter((c) => c.contractId === contractId);
}

export function getContractById(id: string): Contract | undefined {
  return CONTRACTS.find((c) => c.id === id);
}

export function getPendingAlerts(): Alert[] {
  return ALERTS.filter((a) => a.status !== "dismissed");
}

export function getDashboardStats() {
  const readyContracts = CONTRACTS.filter((c) => c.status === "ready");
  const totalValue = readyContracts.reduce((sum, c) => sum + (c.contractValue ?? 0), 0);
  const highRiskClauses = CLAUSES.filter((c) => c.riskLevel === "high" && c.status === "active");
  const today = new Date("2026-04-28");
  const in30Days = new Date("2026-05-28");
  const upcomingDeadlines = CLAUSES.filter((c) => {
    if (!c.dueDate) return false;
    const d = new Date(c.dueDate);
    return d >= today && d <= in30Days;
  });
  return {
    totalValue,
    activeContracts: readyContracts.length,
    highRiskClauseCount: highRiskClauses.length,
    upcomingDeadlineCount: upcomingDeadlines.length,
    processingCount: CONTRACTS.filter((c) => c.status === "processing").length,
    pendingAlertCount: ALERTS.filter((a) => a.status === "pending").length,
  };
}

export function formatCurrency(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);
}

export function daysUntil(isoDate: string): number {
  const now = new Date("2026-04-28");
  const target = new Date(isoDate);
  return Math.ceil((target.getTime() - now.getTime()) / 86_400_000);
}

export function relativeTime(isoDate: string): string {
  const diffMs = new Date("2026-04-28T10:00:00Z").getTime() - new Date(isoDate).getTime();
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  return `${days}d ago`;
}

export function clauseTypeLabel(type: ClauseType): string {
  return type.replace(/_/g, " ");
}
