// ─────────────────────────────────────────────────────────────────────────────
// scriviq — Premium Landing Page  (Server Component)
// Enterprise Contract Intelligence · AI-Powered Risk Management for Agencies
// ─────────────────────────────────────────────────────────────────────────────

import Image from "next/image";
import {
  AlertTriangle,
  RefreshCw,
  Lock,
  Brain,
  ShieldCheck,
  Bell,
  Users,
  LayoutDashboard,
  FileText,
  Check,
  ArrowRight,
  Star,
  Upload,
  Zap,
  Sparkles,
  Play,
  CircleDot,
  BarChart3,
} from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────

const BG_BASE = "#020812";
const BG_SURFACE = "#040E1E";
const BG_RAISED = "#071326";
const BRAND = "#0072E5";
const BRAND_LIGHT = "#75D8FC";

// ─── Data ─────────────────────────────────────────────────────────────────────

const HERO_CLAUSES = [
  { type: "PAYMENT", title: "Phase 2 Payment", amount: "$24,500", days: 12, risk: "medium" as const },
  { type: "RENEWAL", title: "Auto-Renewal Clause", amount: "12 months", days: 31, risk: "high" as const },
  { type: "IP RIGHTS", title: "IP Transfer — Work for Hire", amount: "All deliverables", days: null, risk: "high" as const },
  { type: "TERMINATION", title: "30-Day Notice Required", amount: "Either party", days: 90, risk: "low" as const },
];

const EXTRACTION_DEMO = [
  {
    type: "PAYMENT_MILESTONE",
    title: "Phase 2 Payment",
    detail: "$24,500 · Due Jun 15, 2025",
    daysLeft: 12,
    risk: "medium" as const,
    reason: "30-day terms with 1.5%/mo late interest",
    raw: "§ 4.1  Payment of USD 24,500 shall be due within 30 days of Phase 2 milestone acceptance. Late payment shall accrue compound interest at 1.5% per month until settled in full.",
    highlight: "amber",
  },
  {
    type: "RENEWAL_AUTO",
    title: "Auto-Renewal",
    detail: "12-month term · 30d notice required",
    daysLeft: 31,
    risk: "high" as const,
    reason: "Auto-renewal within 30 days of current expiry",
    raw: "§ 9.3  This Agreement shall automatically renew for successive 12-month terms unless either party delivers 30 days written notice of non-renewal prior to the renewal date.",
    highlight: "red",
  },
  {
    type: "IP_OWNERSHIP",
    title: "IP Transfer — Work for Hire",
    detail: "All deliverables vest in Client",
    daysLeft: null,
    risk: "high" as const,
    reason: "Full IP transfer to client on delivery",
    raw: "§ 12.1  All work product, inventions, and deliverables created hereunder shall be works made for hire. All intellectual property rights vest irrevocably in Client upon payment.",
    highlight: "red",
  },
];

const PAIN_POINTS = [
  {
    Icon: AlertTriangle,
    label: "Payment slips",
    title: "Missed payment deadlines",
    desc: "A 30-day clause slips to 45. The penalty clause you didn't read just cost you $2,400 and a client relationship.",
    stat: "$2,400",
    statLabel: "avg penalty",
  },
  {
    Icon: RefreshCw,
    label: "Quiet renewals",
    title: "Silent auto-renewals",
    desc: "That $85k retainer renewed because no one tracked the 30-day cancellation window. It happens every quarter.",
    stat: "$85k",
    statLabel: "silent renewal",
  },
  {
    Icon: Lock,
    label: "IP loss",
    title: "Unchecked IP transfers",
    desc: "You built the design system. The contract says it's theirs. scriviq flags every IP clause before you sign.",
    stat: "100%",
    statLabel: "IP gone",
  },
];

const STEPS = [
  {
    n: "01",
    Icon: Upload,
    title: "Upload your contract",
    desc: "Drag a PDF or DOCX into scriviq. Any SOW, retainer, or service agreement — up to 25MB.",
    chip: "PDF · DOCX · 25MB max",
    sub: "Encrypted at rest · AES-256",
  },
  {
    n: "02",
    Icon: Brain,
    title: "AI extracts every clause",
    desc: "GPT-4o reads the full document and returns structured data — type, amount, due date, and risk score.",
    chip: "~15 seconds end-to-end",
    sub: "13 clause types · structured JSON",
  },
  {
    n: "03",
    Icon: Bell,
    title: "Get alerts before it matters",
    desc: "Deadline alerts land in your inbox 7 days and 1 day before every due date. No tracking required.",
    chip: "7d · 1d · overdue alerts",
    sub: "AWS SES · enterprise delivery",
  },
];

const FEATURES_BENTO = [
  {
    Icon: Brain,
    eyebrow: "Intelligence",
    title: "13 clause types,\nextracted automatically",
    desc: "Payment milestones, auto-renewals, IP transfers, liability caps, termination notices, late fees, jurisdiction, force majeure — every clause that matters.",
    span: 2 as const,
    visual: "clause-list",
  },
  {
    Icon: ShieldCheck,
    eyebrow: "Risk Engine",
    title: "AI risk scoring",
    desc: "Every clause scored Low / Medium / High with a plain-English reason. Know what to negotiate before you sign.",
    span: 1 as const,
    visual: "risk-stack",
  },
  {
    Icon: Bell,
    eyebrow: "Alerts",
    title: "Smart deadline alerts",
    desc: "Email alerts at 7 days, 1 day, and overdue. Sent via AWS SES.",
    span: 1 as const,
    visual: "alert-timeline",
  },
  {
    Icon: LayoutDashboard,
    eyebrow: "Portfolio",
    title: "Every contract,\none dashboard",
    desc: "Total contract value, active clauses, upcoming deadlines, and risk distribution across your entire client base — at a glance.",
    span: 2 as const,
    visual: "dashboard",
  },
  {
    Icon: Users,
    eyebrow: "Collaboration",
    title: "Team workspaces",
    desc: "Role-based access for owners, admins, and members. Every contract visible to the right people.",
    span: 1 as const,
    visual: "team",
  },
  {
    Icon: FileText,
    eyebrow: "Audit",
    title: "Original text preserved",
    desc: "Every extracted clause links back to verbatim source text. Full paper trail. Always defensible.",
    span: 1 as const,
    visual: "audit",
  },
];

const TESTIMONIALS = [
  {
    quote:
      "scriviq caught an auto-renewal clause that would have locked us into another $85,000 year with a client we were actively off-boarding. It paid for itself in the first week.",
    name: "Sarah Kim",
    role: "Creative Director",
    company: "Momentum Agency",
    initials: "SK",
  },
  {
    quote:
      "We manage 40+ active contracts. Before scriviq, I had a spreadsheet with 12 columns I updated manually. Now it's just handled. The 7-day alerts alone are worth the price.",
    name: "Marcus Tate",
    role: "Managing Partner",
    company: "Brightfield Consulting",
    initials: "MT",
  },
  {
    quote:
      "Three months in, scriviq flagged an IP ownership clause in an old retainer that would have given a client full rights to a design system we built from scratch. That single catch justified the entire year.",
    name: "Elena Russo",
    role: "Head of Operations",
    company: "PixelForge Studio",
    initials: "ER",
  },
];

const PLAN_INCLUDES = [
  "Unlimited contract uploads",
  "AI clause extraction — 13 types",
  "Risk scoring with plain-English reasons",
  "Automated email deadline alerts",
  "7-day, 1-day & overdue warnings",
  "Team workspace + role-based access",
  "Portfolio dashboard & analytics",
  "CSV & JSON clause export",
  "PDF + DOCX support (up to 25MB)",
  "AWS-grade encryption & security",
  "Priority email support",
  "14-day free trial — no card",
];

const TRUST_LOGOS = ["MOMENTUM", "BRIGHTFIELD", "PIXELFORGE", "NORTHWIND", "HALYARD", "CASCADE"];

// ─── Risk Badge ───────────────────────────────────────────────────────────────

function RiskBadge({ level, size = "sm" }: { level: "low" | "medium" | "high"; size?: "sm" | "xs" }) {
  const cfg = {
    high:   { dot: "#EF4444", text: "#FCA5A5", bg: "rgba(127,29,29,0.4)",  border: "rgba(153,27,27,0.5)", label: "HIGH" },
    medium: { dot: "#F59E0B", text: "#FCD34D", bg: "rgba(120,53,15,0.4)",  border: "rgba(146,64,14,0.5)", label: "MED"  },
    low:    { dot: "#10B981", text: "#6EE7B7", bg: "rgba(6,78,59,0.4)",    border: "rgba(6,95,70,0.5)",   label: "LOW"  },
  }[level];

  return (
    <span
      className={`inline-flex items-center gap-1 rounded font-mono font-semibold uppercase tracking-wider ${
        size === "xs" ? "px-1 py-0.5 text-[9px]" : "px-1.5 py-0.5 text-[10px]"
      }`}
      style={{ backgroundColor: cfg.bg, color: cfg.text, border: `1px solid ${cfg.border}` }}
    >
      <span className="rounded-full" style={{ width: 6, height: 6, backgroundColor: cfg.dot }} />
      {cfg.label}
    </span>
  );
}

