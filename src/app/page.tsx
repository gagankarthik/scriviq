import Link from "next/link";
import Image from "next/image";
import { Playfair_Display } from "next/font/google";
import {
  ArrowRight, Check, Upload, Brain, Bell,
  AlertTriangle, RefreshCw, Lock,
  FileSearch2, ShieldAlert, BellRing, LayoutDashboard,
  Users, History, Zap, TrendingUp, Star,
} from "lucide-react";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

// ─── Tokens ────────────────────────────────────────────────────────────────────
const BG      = "#F8F6F1";
const BG_WARM = "#EFECEA";
const BG_DARK = "#0D0C0A";
const INK     = "#131210";
const INK_2   = "#58564F";
const INK_3   = "#A09C92";
const GOLD    = "#B07324";
const GOLD_BG = "#F8EDD7";
const BD      = "rgba(19,18,16,0.09)";
const BD_LT   = "rgba(19,18,16,0.05)";

// ─── Data ──────────────────────────────────────────────────────────────────────

const HERO_CONTRACTS = [
  { name: "Acme Corp — Brand Redesign SOW",  client: "Acme Corp",    value: "$48,000",   risk: "high"   as const, clauses: 7,  days: 12  },
  { name: "Vertex Labs — API Integration",   client: "Vertex Labs",  value: "$24,000",   risk: "medium" as const, clauses: 5,  days: 44  },
  { name: "Northwind Studio — Q4 Retainer",  client: "Northwind",    value: "$8,500/mo", risk: "low"    as const, clauses: 4,  days: 89  },
];

const STATS = [
  { n: "500+",  label: "agencies protected" },
  { n: "$12M+", label: "revenue secured" },
  { n: "15s",   label: "extraction time" },
  { n: "13",    label: "clause types" },
];

const PAIN_POINTS = [
  {
    n: "01", Icon: AlertTriangle, accent: "#DC2626", accentBg: "rgba(220,38,38,0.05)",
    title: "Payments that slip",
    body: "A 30-day payment clause becomes 45. The late-interest penalty you didn't read just cost you $2,400 — and the relationship.",
    stat: "$2,400", statLabel: "avg penalty cost",
  },
  {
    n: "02", Icon: RefreshCw, accent: "#D97706", accentBg: "rgba(217,119,6,0.05)",
    title: "Silent auto-renewals",
    body: "That $85k retainer renewed because no one tracked the 30-day cancellation window. It happens every quarter.",
    stat: "$85k", statLabel: "typical renewal size",
  },
  {
    n: "03", Icon: Lock, accent: INK, accentBg: "rgba(19,18,16,0.03)",
    title: "IP you didn't mean to transfer",
    body: "You built the design system. The contract says it's theirs. scriviq flags every IP clause before you sign.",
    stat: "100%", statLabel: "IP vested in client",
  },
];

const STEPS = [
  {
    n: "01", Icon: Upload,
    title: "Upload your contract",
    body: "Drag any SOW, retainer, or service agreement. PDF, DOCX, or scanned image. AES-256 encrypted in transit and at rest.",
    tag: "PDF · DOCX · Scanned image",
    preview: [
      { w: "60%", c: "#0072E5" },
      { w: "100%", c: "#0072E5", opacity: 0.4 },
      { w: "80%", c: "#0072E5", opacity: 0.25 },
    ],
  },
  {
    n: "02", Icon: Brain,
    title: "AI reads every clause",
    body: "GPT-4o-mini extracts 13 clause types — each with type, amount, due date, and a risk score with a plain-English reason why.",
    tag: "~15 seconds · GPT-4o-mini",
    preview: [
      { label: "PAYMENT",     risk: "medium" as const },
      { label: "TERMINATION", risk: "high"   as const },
      { label: "IP RIGHTS",   risk: "high"   as const },
    ],
  },
  {
    n: "03", Icon: Bell,
    title: "Alerts before deadlines",
    body: "Email alerts at 7 days, 1 day, and when overdue. No spreadsheet. No chasing. Delivered via AWS SES.",
    tag: "7d · 1d · overdue",
    preview: ["Phase 2 Payment — 7 days", "Auto-Renewal — 12 days", "IP Transfer — 31 days"],
  },
];

const FEATURES = [
  {
    cols: 2 as const, Icon: FileSearch2, color: "#0072E5",
    eyebrow: "Clause Intelligence",
    title: "13 clause types extracted automatically",
    body: "Payment milestones, auto-renewals, IP transfers, liability caps, termination notices, penalty clauses, force majeure — every clause that changes your exposure.",
    preview: ["payment_milestone","renewal_auto","ip_ownership","liability_cap","termination_notice","confidentiality","penalty_clause","acceptance_criteria","governing_law","dispute_resolution","force_majeure","scope_change","other"],
  },
  {
    cols: 1 as const, Icon: ShieldAlert, color: "#DC2626",
    eyebrow: "Risk Engine",
    title: "AI risk scoring",
    body: "Every clause scored Low / Medium / High. You get a plain-English reason — not just a label.",
    preview: null,
  },
  {
    cols: 1 as const, Icon: BellRing, color: "#D97706",
    eyebrow: "Deadline Alerts",
    title: "Smart email alerts",
    body: "Automated alerts at 7 days, 1 day, and when overdue. Sent via AWS SES with enterprise-grade delivery.",
    preview: null,
  },
  {
    cols: 2 as const, Icon: LayoutDashboard, color: GOLD,
    eyebrow: "Portfolio View",
    title: "Every contract, one dashboard",
    body: "Total portfolio value, active clauses, upcoming deadlines, and risk distribution across all clients — visible in seconds.",
    preview: ["$284,500", "12 active", "4 high-risk", "7 due soon"],
  },
  {
    cols: 1 as const, Icon: Users, color: INK_2,
    eyebrow: "Team Access",
    title: "Role-based workspaces",
    body: "Owner, admin, and member roles. Every contract visible to exactly the right people.",
    preview: null,
  },
  {
    cols: 1 as const, Icon: History, color: INK_2,
    eyebrow: "Audit Trail",
    title: "Original text preserved",
    body: "Every extracted clause links back to verbatim source text. Always defensible.",
    preview: null,
  },
];

