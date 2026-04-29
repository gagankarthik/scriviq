import Link from "next/link";
import Image from "next/image";
import { Playfair_Display } from "next/font/google";
import {
  ArrowRight, Check, Upload, Brain, Bell,
  AlertTriangle, RefreshCw, Lock,
} from "lucide-react";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

// ─── Design tokens ─────────────────────────────────────────────────────────────
const BG      = "#F8F6F1";
const BG_WARM = "#EFECEA";
const BG_DARK = "#131210";
const INK     = "#131210";
const INK_2   = "#58564F";
const INK_3   = "#A09C92";
const GOLD    = "#B07324";
const GOLD_BG = "#F8EDD7";
const BD      = "rgba(19,18,16,0.09)";
const BD_LT   = "rgba(19,18,16,0.06)";

// ─── Data ──────────────────────────────────────────────────────────────────────

const HERO_CLAUSES = [
  { tag: "RENEWAL",   title: "Auto-Renewal Clause",         meta: "12-month · 30d notice required", days: 31,   risk: "high"   as const },
  { tag: "IP RIGHTS", title: "IP Transfer — Work for Hire", meta: "All deliverables vest in client", days: null, risk: "high"   as const },
  { tag: "PAYMENT",   title: "Phase 2 Payment",             meta: "$24,500 · Due Jun 15",           days: 12,   risk: "medium" as const },
];

const PAIN_POINTS = [
  {
    n: "01", Icon: AlertTriangle, accent: "#DC2626",
    title: "Payments that slip",
    body: "A 30-day payment clause becomes 45. The late-interest penalty you didn't read just cost you $2,400 — and the relationship.",
    stat: "$2,400", statLabel: "avg penalty cost",
  },
  {
    n: "02", Icon: RefreshCw, accent: "#D97706",
    title: "Silent auto-renewals",
    body: "That $85k retainer renewed because no one tracked the 30-day cancellation window. It happens every quarter.",
    stat: "$85k", statLabel: "typical renewal size",
  },
  {
    n: "03", Icon: Lock, accent: INK,
    title: "IP you didn't mean to transfer",
    body: "You built the design system. The contract says it's theirs. scriviq flags every IP clause before you sign.",
    stat: "100%", statLabel: "IP vested in client",
  },
];

const STEPS = [
  {
    n: "01", Icon: Upload,
    title: "Upload your contract",
    body: "Drag any SOW, retainer, or service agreement. PDF or DOCX, up to 25 MB. Encrypted at rest with AES-256.",
    tag: "PDF · DOCX · up to 25 MB",
  },
  {
    n: "02", Icon: Brain,
    title: "AI reads every clause",
    body: "GPT-4o extracts 13 clause types — structured with type, amount, due date, and a risk score with a plain-English reason.",
    tag: "~15 seconds · 13 clause types",
  },
  {
    n: "03", Icon: Bell,
    title: "Alerts before deadlines",
    body: "Email alerts at 7 days, 1 day, and when overdue. Delivered via AWS SES — no tracking spreadsheet required.",
    tag: "7d · 1d · overdue alerts",
  },
];

const FEATURES = [
  { cols: 2 as const, eyebrow: "Clause Intelligence", title: "13 clause types extracted automatically",   body: "Payment milestones, auto-renewals, IP transfers, liability caps, termination notices, penalty clauses, force majeure — every clause that changes your exposure." },
  { cols: 1 as const, eyebrow: "Risk Engine",         title: "AI risk scoring",                           body: "Every clause scored Low / Medium / High. You get a plain-English reason — not just a label." },
  { cols: 1 as const, eyebrow: "Deadline Alerts",     title: "Smart email alerts",                        body: "Automated alerts at 7 days, 1 day, and when overdue. Sent via AWS SES with enterprise-grade delivery." },
  { cols: 2 as const, eyebrow: "Portfolio View",      title: "Every contract, one dashboard",             body: "Total portfolio value, active clauses, upcoming deadlines, and risk distribution across all clients — visible in seconds." },
  { cols: 1 as const, eyebrow: "Team Access",         title: "Role-based workspaces",                     body: "Owner, admin, and member roles. Every contract visible to exactly the right people." },
  { cols: 1 as const, eyebrow: "Audit Trail",         title: "Original text preserved",                   body: "Every extracted clause links back to verbatim source text. Always defensible." },
];

