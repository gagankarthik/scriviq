# scriviq

**AI-powered contract intelligence for digital agencies.**

scriviq automatically extracts every clause from your SOWs and service agreements, scores risk, tracks deadlines, and alerts your team before anything slips — all in one workspace.

> *Know every clause. Miss nothing.*

---

## What it does

Agencies lose money on contracts they've already signed. Payment terms get missed, auto-renewals trigger unnoticed, and termination clauses get overlooked until it's too late. scriviq reads your contracts so you don't have to.

Upload a PDF or DOCX. In seconds, GPT-4o-mini extracts every legally significant clause, scores its risk level, and surfaces it with a plain-English summary. Deadlines are tracked automatically. When something's due, your team gets alerted.

---

## Features

### Contract Intelligence
- **AI clause extraction** — GPT-4o-mini reads the full document and pulls every payment milestone, termination notice, IP clause, renewal condition, liability cap, and more
- **Risk scoring** — each clause is rated low / medium / high with a one-sentence explanation of why
- **Confidence indicators** — extraction confidence inferred from source text length
- **Favorability badges** — termination clauses are flagged as agency-friendly, balanced, or client-favoured
- **Review mode** — side-by-side view of raw contract text vs. extracted data for audit purposes

### Amendment Tracking
- **Upload change orders** — paste an amended SOW and the AI identifies every clause that changed, was added, or was removed
- **Word-level diff** — side-by-side diff view highlights exactly which words changed
- **Accept / Reject per clause** — review each change individually before applying to the live contract
- **Apply changes** — accepted amendments are written back to the clause record automatically

### Dashboard & Analytics
- **Portfolio area chart** — cumulative contract value over the last 6 months
- **Risk distribution donut** — breakdown of high / medium / low risk contracts
- **Monthly uploads bar chart** — contract upload cadence per month
- **Client concentration chart** — portfolio value split by client, with a >50% concentration warning
- **Expiry urgency chart** — contracts bucketed by time to expiry (overdue, 0–7d, 8–30d, 31–90d, 90d+)
- **Renewal pipeline** — contracts expiring within 90 days, sorted by urgency

### Deadline Management
- **Automatic alerts** — 7-day, 1-day, and overdue notifications per clause
- **All deadlines sidebar** — every clause with a due date, sorted by urgency
- **Payment milestone timeline** — visual cash flow bar and vertical timeline for payment clauses

### Team & Settings
- **Multi-member workspaces** — invite team members with owner / admin / member roles
- **Profile & billing settings** — manage account details and subscription
- **Dark / light theme** — class-based theme switching, warm editorial light mode

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.2 (App Router, React 19) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 |
| Auth | AWS Cognito (server-side, httpOnly cookies) |
| Database | AWS DynamoDB (single-table design) |
| File storage | AWS S3 (presigned URLs) |
| AI | OpenAI GPT-4o-mini |
| Charts | Recharts |
| Icons | Lucide React |

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx                        # Marketing landing page
│   ├── (auth)/                         # Login, signup, verify
│   ├── (app)/                          # Authenticated app shell
│   │   ├── layout.tsx                  # Sidebar + TopNav + auth guard
│   │   ├── dashboard/page.tsx          # Dashboard with charts
│   │   ├── contracts/
│   │   │   ├── page.tsx                # Contract list + filters
│   │   │   ├── upload/page.tsx         # Upload with processing stages
│   │   │   └── [id]/page.tsx           # Contract detail, clauses, amendments
│   │   ├── alerts/page.tsx
│   │   ├── team/page.tsx
│   │   └── settings/page.tsx
│   └── api/
│       ├── auth/                       # login, signup, verify, logout, me
│       ├── contracts/
│       │   ├── route.ts                # GET list, POST create
│       │   └── [id]/
│       │       ├── route.ts            # GET, PATCH, DELETE
│       │       ├── extract/route.ts    # POST — GPT clause extraction
│       │       ├── clauses/route.ts    # GET, PATCH clause status
│       │       └── amendments/
│       │           ├── route.ts        # GET list, POST upload + GPT analysis
│       │           └── [amendmentId]/route.ts  # PATCH resolve
│       ├── alerts/route.ts
│       ├── dashboard/route.ts
│       └── upload/route.ts             # S3 presigned URL
│
├── components/
│   ├── domain/
│   │   ├── DashboardCharts.tsx         # Recharts: area, bar, pie, h-bar
│   │   ├── ClauseList.tsx              # Filtered clause list with category tabs
│   │   ├── ClauseRow.tsx               # Clause card with diff, confidence, favorability
│   │   ├── ContractActions.tsx         # Re-analyse + Delete buttons
│   │   ├── AmendmentPanel.tsx          # Amendment upload, diff review, accept/reject
│   │   ├── ContractUploader.tsx        # 4-stage upload pipeline animation
│   │   ├── RiskGauge.tsx               # SVG semicircle risk gauge
│   │   ├── RiskBadge.tsx
│   │   ├── SettingsTabs.tsx
│   │   └── ...
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   ├── TopNav.tsx
│   │   └── ThemeProvider.tsx
│   └── ui/
│       ├── Button.tsx
│       └── Input.tsx
│
└── lib/
    ├── auth/
    │   ├── session.ts                  # Cookie-based session helpers
    │   └── cognito.ts                  # Cognito SDK wrappers
    ├── aws/
    │   ├── contracts.ts                # All DynamoDB operations
    │   ├── dynamodb.ts                 # DynamoDB client
    │   └── s3.ts                       # S3 presigned URL helpers
    ├── mock-data.ts                    # All TypeScript types
    └── utils.ts                        # formatCurrency, daysUntil, computeRiskScore