// ─── Section Eyebrow ──────────────────────────────────────────────────────────

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-mono font-semibold uppercase tracking-[0.18em] mb-5"
      style={{
        color: BRAND_LIGHT,
        backgroundColor: "rgba(0,114,229,0.06)",
        border: "1px solid rgba(0,114,229,0.18)",
      }}
    >
      <span
        className="w-1 h-1 rounded-full"
        style={{ backgroundColor: BRAND_LIGHT, boxShadow: `0 0 8px ${BRAND_LIGHT}` }}
      />
      {children}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <>
      {/* ── Global keyframes & utilities ── */}
      <style>{`
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50%      { transform: translateY(-14px); }
        }
        @keyframes gradientShift {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes orbPulse {
          0%, 100% { transform: scale(1);    opacity: 0.45; }
          50%      { transform: scale(1.1);  opacity: 0.7;  }
        }
        @keyframes orbDrift {
          0%, 100% { transform: translate(0px, 0px) scale(1);    }
          33%      { transform: translate(40px, -30px) scale(1.05); }
          66%      { transform: translate(-30px, 20px) scale(0.95); }
        }
        @keyframes lineGrow {
          from { transform: scaleX(0); }
          to   { transform: scaleX(1); }
        }
        @keyframes shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes shimmerLine {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes extractIn {
          from { opacity: 0; transform: translateX(20px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes slowSpin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50%      { opacity: 0.3; }
        }
        @keyframes scanline {
          0%   { transform: translateY(-100%); opacity: 0; }
          50%  { opacity: 1; }
          100% { transform: translateY(100%); opacity: 0; }
        }

        .gradient-text {
          background: linear-gradient(110deg, #75D8FC 0%, #0072E5 35%, #B0E5FF 65%, #0072E5 100%);
          background-size: 200% 200%;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          color: transparent;
          animation: gradientShift 6s ease infinite;
        }

        .gradient-border {
          position: relative;
        }
        .gradient-border::before {
          content: "";
          position: absolute;
          inset: 0;
          padding: 1px;
          border-radius: inherit;
          background: linear-gradient(135deg, rgba(0,114,229,0.5), rgba(117,216,252,0.15) 30%, rgba(255,255,255,0.04) 50%, rgba(117,216,252,0.15) 70%, rgba(0,114,229,0.4));
          -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
          -webkit-mask-composite: xor;
                  mask-composite: exclude;
          pointer-events: none;
        }

        .glow-card {
          position: relative;
          overflow: hidden;
          transition: all 0.35s cubic-bezier(0.2, 0.8, 0.2, 1);
        }
        .glow-card::after {
          content: "";
          position: absolute;
          inset: 0;
          background: radial-gradient(600px circle at var(--mx, 50%) var(--my, 0%), rgba(0,114,229,0.08), transparent 40%);
          opacity: 0;
          transition: opacity 0.4s;
          pointer-events: none;
        }
        .glow-card:hover {
          transform: translateY(-3px);
          border-color: rgba(0,114,229,0.28) !important;
        }
        .glow-card:hover::after {
          opacity: 1;
        }

        .ring-link {
          position: relative;
          padding-bottom: 2px;
        }
        .ring-link::after {
          content: "";
          position: absolute;
          left: 0; right: 0; bottom: 0;
          height: 1px;
          background: linear-gradient(to right, transparent, #75D8FC, transparent);
          transform: scaleX(0);
          transition: transform 0.3s;
        }
        .ring-link:hover::after { transform: scaleX(1); }

        .marquee {
          display: flex;
          width: max-content;
          animation: shimmerLine 28s linear infinite;
        }

        .nav-blur {
          background: linear-gradient(180deg, rgba(2,8,18,0.85) 0%, rgba(2,8,18,0.7) 100%);
          backdrop-filter: blur(20px) saturate(1.6);
          -webkit-backdrop-filter: blur(20px) saturate(1.6);
        }

        .noise {
          background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.45 0 0 0 0 0.55 0 0 0 0 0.85 0 0 0 0.06 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>");
          opacity: 0.5;
          mix-blend-mode: overlay;
        }
      `}</style>

      <div className="min-h-screen overflow-x-hidden" style={{ backgroundColor: BG_BASE, color: "#E2E8F0" }}>

        {/* Persistent atmospheric noise overlay */}
        <div className="fixed inset-0 noise pointer-events-none z-[1]" />

        {/* ════════════════════════════════════════════════════════════════════
            NAV
        ════════════════════════════════════════════════════════════════════ */}
        <header
          className="fixed top-0 inset-x-0 z-50 nav-blur border-b"
          style={{
            borderColor: "rgba(255,255,255,0.06)",
            animation: "fadeInDown 0.5s ease both",
          }}
        >
          <div className="max-w-7xl mx-auto px-5 sm:px-8 h-[68px] flex items-center justify-between gap-6">
            <a href="/" className="flex items-center gap-2.5 shrink-0 group">
              <div className="relative">
                <Image src="/logo-icon.svg" alt="scriviq" width={32} height={32} priority />
                <div
                  className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ boxShadow: "0 0 24px rgba(117,216,252,0.5)" }}
                />
              </div>
              <span className="font-semibold tracking-tight text-[15px] text-white">scriviq</span>
            </a>

            <nav className="hidden md:flex items-center gap-7">
              {[
                { label: "Features",      href: "#features"      },
                { label: "How it works",  href: "#how-it-works"  },
                { label: "Pricing",       href: "#pricing"       },
                { label: "Testimonials",  href: "#testimonials"  },
              ].map(({ label, href }) => (
                <a
                  key={label}
                  href={href}
                  className="ring-link text-[13.5px] text-slate-400 hover:text-white transition-colors duration-150"
                >
                  {label}
                </a>
              ))}
            </nav>

            <div className="flex items-center gap-2 shrink-0">
              <a
                href="/login"
                className="hidden sm:inline-block text-[13.5px] text-slate-400 hover:text-white transition-colors px-3 py-2"
              >
                Sign in
              </a>
              <a
                href="/signup"
                className="group inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-white text-sm font-medium transition-all duration-200 hover:opacity-95 hover:scale-[1.02] relative overflow-hidden"
                style={{
                  backgroundColor: BRAND,
                  boxShadow: "0 0 20px rgba(0,114,229,0.4), inset 0 1px 0 rgba(255,255,255,0.15)",
                }}
              >
                Get started free
                <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
              </a>
            </div>
          </div>
        </header>

        <main className="relative z-[2]">
          {/* ════════════════════════════════════════════════════════════════
              HERO
          ════════════════════════════════════════════════════════════════ */}
          <section className="relative pt-36 sm:pt-44 pb-0 px-5 sm:px-8 overflow-hidden">
            {/* Atmospheric grid */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(0,114,229,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,114,229,0.04) 1px, transparent 1px)",
                backgroundSize: "64px 64px",
                maskImage: "radial-gradient(ellipse 80% 60% at 50% 0%, #000 40%, transparent 80%)",
                WebkitMaskImage: "radial-gradient(ellipse 80% 60% at 50% 0%, #000 40%, transparent 80%)",
              }}
            />

            {/* Top atmospheric orb */}
            <div
              className="absolute -top-40 left-1/2 -translate-x-1/2 pointer-events-none"
              style={{
                width: "1100px",
                height: "650px",
                background: "radial-gradient(ellipse at 50% 0%, rgba(0,114,229,0.28) 0%, rgba(117,216,252,0.05) 35%, transparent 65%)",
                filter: "blur(40px)",
                animation: "orbPulse 10s ease-in-out infinite",
              }}
            />

            {/* Drifting accent orbs */}
            <div
              className="absolute top-32 left-[10%] pointer-events-none"
              style={{
                width: "420px",
                height: "420px",
                background: "radial-gradient(circle, rgba(117,216,252,0.12) 0%, transparent 65%)",
                filter: "blur(70px)",
                animation: "orbDrift 18s ease-in-out infinite",
              }}
            />
            <div
              className="absolute top-72 right-[8%] pointer-events-none"
              style={{
                width: "360px",
                height: "360px",
                background: "radial-gradient(circle, rgba(0,114,229,0.14) 0%, transparent 70%)",
                filter: "blur(80px)",
                animation: "orbDrift 22s ease-in-out infinite reverse",
              }}
            />

            <div className="relative max-w-6xl mx-auto text-center">
              {/* Announcement pill */}
              <div
                className="inline-flex items-center gap-2 px-1 pr-4 py-1 rounded-full mb-9"
                style={{
                  backgroundColor: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  animation: "fadeInUp 0.5s ease both",
                  animationDelay: "0.1s",
                }}
              >
                <span
                  className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider"
                  style={{
                    backgroundColor: "rgba(0,114,229,0.18)",
                    color: BRAND_LIGHT,
                    border: "1px solid rgba(0,114,229,0.3)",
                  }}
                >
                  NEW
                </span>
                <span className="text-xs sm:text-sm text-slate-300">
                  GPT-4o powered clause extraction is live
                </span>
                <ArrowRight size={12} className="text-slate-500" />
              </div>

              {/* Headline */}
              <h1
                className="font-bold text-white tracking-tight leading-[0.98] mb-6"
                style={{
                  fontSize: "clamp(2.8rem, 9vw, 5.75rem)",
                  letterSpacing: "-0.035em",
                  animation: "fadeInUp 0.6s ease both",
                  animationDelay: "0.2s",
                }}
              >
                Know every clause.
                <br />
                <span className="gradient-text">Miss nothing.</span>
              </h1>

              {/* Sub */}
              <p
                className="text-base sm:text-lg lg:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed mb-11"
                style={{
                  animation: "fadeInUp 0.6s ease both",
                  animationDelay: "0.35s",
                }}
              >
                scriviq automatically extracts, risk-scores, and tracks every payment milestone,
                termination clause, and renewal deadline buried in your agency SOWs —
                <span className="text-slate-200"> before they become expensive surprises.</span>
              </p>

              {/* CTAs */}
              <div
                className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-9"
                style={{
                  animation: "fadeInUp 0.6s ease both",
                  animationDelay: "0.5s",
                }}
              >
                <a
                  href="/signup"
                  className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-white font-semibold text-base transition-all duration-200 hover:scale-[1.02] relative overflow-hidden"
                  style={{
                    backgroundColor: BRAND,
                    boxShadow: "0 0 40px rgba(0,114,229,0.5), inset 0 1px 0 rgba(255,255,255,0.2)",
                  }}
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Start 14-day free trial
                    <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                  </span>
                  {/* Shimmer */}
                  <span
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{
                      background: "linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.25) 50%, transparent 70%)",
                      backgroundSize: "200% 100%",
                      animation: "shimmer 1.5s ease infinite",
                    }}
                  />
                </a>
                <a
                  href="#how-it-works"
                  className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-medium text-base transition-all duration-200"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "#CBD5E1",
                  }}
                >
                  <Play size={14} fill="currentColor" />
                  See it in action
                </a>
              </div>

              {/* Trust signals */}
              <div
                className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mb-20 text-xs"
                style={{
                  animation: "fadeInUp 0.6s ease both",
                  animationDelay: "0.65s",
                }}
              >
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {["from-pink-500 to-rose-600", "from-blue-500 to-cyan-500", "from-amber-400 to-orange-500", "from-emerald-500 to-teal-500"].map((g, i) => (
                      <div
                        key={i}
                        className={`w-7 h-7 rounded-full bg-gradient-to-br ${g} ring-2`}
                        style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.3)", borderColor: BG_BASE }}
                      />
                    ))}
                  </div>
                  <span className="text-slate-400">200+ agencies</span>
                </div>
                <div className="hidden sm:block w-px h-4" style={{ backgroundColor: "rgba(255,255,255,0.1)" }} />
                <div className="flex items-center gap-1.5">
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={13} className="fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="text-slate-400">4.9 average · 86 reviews</span>
                </div>
                <div className="hidden sm:block w-px h-4" style={{ backgroundColor: "rgba(255,255,255,0.1)" }} />
                <div className="flex items-center gap-1.5 text-slate-400">
                  <ShieldCheck size={13} style={{ color: BRAND_LIGHT }} />
                  SOC 2 in progress
                </div>
              </div>

              {/* ─── HERO PRODUCT MOCKUP ─── */}
              <div
                className="relative mx-auto"
                style={{
                  maxWidth: "1080px",
                  animation: "fadeInUp 0.8s ease both",
                  animationDelay: "0.8s",
                }}
              >
                {/* Glow underneath */}
                <div
                  className="absolute -inset-x-32 -top-12 -bottom-32 pointer-events-none"
                  style={{
                    background: "radial-gradient(ellipse at 50% 30%, rgba(0,114,229,0.18) 0%, transparent 60%)",
                    filter: "blur(40px)",
                  }}
                />

                {/* Window frame */}
                <div
                  className="relative rounded-t-2xl overflow-hidden"
                  style={{
                    backgroundColor: BG_RAISED,
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderBottom: "none",
                    boxShadow: "0 -10px 80px rgba(0,114,229,0.15), 0 0 0 1px rgba(0,114,229,0.06), inset 0 1px 0 rgba(255,255,255,0.05)",
                    animation: "float 8s ease-in-out infinite",
                    animationDelay: "1.2s",
                  }}
                >
                  {/* Window chrome */}
                  <div
                    className="border-b flex items-center gap-3 px-4 py-3"
                    style={{
                      backgroundColor: "rgba(4,14,30,0.8)",
                      borderColor: "rgba(255,255,255,0.06)",
                    }}
                  >
                    <div className="flex gap-1.5">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: "rgba(255,95,86,0.7)" }} />
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: "rgba(255,189,46,0.7)" }} />
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: "rgba(39,201,63,0.7)" }} />
                    </div>
                    <div
                      className="flex-1 min-w-0 mx-auto max-w-md flex items-center justify-center gap-2 rounded-md px-3 py-1 text-[11px] font-mono"
                      style={{
                        backgroundColor: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.06)",
                        color: "#94A3B8",
                      }}
                    >
                      <Lock size={10} style={{ color: "#10B981" }} />
                      app.scriviq.com/contracts/acme-2025
                    </div>
                    <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-mono" style={{ color: "#10B981" }}>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" style={{ animation: "blink 2s ease infinite" }} />
                      LIVE · 8 clauses
                    </div>
                  </div>

                  {/* App layout — Sidebar + Main */}
                  <div className="grid" style={{ gridTemplateColumns: "180px 1fr", minHeight: "440px" }}>
                    {/* SIDEBAR */}
                    <aside
                      className="border-r p-3 hidden sm:block"
                      style={{
                        backgroundColor: "rgba(2,8,18,0.7)",
                        borderColor: "rgba(255,255,255,0.05)",
                      }}
                    >
                      <div className="flex items-center gap-2 px-2 py-2 mb-4">
                        <Image src="/logo-icon.svg" alt="" width={20} height={20} />
                        <span className="text-[13px] font-semibold text-white">scriviq</span>
                      </div>

                      <p className="text-[9px] font-mono uppercase tracking-widest text-slate-600 px-2 mb-2">Workspace</p>
                      <div
                        className="flex items-center gap-2 px-2 py-1.5 rounded-md mb-4 text-[11px]"
                        style={{ backgroundColor: "rgba(255,255,255,0.03)" }}
                      >
                        <div
                          className="w-5 h-5 rounded text-[10px] font-bold flex items-center justify-center text-white"
                          style={{ background: `linear-gradient(135deg, ${BRAND} 0%, ${BRAND_LIGHT} 100%)` }}
                        >
                          M
                        </div>
                        <span className="text-slate-300 truncate">Momentum</span>
                      </div>

                      <p className="text-[9px] font-mono uppercase tracking-widest text-slate-600 px-2 mb-2">Menu</p>
                      <nav className="space-y-0.5 text-[12px]">
                        {[
                          { Icon: LayoutDashboard, label: "Dashboard", active: false },
                          { Icon: FileText,        label: "Contracts", active: true,  badge: "8" },
                          { Icon: Bell,            label: "Alerts",    active: false, alert: true },
                          { Icon: Users,           label: "Team",      active: false },
                          { Icon: BarChart3,       label: "Reports",   active: false },
                        ].map(({ Icon, label, active, badge, alert }) => (
                          <div
                            key={label}
                            className="flex items-center gap-2 px-2 py-1.5 rounded-md"
                            style={
                              active
                                ? {
                                    backgroundColor: "rgba(0,114,229,0.14)",
                                    color: BRAND_LIGHT,
                                    border: "1px solid rgba(0,114,229,0.22)",
                                  }
                                : { color: "#94A3B8" }
                            }
                          >
                            <Icon size={13} />
                            <span className="flex-1 truncate">{label}</span>
                            {badge && (
                              <span className="text-[9px] font-mono font-semibold" style={{ color: BRAND_LIGHT }}>
                                {badge}
                              </span>
                            )}
                            {alert && (
                              <span className="w-1.5 h-1.5 rounded-full bg-red-500" style={{ animation: "blink 2s ease infinite" }} />
                            )}
                          </div>
                        ))}
                      </nav>
                    </aside>

                    {/* MAIN */}
                    <div className="p-4 sm:p-5">
                      {/* Page header */}
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <p className="text-[10px] font-mono uppercase tracking-widest text-slate-600 mb-1">Contracts / Acme</p>
                          <h3 className="text-[15px] font-semibold text-white">Acme Corp · Web Redesign SOW 2025</h3>
                          <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-500">
                            <span>$48,200 total</span>
                            <span>·</span>
                            <span>14 pages</span>
                            <span>·</span>
                            <span style={{ color: "#10B981" }}>● Active</span>
                          </div>
                        </div>
                        <div
                          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-mono"
                          style={{
                            backgroundColor: "rgba(0,114,229,0.1)",
                            color: BRAND_LIGHT,
                            border: "1px solid rgba(0,114,229,0.2)",
                          }}
                        >
                          <Sparkles size={11} />
                          Extracted in 12s
                        </div>
                      </div>

                      {/* Filter chips */}
                      <div className="flex items-center gap-1.5 mb-4 flex-wrap">
                        {[
                          { label: "All",     count: 8, active: true  },
                          { label: "High",    count: 2, active: false, dot: "#EF4444" },
                          { label: "Medium",  count: 3, active: false, dot: "#F59E0B" },
                          { label: "Low",     count: 3, active: false, dot: "#10B981" },
                        ].map(({ label, count, active, dot }) => (
                          <span
                            key={label}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono"
                            style={
                              active
                                ? {
                                    backgroundColor: "rgba(0,114,229,0.15)",
                                    color: BRAND_LIGHT,
                                    border: "1px solid rgba(0,114,229,0.3)",
                                  }
                                : {
                                    backgroundColor: "rgba(255,255,255,0.03)",
                                    color: "#94A3B8",
                                    border: "1px solid rgba(255,255,255,0.06)",
                                  }
                            }
                          >
                            {dot && <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: dot }} />}
                            {label}
                            <span className="opacity-60">{count}</span>
                          </span>
                        ))}
                      </div>

                      {/* Clause cards */}
                      <div className="space-y-2">
                        {HERO_CLAUSES.slice(0, 3).map((c, i) => (
                          <div
                            key={i}
                            className="rounded-lg p-3 transition-all"
                            style={{
                              backgroundColor: "rgba(255,255,255,0.025)",
                              border: "1px solid rgba(255,255,255,0.06)",
                              animation: "extractIn 0.5s ease both",
                              animationDelay: `${1.4 + i * 0.18}s`,
                            }}
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="text-[9px] font-mono font-bold uppercase tracking-widest px-1.5 py-0.5 rounded" style={{ backgroundColor: "rgba(255,255,255,0.05)", color: "#94A3B8" }}>
                                  {c.type}
                                </span>
                                <span className="text-[12px] font-medium text-white truncate">{c.title}</span>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <RiskBadge level={c.risk} size="xs" />
                                {c.days !== null && (
                                  <span
                                    className="text-[10px] font-mono font-semibold"
                                    style={{ color: c.days <= 12 ? "#FCD34D" : c.days <= 31 ? "#FCA5A5" : "#94A3B8" }}
                                  >
                                    {c.days}d
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-3 mt-1.5 text-[10px] text-slate-500 font-mono">
                              <span>{c.amount}</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Footer stats */}
                      <div
                        className="mt-4 pt-3 border-t flex items-center justify-between text-[10px] font-mono"
                        style={{ borderColor: "rgba(255,255,255,0.05)" }}
                      >
                        <div className="flex items-center gap-3 text-slate-500">
                          <span>5 of 8 shown</span>
                          <span style={{ color: BRAND_LIGHT }}>+3 more</span>
                        </div>
                        <div className="flex items-center gap-1.5" style={{ color: "#10B981" }}>
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" style={{ animation: "blink 2s ease infinite" }} />
                          Synced
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Fade-out at bottom of mockup */}
                <div
                  className="absolute inset-x-0 bottom-0 h-32 pointer-events-none"
                  style={{
                    background: `linear-gradient(to bottom, transparent 0%, ${BG_BASE} 100%)`,
                  }}
                />
              </div>
            </div>
          </section>

          {/* ════════════════════════════════════════════════════════════════
              TRUST LOGOS — Marquee
          ════════════════════════════════════════════════════════════════ */}
          <section className="py-14 px-5 sm:px-8 relative overflow-hidden border-y" style={{ borderColor: "rgba(255,255,255,0.05)", backgroundColor: BG_SURFACE }}>
            <div className="max-w-6xl mx-auto">
              <p className="text-center text-[11px] font-mono uppercase tracking-[0.22em] text-slate-600 mb-7">
                Trusted by 200+ digital agencies & consultancies worldwide
              </p>

              <div className="relative" style={{ maskImage: "linear-gradient(to right, transparent, #000 15%, #000 85%, transparent)", WebkitMaskImage: "linear-gradient(to right, transparent, #000 15%, #000 85%, transparent)" }}>
                <div className="marquee gap-16">
                  {[...TRUST_LOGOS, ...TRUST_LOGOS, ...TRUST_LOGOS].map((logo, i) => (
                    <span
                      key={i}
                      className="text-2xl font-bold tracking-[0.25em] shrink-0"
                      style={{ color: "rgba(148,163,184,0.4)", fontFamily: "Georgia, serif" }}
                    >
                      {logo}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* ════════════════════════════════════════════════════════════════
              STATS — Floating metric cards
          ════════════════════════════════════════════════════════════════ */}
          <section className="py-24 px-5 sm:px-8 relative" style={{ backgroundColor: BG_BASE }}>
            <div className="max-w-6xl mx-auto">
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { value: "13",     label: "Clause types extracted",    sub: "PAYMENT · IP · TERMINATION · 10 more" },
                  { value: "<15s",   label: "Average extraction time",   sub: "GPT-4o · structured JSON output"      },
                  { value: "99.4%",  label: "Clause detection accuracy", sub: "Validated on 8,400+ contracts"        },
                  { value: "$49",   label: "/ month per team",          sub: "Flat rate · unlimited uploads"        },
                ].map(({ value, label, sub }, i) => (
                  <div
                    key={label}
                    className="relative rounded-2xl p-6 glow-card"
                    style={{
                      backgroundColor: BG_SURFACE,
                      border: "1px solid rgba(255,255,255,0.06)",
                      animation: "fadeInUp 0.5s ease both",
                      animationDelay: `${i * 0.08}s`,
                    }}
                  >
                    {/* Top-right glow */}
                    <div
                      className="absolute top-0 right-0 w-24 h-24 pointer-events-none rounded-tr-2xl"
                      style={{
                        background: "radial-gradient(circle at 100% 0%, rgba(0,114,229,0.12) 0%, transparent 70%)",
                      }}
                    />
                    <p
                      className="text-4xl sm:text-5xl font-bold tracking-tight font-mono mb-2"
                      style={{
                        background: `linear-gradient(135deg, ${BRAND_LIGHT} 0%, ${BRAND} 100%)`,
                        WebkitBackgroundClip: "text",
                        backgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                      }}
                    >
                      {value}
                    </p>
                    <p className="text-[13px] font-semibold text-slate-200 leading-snug">{label}</p>
                    <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">{sub}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ════════════════════════════════════════════════════════════════
              PROBLEM — Pain points
          ════════════════════════════════════════════════════════════════ */}
          <section className="py-32 px-5 sm:px-8 relative overflow-hidden" style={{ backgroundColor: BG_SURFACE }}>
            {/* Top divider glow */}
            <div
              className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-px"
              style={{ background: `linear-gradient(to right, transparent, rgba(0,114,229,0.4), transparent)` }}
            />

            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-20 max-w-2xl mx-auto">
                <Eyebrow>The Problem</Eyebrow>
                <h2
                  className="font-bold text-white tracking-tight leading-[1.05] mb-5"
                  style={{ fontSize: "clamp(2rem, 5vw, 3.25rem)", letterSpacing: "-0.025em" }}
                >
                  Contracts lose agencies money —
                  <br />
                  <span className="text-slate-600">silently.</span>
                </h2>
                <p className="text-base sm:text-lg text-slate-400 leading-relaxed">
                  The risk isn&apos;t the contract you read carefully. It&apos;s the one uploaded
                  to Dropbox two years ago that just auto-renewed.
                </p>
              </div>

              <div className="grid sm:grid-cols-3 gap-5">
                {PAIN_POINTS.map(({ Icon, label, title, desc, stat, statLabel }, i) => (
                  <div
                    key={title}
                    className="glow-card rounded-2xl p-7 cursor-default relative"
                    style={{
                      backgroundColor: BG_RAISED,
                      border: "1px solid rgba(255,255,255,0.06)",
                      animation: "fadeInUp 0.5s ease both",
                      animationDelay: `${i * 0.12}s`,
                    }}
                  >
                    {/* Stat in top right */}
                    <div className="absolute top-6 right-6 text-right">
                      <p className="text-[10px] font-mono uppercase tracking-widest text-slate-600">{statLabel}</p>
                      <p className="text-xl font-bold font-mono" style={{ color: BRAND_LIGHT }}>{stat}</p>
                    </div>

                    {/* Icon */}
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center mb-6 relative"
                      style={{
                        backgroundColor: "rgba(0,114,229,0.08)",
                        border: "1px solid rgba(0,114,229,0.18)",
                      }}
                    >
                      <Icon size={20} style={{ color: BRAND_LIGHT }} />
                      <div
                        className="absolute inset-0 rounded-xl pointer-events-none"
                        style={{ boxShadow: "inset 0 0 20px rgba(0,114,229,0.15)" }}
                      />
                    </div>

                    {/* Label */}
                    <p className="text-[10px] font-mono uppercase tracking-widest text-slate-600 mb-2">
                      {label}
                    </p>
                    <h3 className="text-[17px] font-semibold text-white mb-3 leading-snug">{title}</h3>
                    <p className="text-[14px] text-slate-400 leading-relaxed">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ════════════════════════════════════════════════════════════════
              HOW IT WORKS
          ════════════════════════════════════════════════════════════════ */}
          <section id="how-it-works" className="py-32 px-5 sm:px-8 relative" style={{ backgroundColor: BG_BASE }}>
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-20 max-w-2xl mx-auto">
                <Eyebrow>The Process</Eyebrow>
                <h2
                  className="font-bold text-white tracking-tight leading-[1.05] mb-5"
                  style={{ fontSize: "clamp(2rem, 5vw, 3.25rem)", letterSpacing: "-0.025em" }}
                >
                  From upload to insight
                  <br />
                  <span className="gradient-text">in 15 seconds.</span>
                </h2>
                <p className="text-base sm:text-lg text-slate-400 leading-relaxed">
                  Three steps. Zero configuration. No contract left unread.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-5 relative">
                {/* Animated connector line */}
                <div
                  className="hidden md:block absolute top-12 left-[16%] right-[16%] h-px origin-left z-0"
                  style={{
                    background: `linear-gradient(to right, ${BRAND}, ${BRAND_LIGHT}, ${BRAND})`,
                    animation: "lineGrow 1.4s ease both 0.6s",
                    opacity: 0.4,
                  }}
                />

                {STEPS.map(({ n, Icon, title, desc, chip, sub }, i) => (
                  <div
                    key={n}
                    className="glow-card relative rounded-2xl p-7 cursor-default"
                    style={{
                      backgroundColor: BG_SURFACE,
                      border: "1px solid rgba(255,255,255,0.06)",
                      animation: "fadeInUp 0.6s ease both",
                      animationDelay: `${0.2 + i * 0.18}s`,
                    }}
                  >
                    {/* Number watermark */}
                    <div
                      className="absolute top-5 right-6 text-7xl font-bold font-mono pointer-events-none"
                      style={{ color: "rgba(0,114,229,0.07)", letterSpacing: "-0.05em" }}
                    >
                      {n}
                    </div>

                    {/* Icon */}
                    <div
                      className="relative w-14 h-14 rounded-2xl flex items-center justify-center mb-7 z-10"
                      style={{
                        background: `linear-gradient(135deg, rgba(0,114,229,0.15), rgba(117,216,252,0.05))`,
                        border: "1px solid rgba(0,114,229,0.25)",
                        boxShadow: "0 8px 24px rgba(0,114,229,0.15)",
                      }}
                    >
                      <Icon size={22} style={{ color: BRAND_LIGHT }} />
                    </div>

                    {/* Step number badge */}
                    <p
                      className="text-[10px] font-mono font-bold uppercase tracking-widest mb-2"
                      style={{ color: BRAND }}
                    >
                      Step {n}
                    </p>

                    <h3 className="text-[18px] font-semibold text-white mb-3 leading-snug">{title}</h3>
                    <p className="text-[14px] text-slate-400 leading-relaxed mb-5">{desc}</p>

                    <div className="flex flex-wrap gap-2">
                      <span
                        className="inline-flex items-center gap-1.5 text-[10px] font-mono px-2.5 py-1 rounded-full"
                        style={{
                          color: BRAND_LIGHT,
                          backgroundColor: "rgba(0,114,229,0.08)",
                          border: "1px solid rgba(0,114,229,0.2)",
                        }}
                      >
                        <CircleDot size={9} />
                        {chip}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-600 font-mono mt-3 pt-3 border-t" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                      {sub}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ════════════════════════════════════════════════════════════════
              FEATURES — Bento Grid
          ════════════════════════════════════════════════════════════════ */}
          <section id="features" className="py-32 px-5 sm:px-8 relative" style={{ backgroundColor: BG_SURFACE }}>
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-20 max-w-2xl mx-auto">
                <Eyebrow>Capabilities</Eyebrow>
                <h2
                  className="font-bold text-white tracking-tight leading-[1.05] mb-5"
                  style={{ fontSize: "clamp(2rem, 5vw, 3.25rem)", letterSpacing: "-0.025em" }}
                >
                  Built for agencies
                  <br />
                  that <span className="gradient-text">run on contracts.</span>
                </h2>
                <p className="text-base sm:text-lg text-slate-400 leading-relaxed">
                  Every feature exists to eliminate one thing: a clause you should have caught.
                </p>
              </div>

              {/* Bento layout */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
                {FEATURES_BENTO.map(({ Icon, eyebrow, title, desc, span, visual }, i) => (
                  <div
                    key={title}
                    className={`glow-card rounded-2xl p-7 sm:p-8 cursor-default relative overflow-hidden ${
                      span === 2 ? "md:col-span-2" : "md:col-span-1"
                    }`}
                    style={{
                      backgroundColor: BG_RAISED,
                      border: "1px solid rgba(255,255,255,0.06)",
                      minHeight: span === 2 ? "320px" : "280px",
                      animation: "fadeInUp 0.5s ease both",
                      animationDelay: `${i * 0.08}s`,
                    }}
                  >
                    {/* Top-right accent */}
                    <div
                      className="absolute top-0 right-0 w-48 h-48 pointer-events-none"
                      style={{
                        background: "radial-gradient(circle at 100% 0%, rgba(0,114,229,0.08) 0%, transparent 60%)",
                      }}
                    />

                    {/* Header */}
                    <div className="flex items-center gap-3 mb-5">
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                        style={{
                          background: "linear-gradient(135deg, rgba(0,114,229,0.15), rgba(117,216,252,0.05))",
                          border: "1px solid rgba(0,114,229,0.22)",
                        }}
                      >
                        <Icon size={19} style={{ color: BRAND_LIGHT }} />
                      </div>
                      <p className="text-[10px] font-mono uppercase tracking-widest text-slate-500">{eyebrow}</p>
                    </div>

                    <h3 className="text-[20px] sm:text-[22px] font-semibold text-white leading-tight mb-3 whitespace-pre-line tracking-tight">
                      {title}
                    </h3>
                    <p className="text-[14px] text-slate-400 leading-relaxed mb-6 max-w-md">{desc}</p>

                    {/* Visual element per feature */}
                    {visual === "clause-list" && (
                      <div className="flex flex-wrap gap-1.5 mt-auto">
                        {["PAYMENT", "RENEWAL", "IP_RIGHTS", "TERMINATION", "LIABILITY", "NOTICE", "JURISDICTION", "FORCE_MAJEURE", "CONFIDENTIALITY", "INDEMNITY", "WARRANTY", "ASSIGNMENT", "+1 MORE"].map((c, k) => (
                          <span
                            key={c}
                            className="text-[10px] font-mono px-2 py-1 rounded"
                            style={{
                              backgroundColor: k === 12 ? "rgba(0,114,229,0.12)" : "rgba(255,255,255,0.04)",
                              color: k === 12 ? BRAND_LIGHT : "#94A3B8",
                              border: `1px solid ${k === 12 ? "rgba(0,114,229,0.25)" : "rgba(255,255,255,0.06)"}`,
                            }}
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    )}

                    {visual === "risk-stack" && (
                      <div className="space-y-2 mt-auto">
                        {[
                          { lvl: "high"   as const, w: "92%", label: "Auto-renewal · 30d notice"   },
                          { lvl: "medium" as const, w: "65%", label: "Payment · 30d net"           },
                          { lvl: "low"    as const, w: "30%", label: "Confidentiality · standard"  },
                        ].map(({ lvl, w, label }) => (
                          <div key={label}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[10px] text-slate-400 truncate">{label}</span>
                              <RiskBadge level={lvl} size="xs" />
                            </div>
                            <div className="h-1 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.05)" }}>
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: w,
                                  backgroundColor: lvl === "high" ? "#EF4444" : lvl === "medium" ? "#F59E0B" : "#10B981",
                                  boxShadow: `0 0 8px ${lvl === "high" ? "rgba(239,68,68,0.4)" : lvl === "medium" ? "rgba(245,158,11,0.4)" : "rgba(16,185,129,0.4)"}`,
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {visual === "alert-timeline" && (
                      <div className="space-y-2 mt-auto">
                        {[
                          { d: "7d",  label: "First reminder",  color: "#10B981" },
                          { d: "1d",  label: "Final warning",   color: "#F59E0B" },
                          { d: "0d",  label: "Overdue alert",   color: "#EF4444" },
                        ].map(({ d, label, color }) => (
                          <div key={d} className="flex items-center gap-2.5">
                            <span
                              className="w-9 h-7 rounded-md flex items-center justify-center text-[10px] font-mono font-bold"
                              style={{ backgroundColor: `${color}20`, color, border: `1px solid ${color}40` }}
                            >
                              {d}
                            </span>
                            <span className="text-[11px] text-slate-400">{label}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {visual === "dashboard" && (
                      <div
                        className="rounded-xl p-4 mt-auto relative overflow-hidden"
                        style={{
                          backgroundColor: "rgba(2,8,18,0.6)",
                          border: "1px solid rgba(255,255,255,0.05)",
                        }}
                      >
                        <div className="grid grid-cols-3 gap-3 mb-3">
                          {[
                            { v: "$284k", l: "Active" },
                            { v: "47",    l: "Clauses" },
                            { v: "8",     l: "This week" },
                          ].map(({ v, l }) => (
                            <div key={l}>
                              <p className="text-[16px] font-bold font-mono" style={{ color: BRAND_LIGHT }}>{v}</p>
                              <p className="text-[9px] uppercase tracking-wider text-slate-600 mt-0.5">{l}</p>
                            </div>
                          ))}
                        </div>
                        {/* Mini bar chart */}
                        <div className="flex items-end gap-1 h-12">
                          {[40, 65, 50, 80, 45, 70, 90, 60, 75, 85, 55, 95].map((h, k) => (
                            <div
                              key={k}
                              className="flex-1 rounded-sm"
                              style={{
                                height: `${h}%`,
                                background: `linear-gradient(180deg, ${BRAND_LIGHT} 0%, ${BRAND} 100%)`,
                                opacity: 0.3 + (h / 100) * 0.7,
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {visual === "team" && (
                      <div className="mt-auto space-y-2">
                        {[
                          { i: "SK", name: "Sarah Kim",   role: "Owner", bg: "from-pink-500 to-rose-600"   },
                          { i: "MT", name: "Marcus Tate", role: "Admin", bg: "from-blue-500 to-cyan-500"   },
                          { i: "ER", name: "Elena R.",    role: "Member",bg: "from-amber-400 to-orange-500" },
                        ].map(({ i, name, role, bg }) => (
                          <div
                            key={i}
                            className="flex items-center gap-2.5 p-2 rounded-lg"
                            style={{ backgroundColor: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.04)" }}
                          >
                            <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${bg} text-[10px] font-bold text-white flex items-center justify-center`}>
                              {i}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[11px] font-medium text-slate-200 truncate">{name}</p>
                            </div>
                            <span className="text-[9px] font-mono uppercase tracking-wider text-slate-500">{role}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {visual === "audit" && (
                      <div
                        className="rounded-xl p-3.5 mt-auto"
                        style={{
                          backgroundColor: "rgba(2,8,18,0.6)",
                          border: "1px solid rgba(255,255,255,0.05)",
                          fontFamily: "monospace",
                        }}
                      >
                        <p className="text-[10px] text-slate-600 mb-2">§ 4.1 — verbatim source</p>
                        <p className="text-[10.5px] text-slate-400 leading-relaxed">
                          &ldquo;Payment of <span style={{ color: BRAND_LIGHT, backgroundColor: "rgba(0,114,229,0.12)", padding: "0 2px", borderRadius: 2 }}>USD 24,500</span> shall be due within <span style={{ color: BRAND_LIGHT, backgroundColor: "rgba(0,114,229,0.12)", padding: "0 2px", borderRadius: 2 }}>30 days</span>...&rdquo;
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ════════════════════════════════════════════════════════════════
              EXTRACTION DEMO
          ════════════════════════════════════════════════════════════════ */}
          <section className="py-32 px-5 sm:px-8 relative overflow-hidden" style={{ backgroundColor: BG_BASE }}>
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
              style={{
                width: "1000px",
                height: "600px",
                background: "radial-gradient(ellipse at center, rgba(0,114,229,0.1) 0%, transparent 60%)",
                filter: "blur(60px)",
              }}
            />

            <div className="relative max-w-6xl mx-auto">
              <div className="text-center mb-16 max-w-2xl mx-auto">
                <Eyebrow>Live Demo</Eyebrow>
                <h2
                  className="font-bold text-white tracking-tight leading-[1.05] mb-5"
                  style={{ fontSize: "clamp(2rem, 5vw, 3.25rem)", letterSpacing: "-0.025em" }}
                >
                  Raw legalese,
                  <br />
                  meet <span className="gradient-text">structured insight.</span>
                </h2>
                <p className="text-base sm:text-lg text-slate-400 leading-relaxed">
                  Every clause extracted, categorised, and risk-scored in seconds.
                  No copy-paste. No spreadsheets.
                </p>
              </div>

              <div
                className="rounded-2xl gradient-border overflow-hidden"
                style={{
                  backgroundColor: BG_RAISED,
                  boxShadow: "0 20px 80px rgba(0,114,229,0.12)",
                }}
              >
                {/* Tab bar */}
                <div
                  className="flex items-center justify-between border-b px-5 sm:px-6 pt-4 pb-0"
                  style={{ backgroundColor: "rgba(2,8,18,0.6)", borderColor: "rgba(255,255,255,0.06)" }}
                >
                  <div className="flex items-end gap-1">
                    <div
                      className="px-4 py-2.5 text-[12px] font-medium border-b-2 flex items-center gap-2"
                      style={{ borderColor: BRAND, color: BRAND_LIGHT, backgroundColor: "rgba(0,114,229,0.05)" }}
                    >
                      <FileText size={12} />
                      acme-corp-sow-2025.pdf
                    </div>
                    <div className="px-4 py-2.5 text-[12px] text-slate-500 border-b-2 border-transparent flex items-center gap-2">
                      <FileText size={12} />
                      momentum-retainer.pdf
                    </div>
                  </div>
                  <span className="hidden sm:flex items-center gap-1.5 text-[10px] font-mono pb-2.5" style={{ color: BRAND_LIGHT }}>
                    <Zap size={10} />
                    Extracted in 12s
                  </span>
                </div>

                <div className="grid md:grid-cols-2" style={{ backgroundColor: "rgba(2,8,18,0.5)" }}>
                  {/* LEFT — Raw */}
                  <div className="p-6 sm:p-7 md:border-r" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                    <div className="flex items-center justify-between mb-5">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                        <p className="text-[10px] uppercase tracking-widest font-semibold text-slate-500">
                          Raw Contract Text
                        </p>
                      </div>
                      <span className="text-[10px] font-mono text-slate-600">PDF · 14 pages</span>
                    </div>
                    <div className="space-y-3 font-mono text-[11px] leading-relaxed">
                      {EXTRACTION_DEMO.map((c, i) => (
                        <div
                          key={i}
                          className={`relative pl-3.5 py-3 pr-3 rounded-r-lg border-l-2 ${
                            c.highlight === "red"
                              ? "border-red-500/70 bg-red-950/[0.15]"
                              : c.highlight === "amber"
                              ? "border-amber-500/70 bg-amber-950/[0.15]"
                              : "border-slate-700 bg-slate-900/20"
                          }`}
                        >
                          <p className="text-slate-400 line-clamp-4">{c.raw}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* RIGHT — Extracted */}
                  <div className="p-6 sm:p-7">
                    <div className="flex items-center justify-between mb-5">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: BRAND_LIGHT, boxShadow: `0 0 6px ${BRAND_LIGHT}` }}
                        />
                        <p className="text-[10px] uppercase tracking-widest font-semibold" style={{ color: BRAND_LIGHT }}>
                          Extracted by scriviq
                        </p>
                      </div>
                      <span className="text-[10px] font-mono text-slate-600">Structured JSON</span>
                    </div>
                    <div className="space-y-3">
                      {EXTRACTION_DEMO.map((c, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-3 p-3.5 rounded-xl"
                          style={{
                            backgroundColor: "rgba(255,255,255,0.025)",
                            border: "1px solid rgba(255,255,255,0.06)",
                            animation: "extractIn 0.5s ease both",
                            animationDelay: `${0.1 + i * 0.2}s`,
                          }}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                              <span
                                className="text-[9px] font-mono uppercase tracking-widest px-1.5 py-0.5 rounded"
                                style={{
                                  color: BRAND_LIGHT,
                                  backgroundColor: "rgba(0,114,229,0.08)",
                                  border: "1px solid rgba(0,114,229,0.15)",
                                }}
                              >
                                {c.type.replace(/_/g, " ")}
                              </span>
                              <RiskBadge level={c.risk} />
                            </div>
                            <p className="text-sm font-semibold text-slate-100 leading-snug">{c.title}</p>
                            <p className="text-[11px] text-slate-500 font-mono mt-0.5">{c.detail}</p>
                            <p className="text-[11px] text-amber-500/90 mt-1.5 flex items-center gap-1.5">
                              <AlertTriangle size={10} className="shrink-0" />
                              {c.reason}
                            </p>
                          </div>
                          {c.daysLeft !== null && (
                            <div className="shrink-0 text-right mt-0.5">
                              <span
                                className="text-[16px] font-mono font-bold"
                                style={{ color: c.daysLeft <= 7 ? "#FCD34D" : c.daysLeft <= 31 ? "#FCA5A5" : "#94A3B8" }}
                              >
                                {c.daysLeft}d
                              </span>
                              <p className="text-[9px] text-slate-600 mt-0.5 uppercase tracking-wider">left</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ════════════════════════════════════════════════════════════════
              TESTIMONIALS — 3-card grid
          ════════════════════════════════════════════════════════════════ */}
          <section id="testimonials" className="py-32 px-5 sm:px-8 relative" style={{ backgroundColor: BG_SURFACE }}>
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16 max-w-2xl mx-auto">
                <Eyebrow>Loved by Operators</Eyebrow>
                <h2
                  className="font-bold text-white tracking-tight leading-[1.05] mb-5"
                  style={{ fontSize: "clamp(2rem, 5vw, 3.25rem)", letterSpacing: "-0.025em" }}
                >
                  The clause we caught
                  <br />
                  paid for the year.
                </h2>
              </div>

              <div className="grid md:grid-cols-3 gap-5">
                {TESTIMONIALS.map(({ quote, name, role, company, initials }, i) => (
                  <figure
                    key={name}
                    className="glow-card rounded-2xl p-7 cursor-default flex flex-col"
                    style={{
                      backgroundColor: BG_RAISED,
                      border: "1px solid rgba(255,255,255,0.06)",
                      animation: "fadeInUp 0.5s ease both",
                      animationDelay: `${i * 0.12}s`,
                    }}
                  >
                    {/* Stars */}
                    <div className="flex gap-0.5 mb-5">
                      {[...Array(5)].map((_, k) => (
                        <Star key={k} size={13} className="fill-amber-400 text-amber-400" />
                      ))}
                    </div>

                    {/* Quote mark watermark */}
                    <span
                      className="font-serif font-bold absolute top-2 right-6 select-none pointer-events-none"
                      style={{ fontSize: "100px", lineHeight: 1, color: "rgba(0,114,229,0.06)" }}
                    >
                      &ldquo;
                    </span>

                    <blockquote className="text-[14.5px] text-slate-200 leading-relaxed flex-1 mb-6">
                      &ldquo;{quote}&rdquo;
                    </blockquote>

                    <figcaption className="flex items-center gap-3 pt-5 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                        style={{
                          background: `linear-gradient(135deg, ${BRAND} 0%, ${BRAND_LIGHT} 100%)`,
                          boxShadow: "0 4px 12px rgba(0,114,229,0.3)",
                        }}
                      >
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[13px] font-semibold text-slate-100 truncate">{name}</p>
                        <p className="text-[11px] text-slate-500 truncate">
                          {role} · {company}
                        </p>
                      </div>
                    </figcaption>
                  </figure>
                ))}
              </div>
            </div>
          </section>

          {/* ════════════════════════════════════════════════════════════════
              PRICING
          ════════════════════════════════════════════════════════════════ */}
          <section id="pricing" className="py-32 px-5 sm:px-8 relative overflow-hidden" style={{ backgroundColor: BG_BASE }}>
            {/* Ambient glow */}
            <div
              className="absolute top-1/3 left-1/2 -translate-x-1/2 pointer-events-none"
              style={{
                width: "900px",
                height: "500px",
                background: "radial-gradient(ellipse at center, rgba(0,114,229,0.13) 0%, transparent 60%)",
                filter: "blur(60px)",
                animation: "orbPulse 8s ease-in-out infinite",
              }}
            />

            <div className="relative max-w-3xl mx-auto">
              <div className="text-center mb-16">
                <Eyebrow>Pricing</Eyebrow>
                <h2
                  className="font-bold text-white tracking-tight leading-[1.05] mb-5"
                  style={{ fontSize: "clamp(2rem, 5vw, 3.25rem)", letterSpacing: "-0.025em" }}
                >
                  One plan.
                  <br />
                  <span className="gradient-text">No surprises.</span>
                </h2>
                <p className="text-base sm:text-lg text-slate-400 leading-relaxed max-w-lg mx-auto">
                  Everything your team needs to stop missing contract deadlines.
                  Cancel any time.
                </p>
              </div>

              {/* Pricing card with gradient border */}
              <div
                className="relative p-px rounded-3xl"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(0,114,229,0.6) 0%, rgba(117,216,252,0.2) 30%, rgba(255,255,255,0.05) 50%, rgba(117,216,252,0.2) 70%, rgba(0,114,229,0.5) 100%)",
                  boxShadow: "0 30px 100px rgba(0,114,229,0.2), 0 0 0 1px rgba(0,114,229,0.06)",
                }}
              >
                <div
                  className="rounded-3xl overflow-hidden relative"
                  style={{ backgroundColor: BG_RAISED }}
                >
                  {/* Top-right accent glow */}
                  <div
                    className="absolute top-0 right-0 pointer-events-none"
                    style={{
                      width: "400px",
                      height: "300px",
                      background: "radial-gradient(ellipse at 100% 0%, rgba(0,114,229,0.18) 0%, transparent 65%)",
                    }}
                  />

                  {/* Plan header */}
                  <div className="px-8 sm:px-10 pt-9 pb-8 border-b relative" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                    {/* Trial badge */}
                    <div
                      className="absolute top-9 right-8 sm:right-10 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-mono font-semibold"
                      style={{
                        backgroundColor: "rgba(0,114,229,0.15)",
                        border: "1px solid rgba(0,114,229,0.3)",
                        color: BRAND_LIGHT,
                      }}
                    >
                      <Zap size={11} />
                      14-DAY TRIAL
                    </div>

                    <p className="text-[11px] font-mono uppercase tracking-[0.22em] mb-3" style={{ color: BRAND }}>
                      Pro Team
                    </p>

                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="text-7xl font-bold text-white tracking-tight" style={{ letterSpacing: "-0.04em" }}>
                        $49
                      </span>
                      <span className="text-slate-400 text-base">/ month per team</span>
                    </div>
                    <p className="text-[14px] text-slate-500 mb-7">
                      Flat rate · unlimited members · unlimited contracts
                    </p>

                    <a
                      href="/signup"
                      className="group inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-white font-semibold text-base transition-all duration-200 hover:scale-[1.02] relative overflow-hidden"
                      style={{
                        backgroundColor: BRAND,
                        boxShadow: "0 0 30px rgba(0,114,229,0.5), inset 0 1px 0 rgba(255,255,255,0.2)",
                      }}
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        Start free trial
                        <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                      </span>
                    </a>
                    <p className="text-[12px] text-slate-600 mt-4">No credit card required to start</p>
                  </div>

                  {/* Feature list */}
                  <div className="px-8 sm:px-10 py-8 grid sm:grid-cols-2 gap-x-6 gap-y-3.5">
                    {PLAN_INCLUDES.map((item) => (
                      <div key={item} className="flex items-center gap-2.5 text-[13.5px] text-slate-300">
                        <span
                          className="shrink-0 w-4 h-4 rounded-full flex items-center justify-center"
                          style={{
                            background: "linear-gradient(135deg, rgba(0,114,229,0.25), rgba(117,216,252,0.15))",
                            color: BRAND_LIGHT,
                          }}
                        >
                          <Check size={10} strokeWidth={3} />
                        </span>
                        {item}
                      </div>
                    ))}
                  </div>

                  {/* Enterprise note */}
                  <div
                    className="mx-8 sm:mx-10 mb-9 p-5 rounded-xl flex items-start gap-3.5"
                    style={{
                      backgroundColor: "rgba(0,114,229,0.05)",
                      border: "1px solid rgba(0,114,229,0.12)",
                    }}
                  >
                    <ShieldCheck size={20} className="shrink-0 mt-0.5" style={{ color: BRAND_LIGHT }} />
                    <div>
                      <p className="text-[13.5px] font-semibold text-slate-100 mb-1">Enterprise plans available</p>
                      <p className="text-[12.5px] text-slate-400 leading-relaxed">
                        SSO/SAML, white-label, audit logs, webhook delivery, read-only API,
                        and custom clause types.{" "}
                        <a
                          href="mailto:hello@scriviq.com"
                          className="ring-link"
                          style={{ color: BRAND_LIGHT }}
                        >
                          Talk to us &rarr;
                        </a>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ════════════════════════════════════════════════════════════════
              FINAL CTA
          ════════════════════════════════════════════════════════════════ */}
          <section className="py-40 px-5 sm:px-8 relative overflow-hidden" style={{ backgroundColor: BG_SURFACE }}>
            {/* Grid pattern */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(0,114,229,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,114,229,0.05) 1px, transparent 1px)",
                backgroundSize: "64px 64px",
                maskImage: "radial-gradient(ellipse 60% 60% at 50% 50%, #000 30%, transparent 75%)",
                WebkitMaskImage: "radial-gradient(ellipse 60% 60% at 50% 50%, #000 30%, transparent 75%)",
              }}
            />

            {/* Central orb */}
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
              style={{
                width: "1000px",
                height: "500px",
                background: "radial-gradient(ellipse at center, rgba(0,114,229,0.18) 0%, transparent 60%)",
                filter: "blur(60px)",
                animation: "orbPulse 8s ease-in-out infinite",
              }}
            />

            {/* Decorative rotating ring */}
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none rounded-full"
              style={{
                width: "780px",
                height: "780px",
                border: "1px dashed rgba(0,114,229,0.15)",
                animation: "slowSpin 60s linear infinite",
              }}
            />
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none rounded-full"
              style={{
                width: "560px",
                height: "560px",
                border: "1px dashed rgba(0,114,229,0.1)",
                animation: "slowSpin 80s linear infinite reverse",
              }}
            />

            <div className="relative max-w-3xl mx-auto text-center">
              <div
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[12px] mb-9"
                style={{
                  borderColor: "rgba(0,114,229,0.3)",
                  backgroundColor: "rgba(0,114,229,0.08)",
                  border: "1px solid rgba(0,114,229,0.3)",
                  color: BRAND_LIGHT,
                  backdropFilter: "blur(8px)",
                }}
              >
                <Zap size={12} style={{ color: BRAND }} />
                Ready in under 60 seconds
              </div>

              <h2
                className="font-bold text-white tracking-tight leading-[0.98] mb-7"
                style={{ fontSize: "clamp(2.4rem, 8vw, 4.5rem)", letterSpacing: "-0.035em" }}
              >
                Stop guessing.
                <br />
                <span className="gradient-text">Start knowing.</span>
              </h2>

              <p className="text-base sm:text-lg text-slate-400 mb-12 max-w-xl mx-auto leading-relaxed">
                Upload your first contract in under a minute. scriviq extracts every
                clause, flags every risk, and tracks every deadline — so you don&apos;t
                have to.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <a
                  href="/signup"
                  className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-9 py-4 rounded-xl text-white font-bold text-base transition-all duration-200 hover:scale-[1.02] relative overflow-hidden"
                  style={{
                    backgroundColor: BRAND,
                    boxShadow: "0 0 60px rgba(0,114,229,0.55), inset 0 1px 0 rgba(255,255,255,0.2)",
                  }}
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Start free — no card needed
                    <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                  </span>
                </a>
                <a
                  href="mailto:hello@scriviq.com"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl font-medium text-base transition-all duration-200"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "#CBD5E1",
                  }}
                >
                  Talk to sales
                </a>
              </div>

              <p className="text-[12px] text-slate-600 mt-6 font-mono">
                $49/mo per team after trial · cancel any time · no contracts (we get the irony)
              </p>
            </div>
          </section>
        </main>

        {/* ════════════════════════════════════════════════════════════════
            FOOTER
        ════════════════════════════════════════════════════════════════ */}
        <footer
          className="relative px-5 sm:px-8 pt-20 pb-10 z-[2] border-t"
          style={{
            backgroundColor: BG_BASE,
            borderColor: "rgba(255,255,255,0.05)",
          }}
        >
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-12 mb-14">
              {/* Brand */}
              <div className="max-w-sm">
                <div className="flex items-center gap-2.5 mb-5">
                  <Image src="/logo-icon.svg" alt="scriviq" width={28} height={28} />
                  <span className="text-white font-semibold tracking-tight text-[15px]">scriviq</span>
                </div>
                <p className="text-[13.5px] text-slate-500 leading-relaxed mb-5">
                  Intelligence embedded in every clause. Enterprise contract intelligence
                  for digital agencies and IT consultancies.
                </p>
                <div className="flex items-center gap-3">
                  <span
                    className="inline-flex items-center gap-1.5 text-[10px] font-mono px-2 py-1 rounded"
                    style={{
                      backgroundColor: "rgba(16,185,129,0.08)",
                      color: "#6EE7B7",
                      border: "1px solid rgba(16,185,129,0.2)",
                    }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" style={{ animation: "blink 2s ease infinite" }} />
                    All systems operational
                  </span>
                </div>
              </div>

              {/* Links */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-10 sm:gap-x-14 gap-y-8 text-[13.5px]">
                <div className="space-y-3">
                  <p className="text-[10px] uppercase tracking-[0.18em] font-semibold text-slate-600 mb-3">Product</p>
                  {["Features", "Pricing", "How it works", "Changelog"].map((l) => (
                    <a key={l} href="#" className="block text-slate-500 hover:text-slate-200 transition-colors">{l}</a>
                  ))}
                </div>
                <div className="space-y-3">
                  <p className="text-[10px] uppercase tracking-[0.18em] font-semibold text-slate-600 mb-3">Company</p>
                  {["About", "Blog", "Customers", "Contact"].map((l) => (
                    <a key={l} href="#" className="block text-slate-500 hover:text-slate-200 transition-colors">{l}</a>
                  ))}
                </div>
                <div className="space-y-3">
                  <p className="text-[10px] uppercase tracking-[0.18em] font-semibold text-slate-600 mb-3">Resources</p>
                  {["Docs", "API reference", "Security", "Status"].map((l) => (
                    <a key={l} href="#" className="block text-slate-500 hover:text-slate-200 transition-colors">{l}</a>
                  ))}
                </div>
                <div className="space-y-3">
                  <p className="text-[10px] uppercase tracking-[0.18em] font-semibold text-slate-600 mb-3">Legal</p>
                  {["Privacy", "Terms", "DPA", "Sub-processors"].map((l) => (
                    <a key={l} href="#" className="block text-slate-500 hover:text-slate-200 transition-colors">{l}</a>
                  ))}
                </div>
              </div>
            </div>

            <div
              className="pt-8 border-t flex flex-col sm:flex-row items-center justify-between gap-3 text-[12px]"
              style={{ borderColor: "rgba(255,255,255,0.05)" }}
            >
              <span className="text-slate-600">&copy; 2026 scriviq, Inc. All rights reserved.</span>
              <span className="font-mono text-slate-700">Know every clause. Miss nothing.</span>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