const EXTRACTION_CLAUSES = [
  { tag: "PAYMENT MILESTONE",  title: "Phase 2 Deliverable Payment", amount: "$24,500", due: "Jun 15",  notice: null, risk: "medium" as const, reason: "Payment is 70% backloaded — consider a deposit." },
  { tag: "AUTO-RENEWAL",       title: "12-Month Automatic Renewal",  amount: null,     due: null,      notice: "30d", risk: "high"   as const, reason: "Window closes in 31 days. Non-renewal must be in writing." },
  { tag: "IP TRANSFER",        title: "Work-for-Hire — All IP",      amount: null,     due: null,      notice: null,  risk: "high"   as const, reason: "All deliverables including design system vest immediately." },
  { tag: "TERMINATION NOTICE", title: "Termination for Convenience", amount: null,     due: null,      notice: "14d", risk: "medium" as const, reason: "Client can terminate with 14-day notice. No cure period." },
];

const TESTIMONIALS = [
  {
    stars: 5,
    quote: "scriviq caught an auto-renewal that would have locked us into another $85,000 year with a client we were actively off-boarding. It paid for itself in the first week.",
    name: "Sarah Kim", role: "Creative Director, Momentum Agency", initials: "SK",
  },
  {
    stars: 5,
    quote: "We manage 40+ active contracts. Before scriviq, I had a spreadsheet I updated manually every week. Now it's just handled.",
    name: "Marcus Tate", role: "Managing Partner, Brightfield Consulting", initials: "MT",
  },
  {
    stars: 5,
    quote: "Three months in, scriviq flagged an IP clause that would have given a client full rights to a design system we built from scratch.",
    name: "Elena Russo", role: "Head of Operations, PixelForge Studio", initials: "ER",
  },
];

const PLAN_FEATURES = [
  "Unlimited contract uploads",
  "AI clause extraction — 13 types",
  "Risk scoring + plain-English reasons",
  "Automated email deadline alerts",
  "7-day, 1-day & overdue warnings",
  "Team workspace + role-based access",
  "Portfolio dashboard & analytics",
  "CSV & JSON clause export",
  "PDF + DOCX + scanned image support",
  "AWS-grade encryption at rest",
  "Priority email support",
  "14-day free trial — no credit card",
];

const TRUST_NAMES = ["Momentum", "Brightfield", "PixelForge", "Northwind", "Halyard", "Cascade"];

// ─── Sub-components ────────────────────────────────────────────────────────────

function RiskBadge({ level }: { level: "low" | "medium" | "high" }) {
  const cfg = {
    high:   { dot: "#DC2626", text: "#991B1B", bg: "#FEE2E2", bd: "#FECACA", label: "HIGH" },
    medium: { dot: "#D97706", text: "#92400E", bg: "#FEF3C7", bd: "#FDE68A", label: "MED"  },
    low:    { dot: "#059669", text: "#065F46", bg: "#D1FAE5", bd: "#A7F3D0", label: "LOW"  },
  }[level];
  return (
    <span
      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider shrink-0"
      style={{ backgroundColor: cfg.bg, color: cfg.text, border: `1px solid ${cfg.bd}` }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cfg.dot }} />
      {cfg.label}
    </span>
  );
}