const TESTIMONIALS = [
  { quote: "scriviq caught an auto-renewal that would have locked us into another $85,000 year with a client we were actively off-boarding. It paid for itself in the first week.", name: "Sarah Kim",    role: "Creative Director, Momentum Agency",       initials: "SK" },
  { quote: "We manage 40+ active contracts. Before scriviq, I had a spreadsheet I updated manually every week. Now it's just handled.",                                            name: "Marcus Tate",  role: "Managing Partner, Brightfield Consulting",  initials: "MT" },
  { quote: "Three months in, scriviq flagged an IP clause that would have given a client full rights to a design system we built from scratch.",                                   name: "Elena Russo",  role: "Head of Operations, PixelForge Studio",     initials: "ER" },
];

const PLAN_FEATURES = [
  "Unlimited contract uploads",
  "AI clause extraction — 13 types",
  "Risk scoring with plain-English reasons",
  "Automated email deadline alerts",
  "7-day, 1-day & overdue warnings",
  "Team workspace + role-based access",
  "Portfolio dashboard & analytics",
  "CSV & JSON clause export",
  "PDF + DOCX support (up to 25 MB)",
  "AWS-grade encryption at rest",
  "Priority email support",
  "14-day free trial — no credit card",
];

const TRUST_NAMES = ["Momentum", "Brightfield", "PixelForge", "Northwind", "Halyard", "Cascade"];