```

---

## Database Schema

Single-table DynamoDB (`scriviq-main`). All entities share one table.

| Entity | PK | SK |
|--------|----|----|
| Contract | `WS#<userId>` | `CONTRACT#<id>` |
| Clause | `WS#<userId>#CONTRACT#<contractId>` | `CLAUSE#<contractId>#<clauseId>` |
| Alert | `WS#<userId>` | `ALERT#<id>` |
| Activity | `WS#<userId>` | `ACTIVITY#<timestamp>#<id>` |
| Amendment | `WS#<userId>#CONTRACT#<contractId>` | `AMENDMENT#<id>` |

Each user's workspace key is derived from their Cognito sub: `WS#<cognitoSub>`.

---

## Getting Started

### Prerequisites

- Node.js 20+
- An AWS account with Cognito User Pool, DynamoDB table, and S3 bucket provisioned
- An OpenAI API key

### 1. Clone and install

```bash
git clone https://github.com/your-org/scriviq.git
cd scriviq
npm install
```

### 2. Configure environment variables

Create a `.env.local` file in the project root:

```env
# AWS
AWS_REGION=us-east-2
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key

# Cognito
AWS_COGNITO_USER_POOL_ID=us-east-2_xxxxxxxxx
AWS_COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx

# DynamoDB
DYNAMODB_TABLE=scriviq-main

# S3
AWS_S3_BUCKET=scriviq-contracts

# OpenAI
OPENAI_API_KEY=sk-...
```

### 3. Set up Cognito

The project includes a setup script that creates the User Pool and App Client:

```bash
npm run setup:cognito
```

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 5. Build for production

```bash
npm run build
npm start
```

---

## How Clause Extraction Works

1. User uploads a PDF or DOCX contract
2. The file is stored in S3 via a presigned PUT URL
3. `POST /api/contracts/[id]/extract` is called
4. The contract text is sent to GPT-4o-mini with a structured extraction prompt
5. GPT returns a JSON array of clauses — each with type, title, raw text, summary, due date, amount, notice days, risk level, and tags
6. Clauses are written to DynamoDB and the contract record is updated to `ready`

Supported clause types: `payment_milestone`, `termination_notice`, `renewal_auto`, `ip_ownership`, `liability_cap`, `confidentiality`, `penalty_clause`, `acceptance_criteria`, `governing_law`, `dispute_resolution`, `force_majeure`, `scope_change`, `other`

---

## How Amendment Tracking Works

1. Client sends a revised SOW or change order
2. User clicks **Upload amendment** on the contract detail page and pastes the document text
3. `POST /api/contracts/[id]/amendments` sends the amendment text + existing clauses to GPT
4. GPT identifies every clause that was added, modified, or removed and returns a structured diff
5. The user reviews each change with a word-level side-by-side diff
6. Accepted changes are applied to the live clause records via `PATCH /api/contracts/[id]/amendments/[amendmentId]`

---

## Design System

### Color tokens

The app uses CSS custom properties for theming. Dark mode is the default.

| Token | Dark | Light |
|-------|------|-------|
| `--surface-base` | `#0a0f1e` | `#F8F6F1` |
| `--surface-elevated` | `#111827` | `#FFFFFF` |
| `--fg-primary` | `#f1f5f9` | `#131210` |
| `--fg-muted` | `#64748b` | `#A09C92` |

### Brand palette

| Name | Value | Usage |
|------|-------|-------|
| Brand blue | `#0072E5` | CTAs, links, active states |
| Brand light | `#75D8FC` | Dark mode accent |
| Brand hover | `#0058b3` | Button hover |

### Fonts

- **Sans**: Inter (headings, body)
- **Mono**: JetBrains Mono (clause text, badges, numbers)

---

## Roadmap

### Done
- [x] Cognito auth with email verification
- [x] S3 contract upload (PDF, DOCX)
- [x] GPT-4o-mini clause extraction with risk scoring
- [x] Contract detail with payment milestone timeline and risk gauge
- [x] Clause list with category filters, review mode, and confidence indicators
- [x] Deadline alerts (7-day, 1-day, overdue)
- [x] Dashboard with recharts portfolio and risk analytics
- [x] Amendment upload, word-level diff, accept/reject workflow
- [x] Re-analyse and delete contract actions
- [x] Dark / light theme

### Planned
- [ ] Slack and email deadline notifications
- [ ] CSV export of clauses
- [ ] Clause comments and team annotations
- [ ] SSO (Google Workspace, Okta)
- [ ] Webhook delivery for external integrations
- [ ] Read-only API for power users

---

## License

Private — all rights reserved.