function Stars({ count = 5 }: { count?: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${count} out of 5 stars`}>
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} size={13} fill={GOLD} color={GOLD} />
      ))}
    </div>
  );
}

function Eyebrow({ children, light }: { children: React.ReactNode; light?: boolean }) {
  return (
    <div
      className="inline-flex items-center gap-2 mb-5"
      style={{ color: light ? "rgba(248,246,241,0.4)" : GOLD }}
    >
      <div className="w-4 h-px" style={{ background: light ? "rgba(248,246,241,0.3)" : `rgba(176,115,36,0.5)` }} />
      <span style={{ fontSize: 11, fontFamily: "monospace", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase" }}>
        {children}
      </span>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <div className={playfair.variable} style={{ backgroundColor: BG, color: INK }}>

      <style>{`
        .serif-i { font-family: var(--font-playfair), Georgia, serif; font-style: italic; }
        .serif-n { font-family: var(--font-playfair), Georgia, serif; font-style: normal; }

        .dot-grid {
          background-image: radial-gradient(circle, rgba(19,18,16,0.07) 1px, transparent 1px);
          background-size: 28px 28px;
        }
        .dot-grid-dk {
          background-image: radial-gradient(circle, rgba(248,246,241,0.06) 1px, transparent 1px);
          background-size: 28px 28px;
        }

        .nav-glass {
          background: rgba(248,246,241,0.92);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }

        .btn-ink {
          display: inline-flex; align-items: center; gap: 8px;
          background: ${INK}; color: ${BG};
          padding: 11px 22px; border-radius: 8px;
          font-size: 14px; font-weight: 600; letter-spacing: -0.01em;
          transition: opacity 0.15s, transform 0.1s;
          white-space: nowrap;
        }
        .btn-ink:hover  { opacity: 0.80; transform: translateY(-1px); }
        .btn-ink:active { transform: none; }

        .btn-ghost {
          display: inline-flex; align-items: center; gap: 8px;
          color: ${INK}; border: 1px solid ${BD};
          padding: 11px 22px; border-radius: 8px;
          font-size: 14px; font-weight: 500;
          transition: border-color 0.15s, background 0.15s;
          white-space: nowrap;
        }
        .btn-ghost:hover { border-color: rgba(19,18,16,0.22); background: rgba(19,18,16,0.03); }

        .f-card {
          padding: 28px 32px; border-radius: 16px;
          background: #fff; border: 1px solid ${BD};
          transition: border-color 0.2s, transform 0.2s, box-shadow 0.2s;
          position: relative; overflow: hidden;
        }
        .f-card:hover { border-color: rgba(19,18,16,0.16); transform: translateY(-2px); box-shadow: 0 8px 32px rgba(19,18,16,0.06); }

        .step-card {
          padding: 32px; border-radius: 16px;
          background: #fff; border: 1px solid ${BD};
          position: relative; overflow: hidden;
        }

        .clause-card {
          padding: 14px 16px; border-radius: 10px;
          border: 1px solid rgba(248,246,241,0.1);
          background: rgba(248,246,241,0.05);
          transition: background 0.2s;
        }
        .clause-card:hover { background: rgba(248,246,241,0.08); }

        .shimmer-bar {
          background: linear-gradient(90deg, rgba(19,18,16,0.06) 0%, rgba(19,18,16,0.12) 50%, rgba(19,18,16,0.06) 100%);
          background-size: 200% 100%;
          animation: shimmer 1.8s ease-in-out infinite;
          border-radius: 4px;
        }

        .big-quot {
          font-family: var(--font-playfair), Georgia, serif;
          font-size: clamp(80px, 13vw, 136px);
          line-height: 0.7;
          color: rgba(19,18,16,0.07);
          user-select: none; display: block;
          margin-bottom: 8px;
        }

        @keyframes shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position:  200% 0; }
        }

        @keyframes scan {
          0%, 100% { top: 0%; }
          50%       { top: 92%; }
        }

        @media (max-width: 960px)  { .hero-rhs { display: none !important; } .hero-g { grid-template-columns: 1fr !important; } }
        @media (max-width: 700px)  {
          .col3 { grid-template-columns: 1fr !important; }
          .col2 { grid-template-columns: 1fr !important; }
          .feat-g { grid-template-columns: 1fr !important; }
          .span2  { grid-column: span 1 !important; }
          .stats-g { grid-template-columns: 1fr 1fr !important; }
          .extract-g { grid-template-columns: 1fr !important; }
          .extract-rhs { display: none !important; }
        }
        @media (min-width: 701px) and (max-width: 1040px) {
          .feat-g { grid-template-columns: 1fr 1fr !important; }
          .stats-g { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>

      {/* ══════════════════════════════════════ NAV ═══════════════════════════ */}
      <nav className="nav-glass sticky top-0 z-50" style={{ borderBottom: `1px solid ${BD}` }}>
        <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/logo.png" alt="scriviq" width={127} height={27} />
          </Link>
          <div className="hidden md:flex items-center gap-8">
            {[["Features","#features"],["How it works","#how-it-works"],["Pricing","#pricing"]].map(([l,h]) => (
              <a key={l} href={h} style={{ color: INK_2, fontSize: 14, fontWeight: 500 }}
                className="hover:opacity-60 transition-opacity">{l}</a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" style={{ color: INK_2, fontSize: 14, fontWeight: 500 }}
              className="hidden sm:block hover:opacity-60 transition-opacity">Sign in</Link>
            <Link href="/signup" className="btn-ink" style={{ padding: "9px 18px", fontSize: 13 }}>
              Start free trial <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </nav>

      {/* ══════════════════════════════════════ HERO ══════════════════════════ */}
      <section style={{
        backgroundColor: BG,
        backgroundImage: `radial-gradient(ellipse at 60% -10%, rgba(176,115,36,0.10) 0%, transparent 55%), radial-gradient(ellipse at 10% 60%, rgba(176,115,36,0.06) 0%, transparent 50%), radial-gradient(circle, rgba(19,18,16,0.06) 1px, transparent 1px)`,
        backgroundSize: "auto, auto, 28px 28px",
      }}>
        <div className="max-w-[1200px] mx-auto px-6 pt-20 pb-16 lg:pt-28 lg:pb-24">
          <div className="hero-g" style={{ display: "grid", gridTemplateColumns: "1fr 520px", gap: "clamp(36px,5vw,72px)", alignItems: "center" }}>

            {/* ── Copy ── */}
            <div>
              <div className="inline-flex items-center gap-2 mb-7 px-3 py-1.5 rounded-full"
                style={{ background: GOLD_BG, border: `1px solid rgba(176,115,36,0.22)` }}>
                <Zap size={12} style={{ color: GOLD }} />
                <span style={{ fontSize: 11, fontFamily: "monospace", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: GOLD }}>
                  AI Contract Intelligence
                </span>
              </div>

              <h1 className="font-bold mb-6"
                style={{ fontSize: "clamp(48px,7.5vw,92px)", lineHeight: 0.92, letterSpacing: "-0.035em", color: INK }}>
                Know every<br />
                <span className="serif-i" style={{ fontWeight: 600, color: GOLD }}>clause.</span><br />
                Miss nothing.
              </h1>

              <p style={{ color: INK_2, fontSize: "clamp(15px,1.7vw,18px)", lineHeight: 1.7, maxWidth: 480, marginBottom: 32 }}>
                scriviq reads every SOW, retainer, and service agreement —
                extracting payment deadlines, auto-renewals, IP clauses, and
                10 more types. Automated alerts keep you covered before it costs you.
              </p>

              <div className="flex flex-wrap items-center gap-3 mb-7">
                <Link href="/signup" className="btn-ink">Start free trial <ArrowRight size={15} /></Link>
                <a href="#how-it-works" className="btn-ghost">See how it works</a>
              </div>

              {/* Social proof strip */}
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex -space-x-2">
                  {["SK","MT","ER","JP","LC"].map((i) => (
                    <div key={i} className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold border-2 shrink-0"
                      style={{ backgroundColor: GOLD_BG, color: GOLD, borderColor: BG }}>
                      {i}
                    </div>
                  ))}
                </div>
                <div>
                  <Stars />
                  <p style={{ fontSize: 12, color: INK_3, marginTop: 2 }}>
                    Trusted by <strong style={{ color: INK }}>500+ agencies</strong> · No credit card required
                  </p>
                </div>
              </div>
            </div>

            {/* ── Browser mockup ── */}
            <div className="hero-rhs" style={{ position: "relative" }}>
              {/* Glow behind the card */}
              <div style={{
                position: "absolute", inset: -40, zIndex: 0,
                background: "radial-gradient(ellipse at 50% 50%, rgba(176,115,36,0.12) 0%, transparent 70%)",
                filter: "blur(24px)",
                pointerEvents: "none",
              }} />

              <div style={{
                position: "relative", zIndex: 1,
                boxShadow: "0 24px 80px rgba(19,18,16,0.14), 0 4px 16px rgba(19,18,16,0.06)",
                borderRadius: 14, overflow: "hidden",
                border: `1px solid ${BD}`,
              }}>
                {/* Browser chrome */}
                <div style={{ background: BG_WARM, padding: "8px 14px", borderBottom: `1px solid ${BD}`, display: "flex", alignItems: "center", gap: 8 }}>
                  <div className="flex gap-1.5 shrink-0">
                    {["#FC6058","#FEC02F","#2ACA44"].map((c) => (
                      <div key={c} style={{ width: 9, height: 9, borderRadius: 5, background: c }} />
                    ))}
                  </div>
                  <div style={{ flex: 1, background: BG, borderRadius: 5, padding: "3px 10px", fontSize: 10, color: INK_3, fontFamily: "monospace", textAlign: "center" }}>
                    app.scriviq.com/contracts
                  </div>
                  <div style={{ background: INK, color: BG, fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 5, flexShrink: 0 }}>
                    Upload
                  </div>
                </div>

                {/* App layout: sidebar + main */}
                <div style={{ display: "grid", gridTemplateColumns: "130px 1fr" }}>
                  {/* Sidebar */}
                  <div style={{ background: BG, borderRight: `1px solid ${BD_LT}`, padding: "10px 6px" }}>
                    <div style={{ padding: "0 6px", marginBottom: 12 }}>
                      <Image src="/logo.png" alt="" width={76} height={16} />
                    </div>
                    {[
                      { label: "Dashboard",  active: false },
                      { label: "Contracts",  active: true  },
                      { label: "Alerts",     active: false },
                      { label: "Team",       active: false },
                      { label: "Settings",   active: false },
                    ].map(({ label, active }) => (
                      <div key={label} style={{
                        padding: "5px 8px", borderRadius: 5, marginBottom: 1,
                        fontSize: 10, fontWeight: active ? 700 : 500,
                        background: active ? "rgba(0,114,229,0.10)" : "transparent",
                        color: active ? "#0058b3" : INK_3,
                        borderLeft: active ? "2px solid #0072E5" : "2px solid transparent",
                      }}>
                        {label}
                      </div>
                    ))}
                    {/* Pro badge */}
                    <div style={{ margin: "12px 4px 0", padding: "6px 8px", borderRadius: 6, background: "rgba(0,114,229,0.08)", border: "1px solid rgba(0,114,229,0.15)" }}>
                      <p style={{ fontSize: 8, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#0072E5", marginBottom: 1 }}>Workspace</p>
                      <p style={{ fontSize: 9, color: INK_2, fontWeight: 600 }}>scriviq Agency</p>
                      <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#75D8FC", background: "rgba(0,114,229,0.15)", padding: "1px 5px", borderRadius: 10, display: "inline-block", marginTop: 3 }}>Pro</span>
                    </div>
                  </div>

                  {/* Main content */}
                  <div style={{ padding: "10px 12px", background: BG }}>
                    {/* Mini stats */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 4, marginBottom: 8 }}>
                      {[
                        { l: "Value",   v: "$284k",  color: "#0072E5" },
                        { l: "Active",  v: "12",     color: "#059669" },
                        { l: "High",    v: "4",      color: "#DC2626" },
                        { l: "Due",     v: "7",      color: "#D97706" },
                      ].map(({ l, v, color }) => (
                        <div key={l} style={{ background: "#fff", border: `1px solid ${BD}`, borderRadius: 5, padding: "4px 5px" }}>
                          <p style={{ fontSize: 7, color: INK_3, marginBottom: 1 }}>{l}</p>
                          <p style={{ fontSize: 11, fontWeight: 800, color, fontFamily: "monospace" }}>{v}</p>
                        </div>
                      ))}
                    </div>

                    {/* Contract list */}
                    {HERO_CONTRACTS.map((c, i) => (
                      <div key={i} style={{
                        background: "#fff", border: `1px solid ${BD}`,
                        borderRadius: 6, padding: "6px 8px", marginBottom: 4,
                        display: "flex", alignItems: "center", gap: 6,
                      }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 10, fontWeight: 700, color: INK, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 1 }}>{c.name}</p>
                          <p style={{ fontSize: 9, color: INK_3 }}>{c.value} · {c.clauses} clauses</p>
                        </div>
                        <RiskBadge level={c.risk} />
                        <div style={{ fontSize: 9, fontFamily: "monospace", fontWeight: 800, color: c.days <= 14 ? "#DC2626" : INK_3, flexShrink: 0 }}>
                          {c.days}d
                        </div>
                      </div>
                    ))}

                    {/* Alert banner */}
                    <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 8px", borderRadius: 6, background: "#FEF3C7", border: "1px solid #FDE68A", marginTop: 2 }}>
                      <Bell size={9} style={{ color: "#D97706", flexShrink: 0 }} />
                      <p style={{ fontSize: 9, color: "#92400E", fontWeight: 600 }}>2 renewal windows open this week — action required</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating badge */}
              <div className="absolute -bottom-4 -left-6"
                style={{
                  background: "#fff", border: `1px solid ${BD}`,
                  borderRadius: 10, padding: "8px 12px",
                  boxShadow: "0 4px 20px rgba(19,18,16,0.1)",
                  display: "flex", alignItems: "center", gap: 8,
                }}>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: GOLD_BG }}>
                  <Brain size={14} style={{ color: GOLD }} />
                </div>
                <div>
                  <p style={{ fontSize: 10, fontWeight: 700, color: INK }}>7 clauses extracted</p>
                  <p style={{ fontSize: 9, color: INK_3 }}>in 12 seconds</p>
                </div>
              </div>

              {/* Floating risk badge */}
              <div className="absolute -top-3 -right-5"
                style={{
                  background: "#FEE2E2", border: "1px solid #FECACA",
                  borderRadius: 8, padding: "6px 10px",
                  boxShadow: "0 4px 16px rgba(220,38,38,0.12)",
                }}>
                <p style={{ fontSize: 9, fontWeight: 800, color: "#991B1B", letterSpacing: "0.06em", textTransform: "uppercase", fontFamily: "monospace" }}>⚠ IP CLAUSE DETECTED</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════ TRUST ═════════════════════════ */}
      <div style={{ backgroundColor: "#fff", borderTop: `1px solid ${BD}`, borderBottom: `1px solid ${BD}` }}>
        <div className="max-w-[1200px] mx-auto px-6 py-5">
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-3">
            <span style={{ fontSize: 11, color: INK_3, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>
              Trusted by 500+ agencies
            </span>
            <div style={{ width: 1, height: 14, background: BD }} className="hidden sm:block" />
            {TRUST_NAMES.map((n, i) => (
              <span key={n} style={{ fontSize: 13, color: i % 2 === 0 ? INK_2 : INK_3, fontWeight: i % 3 === 0 ? 700 : 500 }}>{n}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════ STATS ═════════════════════════ */}
      <section style={{ backgroundColor: BG_DARK }} className="dot-grid-dk">
        <div className="max-w-[1200px] mx-auto px-6 py-16">
          <div className="stats-g" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 0 }}>
            {STATS.map(({ n, label }, i) => (
              <div key={n} style={{
                textAlign: "center", padding: "0 24px",
                borderLeft: i > 0 ? "1px solid rgba(248,246,241,0.08)" : "none",
              }}>
                <p style={{
                  fontSize: "clamp(40px,5vw,64px)", fontWeight: 900,
                  letterSpacing: "-0.04em", lineHeight: 1,
                  background: `linear-gradient(135deg, ${BG} 40%, rgba(248,246,241,0.55))`,
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}>
                  {n}
                </p>
                <p style={{ fontSize: 12, color: "rgba(248,246,241,0.38)", marginTop: 6, fontWeight: 500, letterSpacing: "0.04em" }}>
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════ PROBLEM ═══════════════════════ */}
      <section style={{ backgroundColor: "#fff", paddingTop: 96, paddingBottom: 96 }}>
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="mb-14" style={{ maxWidth: 620 }}>
            <Eyebrow>The Problem</Eyebrow>
            <h2 className="font-bold mb-5"
              style={{ fontSize: "clamp(30px,4.5vw,54px)", lineHeight: 1.06, letterSpacing: "-0.025em", color: INK }}>
              Contracts are written<br />to protect{" "}
              <span className="serif-i" style={{ fontWeight: 600 }}>clients.</span>
            </h2>
            <p style={{ color: INK_2, fontSize: 18, lineHeight: 1.65 }}>
              The average agency loses <strong style={{ color: INK }}>$48,000 per year</strong> to contract
              oversights. Payments slip. Renewals auto-trigger. IP transfers without intent.
            </p>
          </div>

          <div className="col3" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 24 }}>
            {PAIN_POINTS.map((p, i) => (
              <div key={i} style={{
                background: p.accentBg, borderRadius: 16,
                border: `1px solid ${BD}`,
                borderTop: `3px solid ${p.accent}`,
                padding: "28px 28px 32px",
                position: "relative", overflow: "hidden",
              }}>
                {/* Large ghost number */}
                <div style={{
                  position: "absolute", top: -8, right: 12,
                  fontSize: "clamp(64px,10vw,92px)", fontWeight: 900, lineHeight: 1,
                  letterSpacing: "-0.05em", color: "rgba(19,18,16,0.05)",
                  userSelect: "none", pointerEvents: "none",
                }}>
                  {p.n}
                </div>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-5"
                  style={{ background: `${p.accent}15`, border: `1px solid ${p.accent}30` }}>
                  <p.Icon size={16} style={{ color: p.accent }} />
                </div>
                <h3 style={{ fontSize: 19, fontWeight: 700, color: INK, letterSpacing: "-0.01em", marginBottom: 10 }}>{p.title}</h3>
                <p style={{ fontSize: 14, color: INK_2, lineHeight: 1.7, marginBottom: 24 }}>{p.body}</p>
                <div style={{ borderTop: `1px solid ${BD}`, paddingTop: 16 }}>
                  <p style={{ fontSize: "clamp(36px,5vw,52px)", fontWeight: 900, color: p.accent, letterSpacing: "-0.04em", lineHeight: 1, marginBottom: 4 }}>
                    {p.stat}
                  </p>
                  <p style={{ fontSize: 11, color: INK_3, fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase" }}>
                    {p.statLabel}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════ HOW IT WORKS ══════════════════════ */}
      <section id="how-it-works" className="dot-grid" style={{ backgroundColor: BG_WARM, paddingTop: 96, paddingBottom: 96 }}>
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-14">
            <Eyebrow>How It Works</Eyebrow>
            <h2 className="font-bold"
              style={{ fontSize: "clamp(30px,4.5vw,54px)", lineHeight: 1.06, letterSpacing: "-0.025em", color: INK, maxWidth: 480, margin: "0 auto" }}>
              From upload to{" "}
              <span className="serif-i" style={{ fontWeight: 500 }}>clarity</span>
              {" "}in 15 seconds
            </h2>
          </div>

          <div className="col3" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20, position: "relative" }}>
            {/* Connecting line (desktop only) */}
            <div className="hidden lg:block" style={{
              position: "absolute", top: 40, left: "calc(33.33% - 10px)", right: "calc(33.33% - 10px)",
              height: 1, background: `linear-gradient(90deg, ${BD} 0%, rgba(176,115,36,0.3) 50%, ${BD} 100%)`,
              zIndex: 0,
            }} />

            {STEPS.map((s, i) => (
              <div key={i} className="step-card" style={{ position: "relative", zIndex: 1 }}>
                {/* Step number circle */}
                <div style={{
                  width: 44, height: 44, borderRadius: "50%",
                  background: "#fff", border: `1px solid ${BD}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  marginBottom: 20, position: "relative",
                  boxShadow: "0 2px 8px rgba(19,18,16,0.06)",
                }}>
                  <s.Icon size={18} style={{ color: GOLD }} />
                  <div style={{
                    position: "absolute", top: -6, right: -6,
                    background: INK, color: BG,
                    fontSize: 8, fontWeight: 800, fontFamily: "monospace",
                    width: 16, height: 16, borderRadius: "50%",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {i + 1}
                  </div>
                </div>

                <h3 style={{ fontSize: 17, fontWeight: 700, color: INK, letterSpacing: "-0.01em", marginBottom: 10 }}>{s.title}</h3>
                <p style={{ fontSize: 14, color: INK_2, lineHeight: 1.7, marginBottom: 16 }}>{s.body}</p>

                {/* Visual preview area */}
                {i === 0 && (
                  <div style={{ background: BG, borderRadius: 8, padding: "10px 12px", border: `1px solid ${BD}`, marginBottom: 12, position: "relative", overflow: "hidden" }}>
                    <div style={{ position: "absolute", left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)`, animation: "scan 2s ease-in-out infinite", opacity: 0.5 }} />
                    {[{w:"70%"},{w:"100%",o:0.5},{w:"55%",o:0.3},{w:"85%",o:0.25}].map((row, j) => (
                      <div key={j} className="shimmer-bar" style={{ height: 7, width: row.w, opacity: (row as { o?: number }).o ?? 1, marginBottom: 5 }} />
                    ))}
                  </div>
                )}
                {i === 1 && (
                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 12 }}>
                    {s.preview && typeof s.preview[0] === "object" && "label" in (s.preview[0] as object) &&
                      (s.preview as { label: string; risk: "high" | "medium" | "low" }[]).map((cl, j) => (
                        <div key={j} style={{ display: "flex", alignItems: "center", gap: 4, background: BG, border: `1px solid ${BD}`, borderRadius: 5, padding: "3px 6px" }}>
                          <span style={{ fontSize: 8, fontFamily: "monospace", color: INK_3, fontWeight: 700 }}>{cl.label}</span>
                          <RiskBadge level={cl.risk} />
                        </div>
                      ))
                    }
                  </div>
                )}
                {i === 2 && (
                  <div style={{ marginBottom: 12 }}>
                    {(s.preview as string[]).map((alert, j) => (
                      <div key={j} style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 0", borderBottom: j < 2 ? `1px solid ${BD_LT}` : "none" }}>
                        <Bell size={9} style={{ color: GOLD, flexShrink: 0 }} />
                        <span style={{ fontSize: 10, color: INK_2, fontWeight: 500 }}>{alert}</span>
                      </div>
                    ))}
                  </div>
                )}

                <span style={{ fontSize: 10, fontFamily: "monospace", fontWeight: 700, color: INK_3, background: "rgba(19,18,16,0.05)", padding: "4px 10px", borderRadius: 6 }}>
                  {s.tag}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════ FEATURES ══════════════════════ */}
      <section id="features" style={{ backgroundColor: "#fff", paddingTop: 96, paddingBottom: 96 }}>
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="mb-12">
            <Eyebrow>Features</Eyebrow>
            <h2 className="font-bold"
              style={{ fontSize: "clamp(30px,4.5vw,54px)", lineHeight: 1.06, letterSpacing: "-0.025em", color: INK, maxWidth: 500 }}>
              Everything a contract{" "}
              <span className="serif-i" style={{ fontWeight: 500 }}>needs to be understood</span>
            </h2>
          </div>

          <div className="feat-g" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            {FEATURES.map((f, i) => (
              <div
                key={i}
                className={`f-card${f.cols === 2 ? " span2" : ""}`}
                style={{ gridColumn: `span ${f.cols}` }}
              >
                {/* Icon */}
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: `${f.color}12`, border: `1px solid ${f.color}25` }}>
                  <f.Icon size={18} style={{ color: f.color }} />
                </div>

                <div style={{ fontSize: 10, fontFamily: "monospace", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: GOLD, marginBottom: 8 }}>
                  {f.eyebrow}
                </div>
                <h3 style={{ fontSize: f.cols === 2 ? 20 : 16, fontWeight: 700, color: INK, marginBottom: 8, letterSpacing: "-0.015em", lineHeight: 1.35 }}>
                  {f.title}
                </h3>
                <p style={{ fontSize: 14, color: INK_2, lineHeight: 1.65 }}>{f.body}</p>

                {/* Clause type pills for span-2 Clause Intelligence */}
                {f.preview && Array.isArray(f.preview) && typeof f.preview[0] === "string" && f.eyebrow === "Clause Intelligence" && (
                  <div className="flex flex-wrap gap-1.5 mt-5">
                    {(f.preview as string[]).map((tag) => (
                      <span key={tag} style={{ fontSize: 9, fontFamily: "monospace", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", background: BG, border: `1px solid ${BD}`, color: INK_2, padding: "3px 8px", borderRadius: 4 }}>
                        {tag.replace(/_/g, " ")}
                      </span>
                    ))}
                  </div>
                )}

                {/* Portfolio mini stats for span-2 Portfolio View */}
                {f.preview && Array.isArray(f.preview) && typeof f.preview[0] === "string" && f.eyebrow === "Portfolio View" && (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 16 }}>
                    {(f.preview as string[]).map((stat) => (
                      <div key={stat} style={{ background: BG, border: `1px solid ${BD}`, borderRadius: 8, padding: "10px 14px" }}>
                        <p style={{ fontSize: 14, fontWeight: 800, color: INK, fontFamily: "monospace" }}>{stat.split(" ")[0]}</p>
                        <p style={{ fontSize: 10, color: INK_3, marginTop: 2 }}>{stat.split(" ").slice(1).join(" ")}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════ EXTRACTION IN ACTION ═══════════════════ */}
      <section style={{ backgroundColor: BG_DARK, paddingTop: 96, paddingBottom: 96 }} className="dot-grid-dk">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-12">
            <Eyebrow light>Extraction in Action</Eyebrow>
            <h2 className="font-bold"
              style={{ fontSize: "clamp(28px,4.5vw,52px)", lineHeight: 1.08, letterSpacing: "-0.03em", color: BG, maxWidth: 540, margin: "0 auto" }}>
              Uploaded. Extracted.<br />
              <span className="serif-i" style={{ color: "rgba(248,246,241,0.45)", fontWeight: 500 }}>Risk scored in 15 seconds.</span>
            </h2>
          </div>

          <div className="extract-g" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, maxWidth: 900, margin: "0 auto" }}>
            {EXTRACTION_CLAUSES.map((cl, i) => (
              <div key={i} className="clause-card" style={{ animationDelay: `${i * 80}ms` }}>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <span style={{
                      fontSize: 8, fontFamily: "monospace", fontWeight: 800,
                      letterSpacing: "0.12em", textTransform: "uppercase",
                      color: "rgba(248,246,241,0.35)",
                      background: "rgba(248,246,241,0.07)",
                      padding: "2px 6px", borderRadius: 3,
                    }}>
                      {cl.tag}
                    </span>
                  </div>
                  <RiskBadge level={cl.risk} />
                </div>

                <p style={{ fontSize: 13, fontWeight: 700, color: BG, marginBottom: 4, letterSpacing: "-0.01em" }}>{cl.title}</p>

                <div className="flex items-center gap-3 mb-3 flex-wrap">
                  {cl.amount  && <span style={{ fontSize: 11, fontFamily: "monospace", color: "rgba(248,246,241,0.55)", fontWeight: 600 }}>Amount: {cl.amount}</span>}
                  {cl.due     && <span style={{ fontSize: 11, fontFamily: "monospace", color: "rgba(248,246,241,0.55)", fontWeight: 600 }}>Due: {cl.due}</span>}
                  {cl.notice  && <span style={{ fontSize: 11, fontFamily: "monospace", color: "rgba(248,246,241,0.55)", fontWeight: 600 }}>Notice: {cl.notice}</span>}
                </div>

                <div style={{ display: "flex", alignItems: "flex-start", gap: 6, padding: "8px 10px", borderRadius: 6, background: cl.risk === "high" ? "rgba(220,38,38,0.12)" : "rgba(245,158,11,0.10)", border: `1px solid ${cl.risk === "high" ? "rgba(220,38,38,0.2)" : "rgba(245,158,11,0.18)"}` }}>
                  <AlertTriangle size={11} style={{ color: cl.risk === "high" ? "#FC9999" : "#FCD34D", flexShrink: 0, marginTop: 1 }} />
                  <p style={{ fontSize: 11, color: cl.risk === "high" ? "#FC9999" : "#FCD34D", lineHeight: 1.5 }}>{cl.reason}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link href="/signup" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: BG, color: INK,
              padding: "12px 24px", borderRadius: 8,
              fontSize: 14, fontWeight: 700, letterSpacing: "-0.01em",
              transition: "opacity 0.15s",
            }}>
              See your contracts extracted <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════ TESTIMONIALS ══════════════════════ */}
      <section style={{ backgroundColor: BG_WARM, paddingTop: 96, paddingBottom: 96 }}>
        <div className="max-w-[1200px] mx-auto px-6">
          <div style={{ maxWidth: 800, margin: "0 auto 52px", textAlign: "center" }}>
            <Stars count={5} />
            <span className="big-quot" aria-hidden style={{ marginTop: 8 }}>&#8220;</span>
            <p style={{ fontSize: "clamp(18px,2.6vw,24px)", lineHeight: 1.65, color: INK_2, fontStyle: "italic", fontFamily: "var(--font-playfair), Georgia, serif", margin: "0 0 28px" }}>
              {TESTIMONIALS[0].quote}
            </p>
            <div className="flex items-center justify-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                style={{ background: GOLD_BG, color: GOLD, border: `1px solid rgba(176,115,36,0.22)` }}>
                {TESTIMONIALS[0].initials}
              </div>
              <div className="text-left">
                <p style={{ fontSize: 13, fontWeight: 700, color: INK }}>{TESTIMONIALS[0].name}</p>
                <p style={{ fontSize: 12, color: INK_3 }}>{TESTIMONIALS[0].role}</p>
              </div>
            </div>
          </div>

          <div className="col2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {TESTIMONIALS.slice(1).map((t, i) => (
              <div key={i} style={{
                background: "#fff", border: `1px solid ${BD}`,
                borderRadius: 16, padding: "28px 32px",
                marginTop: i === 1 ? 24 : 0,
              }}>
                <Stars count={t.stars} />
                <p style={{ fontSize: 15, color: INK_2, lineHeight: 1.75, fontStyle: "italic", marginTop: 12, marginBottom: 20 }}>
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div style={{ height: 1, background: BD, marginBottom: 16 }} />
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0"
                    style={{ background: GOLD_BG, color: GOLD, border: `1px solid rgba(176,115,36,0.2)` }}>
                    {t.initials}
                  </div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: INK }}>{t.name}</p>
                    <p style={{ fontSize: 12, color: INK_3 }}>{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════ PRICING ═══════════════════════ */}
      <section id="pricing" style={{ backgroundColor: "#fff", paddingTop: 96, paddingBottom: 96 }}>
        <div style={{ maxWidth: 520, margin: "0 auto", padding: "0 24px", textAlign: "center" }}>
          <Eyebrow>Pricing</Eyebrow>
          <h2 className="font-bold mb-3"
            style={{ fontSize: "clamp(28px,4.5vw,48px)", lineHeight: 1.1, letterSpacing: "-0.025em", color: INK }}>
            One plan.<br />Everything included.
          </h2>
          <p style={{ color: INK_2, fontSize: 16, marginBottom: 40 }}>Start free for 14 days — no credit card required.</p>

          <div style={{
            background: BG, border: `1px solid ${BD}`,
            borderRadius: 20, padding: "36px 36px 40px",
            textAlign: "left", position: "relative", overflow: "hidden",
          }}>
            {/* Decorative top gradient line */}
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${INK} 0%, rgba(19,18,16,0.3) 100%)` }} />

            {/* Most popular badge */}
            <div style={{
              position: "absolute", top: 16, right: 16,
              background: GOLD_BG, border: `1px solid rgba(176,115,36,0.25)`,
              borderRadius: 6, padding: "3px 10px",
              fontSize: 10, fontWeight: 800, letterSpacing: "0.08em",
              textTransform: "uppercase", color: GOLD,
              fontFamily: "monospace",
            }}>
              Most Popular
            </div>

            {/* Price */}
            <div className="flex items-end gap-2 mb-2">
              <span style={{ fontSize: "clamp(52px,9vw,72px)", fontWeight: 900, color: INK, letterSpacing: "-0.04em", lineHeight: 1 }}>$49</span>
              <div style={{ marginBottom: 8 }}>
                <p style={{ fontSize: 14, color: INK_2, fontWeight: 500 }}>/month</p>
                <p style={{ fontSize: 12, color: INK_3 }}>per workspace</p>
              </div>
            </div>
            <p style={{ fontSize: 13, color: INK_3, marginBottom: 24 }}>14-day free trial · No credit card required</p>
            <div style={{ height: 1, background: BD, marginBottom: 24 }} />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 16px", marginBottom: 32 }}>
              {PLAN_FEATURES.map((item, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: GOLD_BG, border: `1px solid rgba(176,115,36,0.2)` }}>
                    <Check size={9} style={{ color: GOLD }} strokeWidth={3} />
                  </div>
                  <span style={{ fontSize: 13, color: INK_2, lineHeight: 1.4 }}>{item}</span>
                </div>
              ))}
            </div>

            <Link href="/signup" className="btn-ink" style={{ width: "100%", justifyContent: "center", borderRadius: 10 }}>
              Start your free trial <ArrowRight size={15} />
            </Link>
            <p style={{ textAlign: "center", fontSize: 12, color: INK_3, marginTop: 12 }}>
              No setup fee · Cancel anytime · Data export included
            </p>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════ CTA ═══════════════════════════ */}
      <section style={{ backgroundColor: BG_DARK, paddingTop: 112, paddingBottom: 112 }} className="dot-grid-dk">
        <div className="max-w-[1200px] mx-auto px-6 text-center" style={{ position: "relative" }}>
          {/* Radial glow */}
          <div style={{
            position: "absolute", top: "50%", left: "50%",
            transform: "translate(-50%,-50%)",
            width: 600, height: 400,
            background: "radial-gradient(ellipse, rgba(176,115,36,0.08) 0%, transparent 70%)",
            pointerEvents: "none",
          }} />

          <div style={{ position: "relative", zIndex: 1 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(248,246,241,0.28)", marginBottom: 20, fontFamily: "monospace" }}>
              Get started today
            </p>
            <h2 className="font-bold"
              style={{ fontSize: "clamp(44px,7.5vw,96px)", lineHeight: 0.93, letterSpacing: "-0.035em", color: BG, maxWidth: 720, margin: "0 auto 24px" }}>
              Know what&apos;s in<br />
              <span className="serif-i" style={{ color: GOLD, fontWeight: 500, opacity: 0.85 }}>every contract.</span>
            </h2>
            <p style={{ fontSize: 17, color: "rgba(248,246,241,0.38)", maxWidth: 380, margin: "0 auto 40px", lineHeight: 1.7 }}>
              Join 500+ agencies that stopped losing money to contract fine print.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link href="/signup"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  background: BG, color: INK,
                  padding: "14px 28px", borderRadius: 10,
                  fontSize: 14, fontWeight: 700, letterSpacing: "-0.01em",
                  transition: "opacity 0.15s, transform 0.1s",
                }}>
                Start free trial <ArrowRight size={15} />
              </Link>
              <Link href="/login"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  color: "rgba(248,246,241,0.45)", border: "1px solid rgba(248,246,241,0.12)",
                  padding: "14px 28px", borderRadius: 10,
                  fontSize: 14, fontWeight: 500,
                }}>
                Sign in
              </Link>
            </div>
            <p style={{ fontSize: 12, color: "rgba(248,246,241,0.22)", marginTop: 20 }}>
              No credit card · 14-day trial · Cancel anytime
            </p>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════ FOOTER ════════════════════════ */}
      <footer style={{ backgroundColor: BG, borderTop: `1px solid ${BD}`, paddingTop: 40, paddingBottom: 40 }}>
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
            <div>
              <Image src="/logo.png" alt="scriviq" width={122} height={22} />
              <p style={{ fontSize: 12, color: INK_3, marginTop: 6 }}>AI contract intelligence for agencies.</p>
            </div>
            <div className="flex flex-wrap gap-6">
              {["Features","How it works","Pricing","Privacy","Terms","Security"].map((l) => (
                <a key={l} href="#" style={{ fontSize: 13, color: INK_3 }} className="hover:opacity-60 transition-opacity">{l}</a>
              ))}
            </div>
            <p style={{ fontSize: 12, color: INK_3 }}>© {new Date().getFullYear()} scriviq</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