// ─── Helpers ───────────────────────────────────────────────────────────────────

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

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-block text-[11px] font-mono font-semibold uppercase tracking-[0.15em] mb-5"
      style={{ color: GOLD }}>
      {children}
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <div className={playfair.variable} style={{ backgroundColor: BG, color: INK }}>

      <style>{`
        .serif-i { font-family: var(--font-playfair), Georgia, serif; font-style: italic; }

        /* Subtle dot-grid texture */
        .dot-grid {
          background-image: radial-gradient(circle, rgba(19,18,16,0.08) 1px, transparent 1px);
          background-size: 28px 28px;
        }
        .dot-grid-lt {
          background-image: radial-gradient(circle, rgba(19,18,16,0.05) 1px, transparent 1px);
          background-size: 28px 28px;
        }

        /* Nav */
        .nav-glass {
          background: rgba(248,246,241,0.9);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
        }

        /* Buttons */
        .btn-ink {
          display: inline-flex; align-items: center; gap: 8px;
          background: ${INK}; color: ${BG};
          padding: 11px 22px; border-radius: 8px;
          font-size: 14px; font-weight: 600;
          transition: opacity 0.15s ease, transform 0.1s ease;
          white-space: nowrap;
        }
        .btn-ink:hover  { opacity: 0.82; transform: translateY(-1px); }
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

        /* Cards */
        .f-card {
          padding: 28px 32px; border-radius: 14px;
          background: #fff; border: 1px solid ${BD};
          transition: border-color 0.2s, background 0.2s;
        }
        .f-card:hover { border-color: rgba(19,18,16,0.17); background: #FEFCF8; }

        .step-card {
          padding: 32px; border-radius: 16px;
          background: #fff; border: 1px solid ${BD};
          position: relative; overflow: hidden;
        }
        .step-big {
          position: absolute; top: 10px; right: 16px;
          font-size: clamp(68px, 10vw, 100px);
          font-weight: 800; letter-spacing: -0.05em; line-height: 1;
          color: rgba(19,18,16,0.05);
          user-select: none; pointer-events: none;
        }

        /* Testimonial giant quote mark */
        .big-quot {
          font-family: var(--font-playfair), Georgia, serif;
          font-size: clamp(80px, 13vw, 136px);
          line-height: 0.7;
          color: rgba(19,18,16,0.07);
          user-select: none; display: block;
          margin-bottom: 8px;
        }

        /* Hero card */
        .hero-card {
          background: #fff; border: 1px solid ${BD};
          border-radius: 16px; overflow: hidden;
          box-shadow: 0 4px 40px rgba(19,18,16,0.08), 0 1px 4px rgba(19,18,16,0.05);
        }

        /* ── Responsive ── */
        @media (max-width: 920px)  { .hero-rhs { display: none !important; } .hero-g { grid-template-columns: 1fr !important; } }
        @media (max-width: 700px)  {
          .col3 { grid-template-columns: 1fr !important; }
          .col2 { grid-template-columns: 1fr !important; }
          .feat-g { grid-template-columns: 1fr !important; }
          .span2  { grid-column: span 1 !important; }
        }
        @media (min-width: 701px) and (max-width: 1040px) {
          .feat-g { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>

      {/* ═══════════════════════════════════════════ NAV ═══════════════════════ */}
      <nav className="nav-glass sticky top-0 z-50" style={{ borderBottom: `1px solid ${BD}` }}>
        <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between">

          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/logo.svg" alt="scriviq" width={127} height={27} />
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {["Features", "How it works", "Pricing"].map((l) => (
              <a key={l} href={`#${l.toLowerCase().replace(/ /g, "-")}`}
                style={{ color: INK_2, fontSize: 14, fontWeight: 500 }}
                className="hover:opacity-60 transition-opacity">{l}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Link href="/login" style={{ color: INK_2, fontSize: 14, fontWeight: 500 }}
              className="hidden sm:block hover:opacity-60 transition-opacity">
              Sign in
            </Link>
            <Link href="/signup" className="btn-ink" style={{ padding: "9px 18px", fontSize: 13 }}>
              Start free trial <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </nav>

      {/* ═══════════════════════════════════════════ HERO ══════════════════════ */}
      <section className="dot-grid-lt" style={{ backgroundColor: BG }}>
        <div className="max-w-[1200px] mx-auto px-6 pt-20 pb-16 lg:pt-28 lg:pb-24">
          <div className="hero-g" style={{ display: "grid", gridTemplateColumns: "1fr 460px", gap: "clamp(36px,6vw,80px)", alignItems: "center" }}>

            {/* ── Left: copy ── */}
            <div>
              {/* Eyebrow pill */}
              <div className="inline-flex items-center gap-2 mb-7">
                <span className="px-3 py-1 rounded-full text-[11px] font-mono font-semibold uppercase tracking-[0.15em]"
                  style={{ color: GOLD, background: GOLD_BG, border: `1px solid rgba(176,115,36,0.2)` }}>
                  AI Contract Intelligence
                </span>
              </div>

              {/* Headline — dramatic size contrast */}
              <h1 className="font-bold mb-6"
                style={{ fontSize: "clamp(48px,8vw,94px)", lineHeight: 0.92, letterSpacing: "-0.035em", color: INK }}>
                Know every<br />
                <span className="serif-i" style={{ fontWeight: 600 }}>clause.</span><br />
                Miss nothing.
              </h1>

              <p style={{ color: INK_2, fontSize: "clamp(15px,1.8vw,18px)", lineHeight: 1.68, maxWidth: 490, marginBottom: 32 }}>
                scriviq reads every SOW, retainer, and service agreement —
                extracting payment deadlines, auto-renewals, IP clauses, and
                10 more types. Automated alerts keep you covered.
              </p>

              <div className="flex flex-wrap items-center gap-3 mb-5">
                <Link href="/signup" className="btn-ink">Start free trial <ArrowRight size={15} /></Link>
                <a href="#how-it-works" className="btn-ghost">See how it works</a>
              </div>

              <p style={{ color: INK_3, fontSize: 13 }}>
                No credit card &middot; 14-day trial &middot; Cancel anytime
              </p>
            </div>

            {/* ── Right: UI mockup ── */}
            <div className="hero-rhs">
              <div className="hero-card">
                {/* Header */}
                <div style={{ padding: "14px 18px", borderBottom: `1px solid ${BD_LT}`, background: BG }}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p style={{ fontSize: 11, color: INK_3, fontFamily: "var(--font-jetbrains)", letterSpacing: "0.05em", marginBottom: 5 }}>
                        Acme Corp — Brand Redesign SOW.pdf
                      </p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span style={{ fontSize: 12, fontWeight: 600, color: INK_2 }}>7 clauses extracted</span>
                        <span style={{ color: INK_3 }}>·</span>
                        <RiskBadge level="high" />
                      </div>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1 shrink-0" />
                  </div>
                </div>

                {/* Clause rows */}
                <div style={{ padding: "8px 8px 0" }}>
                  {HERO_CLAUSES.map((cl, i) => (
                    <div key={i} className="flex items-start gap-3"
                      style={{
                        padding: "11px 13px", borderRadius: 10, marginBottom: 4,
                        background: cl.risk === "high" ? "rgba(220,38,38,0.04)" : "rgba(217,119,6,0.04)",
                      }}>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1.5">
                          <span style={{ fontSize: 9, fontFamily: "var(--font-jetbrains)", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: INK_3, background: "rgba(19,18,16,0.06)", padding: "2px 6px", borderRadius: 4 }}>
                            {cl.tag}
                          </span>
                          <RiskBadge level={cl.risk} />
                        </div>
                        <p style={{ fontSize: 13, fontWeight: 600, color: INK, marginBottom: 2 }}>{cl.title}</p>
                        <p style={{ fontSize: 12, color: INK_2 }}>{cl.meta}</p>
                      </div>
                      {cl.days && (
                        <div className="shrink-0" style={{ fontSize: 11, fontFamily: "var(--font-jetbrains)", fontWeight: 700, color: cl.risk === "high" ? "#DC2626" : "#D97706" }}>
                          {cl.days}d
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Alert banner */}
                <div style={{ padding: "0 8px 12px" }}>
                  <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl"
                    style={{ background: "#FEF3C7", border: "1px solid #FDE68A" }}>
                    <Bell size={12} style={{ color: "#D97706", flexShrink: 0 }} />
                    <p style={{ fontSize: 12, color: "#92400E", fontWeight: 500 }}>
                      2 alerts due this week — renewal notice expires in 31 days
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════ TRUST BAR ═════════════════════ */}
      <div style={{ backgroundColor: "#fff", borderTop: `1px solid ${BD}`, borderBottom: `1px solid ${BD}` }}>
        <div className="max-w-[1200px] mx-auto px-6 py-5">
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-3">
            <span style={{ fontSize: 11, color: INK_3, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" }}>
              Trusted by 500+ agencies
            </span>
            <div style={{ width: 1, height: 14, background: BD }} className="hidden sm:block" />
            {TRUST_NAMES.map((n) => (
              <span key={n} style={{ fontSize: 13, color: INK_3, fontWeight: 600 }}>{n}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════ PROBLEM ═══════════════════════ */}
      <section style={{ backgroundColor: "#fff", paddingTop: 96, paddingBottom: 96 }}>
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="mb-14" style={{ maxWidth: 620 }}>
            <Eyebrow>The Problem</Eyebrow>
            <h2 className="font-bold mb-5"
              style={{ fontSize: "clamp(30px,5vw,56px)", lineHeight: 1.05, letterSpacing: "-0.025em", color: INK }}>
              Contracts are written<br />to protect{" "}
              <span className="serif-i" style={{ fontWeight: 600 }}>clients.</span>
            </h2>
            <p style={{ color: INK_2, fontSize: 18, lineHeight: 1.65 }}>
              The average agency loses $48,000 per year to contract oversights.
              Payments slip. Renewals auto-trigger. IP transfers without intent.
            </p>
          </div>

          <div className="col3" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 40 }}>
            {PAIN_POINTS.map((p, i) => (
              <div key={i} style={{ borderTop: `2px solid ${p.accent}`, paddingTop: 28 }}>
                <div style={{ fontSize: "clamp(52px,8vw,76px)", fontWeight: 800, lineHeight: 1, letterSpacing: "-0.05em", color: "rgba(19,18,16,0.06)", marginBottom: 16 }}>
                  {p.n}
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: INK, letterSpacing: "-0.01em", marginBottom: 10 }}>{p.title}</h3>
                <p style={{ fontSize: 15, color: INK_2, lineHeight: 1.65, marginBottom: 24 }}>{p.body}</p>
                <p style={{ fontSize: "clamp(32px,4.5vw,48px)", fontWeight: 800, color: INK, letterSpacing: "-0.04em", lineHeight: 1, marginBottom: 4 }}>
                  {p.stat}
                </p>
                <p style={{ fontSize: 11, color: INK_3, fontWeight: 600, letterSpacing: "0.09em", textTransform: "uppercase" }}>
                  {p.statLabel}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════ HOW IT WORKS ═══════════════════════ */}
      <section id="how-it-works" className="dot-grid" style={{ backgroundColor: BG_WARM, paddingTop: 96, paddingBottom: 96 }}>
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-14">
            <Eyebrow>How It Works</Eyebrow>
            <h2 className="font-bold"
              style={{ fontSize: "clamp(30px,5vw,56px)", lineHeight: 1.05, letterSpacing: "-0.025em", color: INK, maxWidth: 520, margin: "0 auto" }}>
              Three steps to{" "}
              <span className="serif-i" style={{ fontWeight: 500 }}>contract clarity</span>
            </h2>
          </div>

          <div className="col3" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20 }}>
            {STEPS.map((s, i) => (
              <div key={i} className="step-card">
                <div className="step-big">{s.n}</div>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-5"
                  style={{ background: GOLD_BG, border: `1px solid rgba(176,115,36,0.18)` }}>
                  <s.Icon size={18} style={{ color: GOLD }} />
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: INK, letterSpacing: "-0.01em", marginBottom: 10 }}>{s.title}</h3>
                <p style={{ fontSize: 14, color: INK_2, lineHeight: 1.7, marginBottom: 16 }}>{s.body}</p>
                <span style={{ fontSize: 11, fontFamily: "var(--font-jetbrains)", fontWeight: 600, color: INK_3, background: "rgba(19,18,16,0.05)", padding: "4px 10px", borderRadius: 6 }}>
                  {s.tag}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════ FEATURES ══════════════════════ */}
      <section id="features" style={{ backgroundColor: "#fff", paddingTop: 96, paddingBottom: 96 }}>
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="mb-12">
            <Eyebrow>Features</Eyebrow>
            <h2 className="font-bold"
              style={{ fontSize: "clamp(30px,5vw,56px)", lineHeight: 1.05, letterSpacing: "-0.025em", color: INK, maxWidth: 500 }}>
              Everything a contract{" "}
              <span className="serif-i" style={{ fontWeight: 500 }}>needs to be understood</span>
            </h2>
          </div>

          <div className="feat-g" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
            {FEATURES.map((f, i) => (
              <div key={i} className={`f-card${f.cols === 2 ? " span2" : ""}`}
                style={{ gridColumn: `span ${f.cols}` }}>
                <div style={{ fontSize: 10, fontFamily: "var(--font-jetbrains)", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: GOLD, marginBottom: 10 }}>
                  {f.eyebrow}
                </div>
                <h3 style={{ fontSize: f.cols === 2 ? 21 : 17, fontWeight: 700, color: INK, marginBottom: 9, letterSpacing: "-0.015em", lineHeight: 1.3 }}>
                  {f.title}
                </h3>
                <p style={{ fontSize: 14, color: INK_2, lineHeight: 1.65 }}>{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════ TESTIMONIALS ══════════════════════ */}
      <section style={{ backgroundColor: BG_WARM, paddingTop: 96, paddingBottom: 96 }}>
        <div className="max-w-[1200px] mx-auto px-6">

          {/* Primary quote — magazine style */}
          <div style={{ maxWidth: 760, margin: "0 auto 52px", textAlign: "center" }}>
            <span className="big-quot" aria-hidden>&#8220;</span>
            <p style={{ fontSize: "clamp(18px,2.8vw,26px)", lineHeight: 1.65, color: INK_2, fontStyle: "italic", fontFamily: "var(--font-playfair), Georgia, serif", margin: "0 0 28px" }}>
              {TESTIMONIALS[0].quote}
            </p>
            <div className="flex items-center justify-center gap-3">
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ background: GOLD_BG, color: GOLD, border: `1px solid rgba(176,115,36,0.22)` }}>
                {TESTIMONIALS[0].initials}
              </div>
              <div className="text-left">
                <p style={{ fontSize: 13, fontWeight: 700, color: INK }}>{TESTIMONIALS[0].name}</p>
                <p style={{ fontSize: 12, color: INK_3 }}>{TESTIMONIALS[0].role}</p>
              </div>
            </div>
          </div>

          {/* Secondary two */}
          <div className="col2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {TESTIMONIALS.slice(1).map((t, i) => (
              <div key={i} style={{ background: "#fff", border: `1px solid ${BD}`, borderRadius: 14, padding: "28px 32px" }}>
                <p style={{ fontSize: 15, color: INK_2, lineHeight: 1.7, fontStyle: "italic", marginBottom: 20 }}>
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0"
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

      {/* ════════════════════════════════════════ PRICING ══════════════════════ */}
      <section id="pricing" style={{ backgroundColor: "#fff", paddingTop: 96, paddingBottom: 96 }}>
        <div className="max-w-[520px] mx-auto px-6 text-center">
          <Eyebrow>Pricing</Eyebrow>
          <h2 className="font-bold mb-3"
            style={{ fontSize: "clamp(28px,4.5vw,48px)", lineHeight: 1.1, letterSpacing: "-0.025em", color: INK }}>
            One plan.<br />Everything included.
          </h2>
          <p style={{ color: INK_2, fontSize: 16, marginBottom: 40 }}>Start free — no credit card required.</p>

          <div style={{ background: BG, border: `1px solid ${BD}`, borderLeft: `3px solid ${INK}`, borderRadius: 16, padding: 36, textAlign: "left" }}>
            {/* Price */}
            <div className="flex items-end gap-2 mb-2">
              <span style={{ fontSize: "clamp(52px,9vw,78px)", fontWeight: 800, color: INK, letterSpacing: "-0.04em", lineHeight: 1 }}>$49</span>
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

            <Link href="/signup" className="btn-ink" style={{ width: "100%", justifyContent: "center" }}>
              Start your free trial <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════ FINAL CTA ════════════════════════ */}
      <section style={{ backgroundColor: BG_DARK, paddingTop: 100, paddingBottom: 100 }}>
        <div className="max-w-[1200px] mx-auto px-6 text-center">
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase", color: "rgba(248,246,241,0.3)", marginBottom: 20, fontFamily: "var(--font-jetbrains)" }}>
            Get started today
          </p>
          <h2 className="font-bold"
            style={{ fontSize: "clamp(44px,8vw,96px)", lineHeight: 0.93, letterSpacing: "-0.035em", color: BG, maxWidth: 700, margin: "0 auto 24px" }}>
            Know what&apos;s in<br />
            <span className="serif-i" style={{ color: "rgba(248,246,241,0.5)", fontWeight: 500 }}>every contract.</span>
          </h2>
          <p style={{ fontSize: 17, color: "rgba(248,246,241,0.42)", maxWidth: 400, margin: "0 auto 36px", lineHeight: 1.65 }}>
            Join 500+ agencies that stopped losing money to contract fine print.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href="/signup"
              className="inline-flex items-center gap-2 rounded-lg text-sm font-semibold"
              style={{ background: BG, color: INK, padding: "12px 24px", transition: "opacity 0.15s" }}>
              Start free trial <ArrowRight size={15} />
            </Link>
            <Link href="/login"
              className="inline-flex items-center gap-2 rounded-lg text-sm font-medium"
              style={{ color: "rgba(248,246,241,0.5)", padding: "12px 24px", border: "1px solid rgba(248,246,241,0.13)" }}>
              Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════ FOOTER ═══════════════════════ */}
      <footer style={{ backgroundColor: BG, borderTop: `1px solid ${BD}`, paddingTop: 44, paddingBottom: 44 }}>
        <div className="max-w-[1200px] mx-auto px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="flex items-center gap-2.5">
            <Image src="/logo.svg" alt="scriviq" width={122} height={22} />
          </div>
          <div className="flex flex-wrap gap-6">
            {["Privacy", "Terms", "Security", "Status"].map((l) => (
              <a key={l} href="#" style={{ fontSize: 13, color: INK_3 }} className="hover:opacity-60 transition-opacity">{l}</a>
            ))}
          </div>
          <p style={{ fontSize: 12, color: INK_3 }}>© {new Date().getFullYear()} scriviq</p>
        </div>
      </footer>

    </div>
  );
}
