// ─────────────────────────────────────────────────────────────────────────────
// scriviq — Landing Page  (Server Component)
// Enterprise Contract Intelligence Platform
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
} from "lucide-react";

// ─── Data ─────────────────────────────────────────────────────────────────────

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
    title: "Missed payment deadlines",
    desc: "A 30-day clause slips to 45. The penalty clause you didn't read just cost you $2,400 and a client relationship.",
  },
  {
    Icon: RefreshCw,
    title: "Silent auto-renewals",
    desc: "That $85k retainer renewed because no one tracked the 30-day cancellation window. It happens every quarter.",
  },
  {
    Icon: Lock,
    title: "Unchecked IP transfers",
    desc: "You built the design system. The contract says it's theirs. scriviq flags every IP clause before you sign.",
  },
];

const STEPS = [
  {
    n: "01",
    Icon: Upload,
    title: "Upload your contract",
    desc: "Drag and drop a PDF or DOCX. Any SOW, service agreement, or retainer — scriviq handles it.",
    chip: "PDF · DOCX · Up to 25MB",
  },
  {
    n: "02",
    Icon: Brain,
    title: "AI extracts every clause",
    desc: "GPT-4o reads the full document and returns structured data — clause type, due date, amount, notice period, and risk score.",
    chip: "~15 seconds per contract",
  },
  {
    n: "03",
    Icon: Bell,
    title: "Get alerts before it matters",
    desc: "Deadline alerts land in your inbox 7 days and 1 day before every due date. No manual tracking required.",
    chip: "7d · 1d · Overdue alerts",
  },
];

const FEATURES = [
  {
    Icon: Brain,
    title: "Clause Intelligence",
    desc: "13 critical clause types extracted — payment milestones, auto-renewals, IP transfers, liability caps, termination notices, and more.",
  },
  {
    Icon: ShieldCheck,
    title: "AI Risk Scoring",
    desc: "Every clause scored Low, Medium, or High with a plain-English reason. Know what to negotiate before you sign.",
  },
  {
    Icon: Bell,
    title: "Deadline Alerts",
    desc: "Automated email alerts at 7 days, 1 day, and overdue. Sent by AWS SES — reliable enough to sleep on.",
  },
  {
    Icon: Users,
    title: "Team Workspaces",
    desc: "Role-based access for owners, admins, and members. Every contract visible to the right people.",
  },
  {
    Icon: LayoutDashboard,
    title: "Portfolio Dashboard",
    desc: "Total contract value, active clauses, and upcoming deadlines across your entire client base — at a glance.",
  },
  {
    Icon: FileText,
    title: "Original Text Preserved",
    desc: "Every extracted clause links back to verbatim source text. Full paper trail. Always defensible.",
  },
];

const PLAN_INCLUDES = [
  "Unlimited contract uploads",
  "AI clause extraction — 13 types",
  "Risk scoring with plain-English reasons",
  "Automated email deadline alerts",
  "7-day, 1-day, and overdue warnings",
  "Team workspace with role-based access",
  "Portfolio dashboard & analytics",
  "CSV clause export",
  "PDF + DOCX support (up to 25MB)",
  "AWS-grade encryption & security",
];

// ─── Risk Badge ───────────────────────────────────────────────────────────────
function RiskBadge({ level }: { level: "low" | "medium" | "high" }) {
  if (level === "high") {
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold uppercase tracking-wider bg-red-950/60 text-red-400 border border-red-800/50">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
        HIGH
      </span>
    );
  }
  if (level === "medium") {
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold uppercase tracking-wider bg-amber-950/60 text-amber-400 border border-amber-800/50">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
        MED
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold uppercase tracking-wider bg-emerald-950/60 text-emerald-400 border border-emerald-800/50">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
      LOW
    </span>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function HomePage() {
  return (
    <>
      {/* ── Global keyframes & utilities ── */}
      <style>{`
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-12px); }
        }
        @keyframes gradientShift {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes glowPulse {
          0%, 100% { opacity: 0.4; }
          50%       { opacity: 0.7; }
        }
        @keyframes shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes orbPulse {
          0%, 100% { transform: scale(1); opacity: 0.18; }
          50%       { transform: scale(1.08); opacity: 0.28; }
        }
        @keyframes lineGrow {
          from { transform: scaleX(0); }
          to   { transform: scaleX(1); }
        }
        @keyframes extractIn {
          from { opacity: 0; transform: translateX(16px); }
          to   { opacity: 1; transform: translateX(0); }
        }

        .gradient-text {
          background: linear-gradient(135deg, #75D8FC 0%, #0072E5 40%, #75D8FC 80%, #0072E5 100%);
          background-size: 200% 200%;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          color: transparent;
          animation: gradientShift 4s ease infinite;
        }

        .feature-card:hover .feature-icon {
          box-shadow: 0 0 20px rgba(0, 114, 229, 0.35);
        }
        .feature-card:hover {
          border-color: rgba(0, 114, 229, 0.3);
          box-shadow: 0 0 30px rgba(0, 114, 229, 0.08);
        }

        .step-card:hover {
          border-color: rgba(0, 114, 229, 0.35);
          transform: translateY(-3px);
        }

        .pain-card:hover {
          border-color: rgba(0, 114, 229, 0.25);
          box-shadow: inset 3px 0 0 #0072E5;
        }
      `}</style>

      <div className="min-h-screen" style={{ backgroundColor: "#030712" }}>

        {/* ════════════════════════════════════════════════════════════════════
            NAV
        ════════════════════════════════════════════════════════════════════ */}
        <header
          className="fixed top-0 inset-x-0 z-50 border-b border-white/[0.05]"
          style={{
            backgroundColor: "rgba(3, 7, 18, 0.85)",
            backdropFilter: "blur(20px) saturate(1.6)",
            WebkitBackdropFilter: "blur(20px) saturate(1.6)",
            animation: "fadeInDown 0.5s ease both",
          }}
        >
          <div className="max-w-7xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between gap-6">
            {/* Logo */}
            <a href="/" className="flex items-center gap-2.5 shrink-0">
              <Image
                src="/logo-icon.svg"
                alt="scriviq"
                width={32}
                height={32}
                priority
              />
              <span
                className="font-semibold tracking-tight text-[15px] text-white"
              >
                scriviq
              </span>
            </a>

            {/* Nav links */}
            <nav className="hidden md:flex items-center gap-7">
              {[
                { label: "Features", href: "#features" },
                { label: "How it works", href: "#how-it-works" },
                { label: "Pricing", href: "#pricing" },
              ].map(({ label, href }) => (
                <a
                  key={label}
                  href={href}
                  className="text-sm text-slate-400 hover:text-white transition-colors duration-150"
                >
                  {label}
                </a>
              ))}
            </nav>

            {/* CTAs */}
            <div className="flex items-center gap-2 shrink-0">
              <a
                href="/login"
                className="hidden sm:block text-sm text-slate-400 hover:text-white transition-colors px-3 py-2"
              >
                Sign in
              </a>
              <a
                href="/signup"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-white text-sm font-medium transition-all duration-200 hover:opacity-90"
                style={{
                  backgroundColor: "#0072E5",
                  boxShadow: "0 0 20px rgba(0, 114, 229, 0.35)",
                }}
              >
                Get started free
                <ArrowRight size={14} />
              </a>
            </div>
          </div>
        </header>

        <main>
          {/* ════════════════════════════════════════════════════════════════
              HERO
          ════════════════════════════════════════════════════════════════ */}
          <section
            className="relative pt-32 sm:pt-40 pb-0 px-5 sm:px-8 overflow-hidden"
            style={{ backgroundColor: "#030712" }}
          >
            {/* Grid pattern */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(0,114,229,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(0,114,229,0.035) 1px, transparent 1px)",
                backgroundSize: "56px 56px",
              }}
            />

            {/* Ambient orb — top center */}
            <div
              className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none"
              style={{
                width: "960px",
                height: "520px",
                background:
                  "radial-gradient(ellipse at 50% 0%, rgba(0,114,229,0.22) 0%, transparent 65%)",
                filter: "blur(60px)",
                animation: "orbPulse 8s ease-in-out infinite",
              }}
            />
            {/* Orb left */}
            <div
              className="absolute top-40 -left-40 pointer-events-none"
              style={{
                width: "500px",
                height: "500px",
                background:
                  "radial-gradient(circle, rgba(117,216,252,0.07) 0%, transparent 70%)",
                filter: "blur(80px)",
                animation: "orbPulse 10s ease-in-out infinite 2s",
              }}
            />

            <div className="relative max-w-5xl mx-auto text-center">
              {/* Badge */}
              <div
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-sm mb-8"
                style={{
                  borderColor: "rgba(0,114,229,0.3)",
                  backgroundColor: "rgba(0,114,229,0.08)",
                  color: "#75D8FC",
                  animation: "fadeInUp 0.5s ease both",
                  animationDelay: "0.1s",
                }}
              >
                <span
                  className="w-2 h-2 rounded-full animate-pulse"
                  style={{ backgroundColor: "#0072E5" }}
                />
                Enterprise Contract Intelligence — built for agencies
              </div>

              {/* Headline */}
              <h1
                className="font-bold text-white tracking-tight leading-[1.04] mb-5"
                style={{
                  fontSize: "clamp(2.6rem, 8.5vw, 5rem)",
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
                className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed mb-10"
                style={{
                  animation: "fadeInUp 0.6s ease both",
                  animationDelay: "0.35s",
                }}
              >
                scriviq automatically extracts, risk-scores, and tracks every
                payment milestone, termination clause, and renewal deadline
                buried in your agency SOWs — before they become expensive
                surprises.
              </p>

              {/* CTAs */}
              <div
                className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-16"
                style={{
                  animation: "fadeInUp 0.6s ease both",
                  animationDelay: "0.5s",
                }}
              >
                <a
                  href="/signup"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-white font-semibold text-base transition-all duration-200 hover:opacity-90 hover:scale-[1.02]"
                  style={{
                    backgroundColor: "#0072E5",
                    boxShadow: "0 0 36px rgba(0,114,229,0.45)",
                  }}
                >
                  Start 14-day free trial
                  <ArrowRight size={16} />
                </a>
                <a
                  href="#how-it-works"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl border border-slate-700/80 text-slate-300 hover:text-white hover:border-slate-500 font-medium text-base transition-all duration-200"
                >
                  See how it works
                </a>
              </div>

              {/* Mock UI card — floating */}
              <div
                className="rounded-t-2xl border border-slate-800/70 border-b-0 overflow-hidden mx-auto"
                style={{
                  maxWidth: "880px",
                  boxShadow:
                    "0 -20px 100px rgba(0,114,229,0.12), 0 0 0 1px rgba(0,114,229,0.08)",
                  animation: "float 6s ease-in-out infinite",
                  animationDelay: "0.8s",
                }}
              >
                {/* Window chrome */}
                <div
                  className="border-b border-slate-800/60 px-5 py-3 flex items-center gap-3"
                  style={{ backgroundColor: "#0d1117" }}
                >
                  <div className="flex gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-slate-700/80" />
                    <span className="w-3 h-3 rounded-full bg-slate-700/80" />
                    <span className="w-3 h-3 rounded-full bg-slate-700/80" />
                  </div>
                  <div className="flex-1 min-w-0 bg-slate-800/50 rounded px-3 py-1 text-xs text-slate-500 font-mono text-left truncate">
                    acme-corp-web-redesign-sow-2025.pdf
                  </div>
                  <span className="hidden sm:flex items-center gap-1.5 text-xs text-emerald-400 font-mono whitespace-nowrap shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    8 clauses extracted
                  </span>
                </div>

                {/* Two-panel */}
                <div className="grid md:grid-cols-2" style={{ backgroundColor: "#070b14" }}>
                  {/* Left — raw */}
                  <div
                    className="p-5 sm:p-6 border-b md:border-b-0 md:border-r border-slate-800/40"
                  >
                    <p className="text-[10px] uppercase tracking-widest font-semibold text-slate-600 mb-4">
                      Raw Contract Text
                    </p>
                    <div className="space-y-3 font-mono text-[11px] leading-relaxed">
                      {EXTRACTION_DEMO.map((c, i) => (
                        <div
                          key={i}
                          className={`relative pl-3 py-2.5 pr-3 rounded-r-lg border-l-2 ${
                            c.highlight === "red"
                              ? "border-red-600/60 bg-red-950/10"
                              : c.highlight === "amber"
                              ? "border-amber-500/60 bg-amber-950/10"
                              : "border-slate-700 bg-slate-900/20"
                          }`}
                        >
                          <p className="text-slate-400 line-clamp-3">{c.raw}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right — extracted */}
                  <div className="p-5 sm:p-6">
                    <p className="text-[10px] uppercase tracking-widest font-semibold text-slate-600 mb-4">
                      Extracted by scriviq
                    </p>
                    <div className="space-y-2.5">
                      {EXTRACTION_DEMO.map((c, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-3 p-3 rounded-xl border border-slate-800/50"
                          style={{
                            backgroundColor: "rgba(13,17,23,0.8)",
                            animation: "extractIn 0.4s ease both",
                            animationDelay: `${0.1 + i * 0.2}s`,
                          }}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                              <span className="text-[9px] font-mono uppercase tracking-widest text-slate-500 bg-slate-800/60 px-1.5 py-0.5 rounded">
                                {c.type.replace(/_/g, " ")}
                              </span>
                              <RiskBadge level={c.risk} />
                            </div>
                            <p className="text-sm font-medium text-slate-100 leading-snug">
                              {c.title}
                            </p>
                            <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                              {c.detail}
                            </p>
                            <p className="text-[11px] text-amber-500/80 mt-1 flex items-center gap-1">
                              <AlertTriangle size={10} className="shrink-0" />
                              {c.reason}
                            </p>
                          </div>
                          {c.daysLeft !== null && (
                            <div className="shrink-0 text-right mt-0.5">
                              <span
                                className={`text-sm font-mono font-semibold ${
                                  c.daysLeft <= 7
                                    ? "text-amber-400"
                                    : "text-slate-500"
                                }`}
                              >
                                {c.daysLeft}d
                              </span>
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
              STATS BAR
          ════════════════════════════════════════════════════════════════ */}
          <div
            className="border-y border-slate-800/40"
            style={{ backgroundColor: "#0d1117" }}
          >
            <div className="max-w-5xl mx-auto px-5 sm:px-8 py-10 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-0 md:divide-x divide-slate-800/50">
              {[
                { value: "13", label: "Clause types extracted" },
                { value: "<15s", label: "Average extraction time" },
                { value: "3", label: "Alert levels — 7d, 1d, overdue" },
                { value: "$49/mo", label: "Flat rate per team" },
              ].map(({ value, label }) => (
                <div key={label} className="text-center md:px-8">
                  <p
                    className="text-3xl font-bold tracking-tight font-mono"
                    style={{ color: "#75D8FC" }}
                  >
                    {value}
                  </p>
                  <p className="text-sm text-slate-500 mt-1.5 leading-snug">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* ════════════════════════════════════════════════════════════════
              PROBLEM
          ════════════════════════════════════════════════════════════════ */}
          <section
            className="py-28 px-5 sm:px-8"
            style={{ backgroundColor: "#030712" }}
          >
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-16">
                <span
                  className="text-xs font-mono uppercase tracking-widest mb-3 block"
                  style={{ color: "#0072E5" }}
                >
                  The problem
                </span>
                <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-5 leading-tight">
                  Contracts lose agencies money —{" "}
                  <span className="text-slate-600">silently.</span>
                </h2>
                <p className="text-lg text-slate-500 max-w-xl mx-auto leading-relaxed">
                  The risk isn&apos;t the contract you read carefully. It&apos;s
                  the one uploaded to Dropbox two years ago that just
                  auto-renewed.
                </p>
              </div>

              <div className="grid sm:grid-cols-3 gap-5">
                {PAIN_POINTS.map(({ Icon, title, desc }) => (
                  <div
                    key={title}
                    className="pain-card p-7 rounded-2xl border border-slate-800/50 transition-all duration-300 group cursor-default"
                    style={{
                      backgroundColor: "#0d1117",
                      borderLeft: "3px solid rgba(0,114,229,0.4)",
                    }}
                  >
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center mb-5 transition-all duration-300"
                      style={{
                        backgroundColor: "rgba(0,114,229,0.08)",
                        border: "1px solid rgba(0,114,229,0.2)",
                        color: "#0072E5",
                      }}
                    >
                      <Icon size={20} />
                    </div>
                    <h3 className="text-base font-semibold text-slate-100 mb-2.5">
                      {title}
                    </h3>
                    <p className="text-sm text-slate-500 leading-relaxed">
                      {desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ════════════════════════════════════════════════════════════════
              HOW IT WORKS
          ════════════════════════════════════════════════════════════════ */}
          <section
            id="how-it-works"
            className="py-28 px-5 sm:px-8"
            style={{ backgroundColor: "#0d1117" }}
          >
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-18">
                <span
                  className="text-xs font-mono uppercase tracking-widest mb-3 block"
                  style={{ color: "#0072E5" }}
                >
                  The process
                </span>
                <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
                  From upload to insight in 15 seconds.
                </h2>
                <p className="text-lg text-slate-500 max-w-lg mx-auto">
                  Three steps. Zero configuration. No contract left unread.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6 relative mt-14">
                {/* Animated connector line */}
                <div
                  className="hidden md:block absolute top-9 left-[calc(33%+1.5rem)] right-[calc(33%+1.5rem)] h-px origin-left"
                  style={{
                    background:
                      "linear-gradient(to right, #0072E5, rgba(117,216,252,0.5), #0072E5)",
                    animation: "lineGrow 1.2s ease both 0.6s",
                    opacity: 0.5,
                  }}
                />

                {STEPS.map(({ n, Icon, title, desc, chip }, i) => (
                  <div
                    key={n}
                    className="step-card relative text-center p-7 rounded-2xl border border-slate-800/50 transition-all duration-300 cursor-default"
                    style={{
                      backgroundColor: "#030712",
                      animation: "fadeInUp 0.5s ease both",
                      animationDelay: `${0.2 + i * 0.15}s`,
                    }}
                  >
                    {/* Step number badge */}
                    <div
                      className="w-[4.5rem] h-[4.5rem] rounded-2xl flex flex-col items-center justify-center mx-auto mb-6 relative z-10 transition-all duration-300"
                      style={{
                        backgroundColor: "rgba(0,114,229,0.1)",
                        border: "1px solid rgba(0,114,229,0.25)",
                        boxShadow: "0 0 20px rgba(0,114,229,0.1)",
                      }}
                    >
                      <Icon size={22} style={{ color: "#0072E5" }} />
                      <span
                        className="text-[10px] font-mono font-bold mt-1"
                        style={{ color: "#75D8FC" }}
                      >
                        {n}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2.5">
                      {title}
                    </h3>
                    <p className="text-sm text-slate-500 leading-relaxed mb-5">
                      {desc}
                    </p>
                    <span
                      className="inline-block text-[11px] font-mono px-3 py-1 rounded-full"
                      style={{
                        color: "#75D8FC",
                        backgroundColor: "rgba(0,114,229,0.08)",
                        border: "1px solid rgba(0,114,229,0.2)",
                      }}
                    >
                      {chip}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ════════════════════════════════════════════════════════════════
              FEATURES GRID
          ════════════════════════════════════════════════════════════════ */}
          <section
            id="features"
            className="py-28 px-5 sm:px-8"
            style={{ backgroundColor: "#030712" }}
          >
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-16">
                <span
                  className="text-xs font-mono uppercase tracking-widest mb-3 block"
                  style={{ color: "#0072E5" }}
                >
                  Capabilities
                </span>
                <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
                  Built for agencies that run on contracts.
                </h2>
                <p className="text-lg text-slate-500 max-w-lg mx-auto">
                  Every feature exists to eliminate one thing: a clause you
                  should have caught.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {FEATURES.map(({ Icon, title, desc }) => (
                  <div
                    key={title}
                    className="feature-card p-6 rounded-2xl border border-slate-800/40 transition-all duration-300 cursor-default group"
                    style={{ backgroundColor: "#0d1117" }}
                  >
                    <div
                      className="feature-icon w-11 h-11 rounded-xl flex items-center justify-center mb-5 transition-all duration-300"
                      style={{
                        backgroundColor: "rgba(0,114,229,0.08)",
                        border: "1px solid rgba(0,114,229,0.2)",
                        color: "#0072E5",
                      }}
                    >
                      <Icon size={20} />
                    </div>
                    <h3 className="text-[15px] font-semibold text-slate-100 mb-2">
                      {title}
                    </h3>
                    <p className="text-sm text-slate-500 leading-relaxed">
                      {desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ════════════════════════════════════════════════════════════════
              CLAUSE EXTRACTION DEMO
          ════════════════════════════════════════════════════════════════ */}
          <section
            className="py-28 px-5 sm:px-8"
            style={{ backgroundColor: "#0d1117" }}
          >
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-16">
                <span
                  className="text-xs font-mono uppercase tracking-widest mb-3 block"
                  style={{ color: "#0072E5" }}
                >
                  Live demo
                </span>
                <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
                  Raw legalese, meet structured insight.
                </h2>
                <p className="text-lg text-slate-500 max-w-xl mx-auto">
                  Every clause extracted, categorised, and risk-scored in
                  seconds. No copy-paste. No spreadsheets.
                </p>
              </div>

              <div
                className="rounded-2xl border border-slate-800/60 overflow-hidden"
                style={{
                  boxShadow: "0 0 60px rgba(0,114,229,0.08)",
                }}
              >
                {/* Tab bar */}
                <div
                  className="flex items-center gap-0 border-b border-slate-800/50 px-6 pt-4"
                  style={{ backgroundColor: "#030712" }}
                >
                  <div
                    className="px-4 py-2 text-xs font-medium border-b-2 rounded-t"
                    style={{ borderColor: "#0072E5", color: "#75D8FC" }}
                  >
                    acme-corp-sow-2025.pdf
                  </div>
                </div>

                <div className="grid md:grid-cols-2" style={{ backgroundColor: "#070b14" }}>
                  {/* Left — raw */}
                  <div className="p-6 md:border-r border-slate-800/40">
                    <div className="flex items-center justify-between mb-5">
                      <p className="text-[10px] uppercase tracking-widest font-semibold text-slate-600">
                        Raw Contract Text
                      </p>
                      <span className="text-[10px] font-mono text-slate-700">
                        PDF · 14 pages
                      </span>
                    </div>
                    <div className="space-y-3 font-mono text-[11px] leading-relaxed">
                      {EXTRACTION_DEMO.map((c, i) => (
                        <div
                          key={i}
                          className={`relative pl-3.5 py-3 pr-3 rounded-r-lg border-l-2 ${
                            c.highlight === "red"
                              ? "border-red-600/60 bg-red-950/[0.08]"
                              : c.highlight === "amber"
                              ? "border-amber-500/60 bg-amber-950/[0.08]"
                              : "border-slate-700 bg-slate-900/20"
                          }`}
                        >
                          <p className="text-slate-400 line-clamp-4">{c.raw}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right — extracted */}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-5">
                      <p className="text-[10px] uppercase tracking-widest font-semibold text-slate-600">
                        Extracted by scriviq
                      </p>
                      <span
                        className="flex items-center gap-1 text-[10px] font-mono"
                        style={{ color: "#75D8FC" }}
                      >
                        <Zap size={10} />
                        ~12s
                      </span>
                    </div>
                    <div className="space-y-3">
                      {EXTRACTION_DEMO.map((c, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-800/50"
                          style={{
                            backgroundColor: "rgba(13,17,23,0.9)",
                            animation: "extractIn 0.5s ease both",
                            animationDelay: `${0.1 + i * 0.2}s`,
                          }}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                              <span className="text-[9px] font-mono uppercase tracking-widest text-slate-500 bg-slate-800/60 px-1.5 py-0.5 rounded">
                                {c.type.replace(/_/g, " ")}
                              </span>
                              <RiskBadge level={c.risk} />
                            </div>
                            <p className="text-sm font-semibold text-slate-100 leading-snug">
                              {c.title}
                            </p>
                            <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                              {c.detail}
                            </p>
                            <p className="text-[11px] text-amber-500/80 mt-1 flex items-center gap-1">
                              <AlertTriangle size={10} className="shrink-0" />
                              {c.reason}
                            </p>
                          </div>
                          {c.daysLeft !== null && (
                            <div className="shrink-0 text-right mt-0.5">
                              <span
                                className={`text-sm font-mono font-bold ${
                                  c.daysLeft <= 7
                                    ? "text-amber-400"
                                    : "text-slate-600"
                                }`}
                              >
                                {c.daysLeft}d
                              </span>
                              <p className="text-[9px] text-slate-700 mt-0.5">
                                left
                              </p>
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
              TESTIMONIAL
          ════════════════════════════════════════════════════════════════ */}
          <section
            className="py-24 px-5 sm:px-8 relative overflow-hidden"
            style={{ backgroundColor: "#030712" }}
          >
            {/* Glow behind quote */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse at 50% 50%, rgba(0,114,229,0.07) 0%, transparent 65%)",
              }}
            />

            <div className="relative max-w-3xl mx-auto text-center">
              {/* Stars */}
              <div className="flex justify-center gap-1.5 mb-7">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={18}
                    className="fill-amber-400 text-amber-400"
                  />
                ))}
              </div>

              <blockquote
                className="text-xl sm:text-2xl font-medium text-slate-200 leading-relaxed mb-9"
                style={{ letterSpacing: "-0.01em" }}
              >
                &ldquo;scriviq caught an auto-renewal clause that would have
                locked us into another $85,000 year with a client we were
                actively off-boarding. It paid for itself in the first
                week.&rdquo;
              </blockquote>

              <div className="flex items-center justify-center gap-3.5">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white"
                  style={{
                    backgroundColor: "rgba(0,114,229,0.25)",
                    border: "1px solid rgba(0,114,229,0.4)",
                    boxShadow: "0 0 16px rgba(0,114,229,0.2)",
                  }}
                >
                  S
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-slate-200">
                    Sarah K.
                  </p>
                  <p className="text-xs text-slate-500">
                    Creative Director, Momentum Agency
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* ════════════════════════════════════════════════════════════════
              PRICING
          ════════════════════════════════════════════════════════════════ */}
          <section
            id="pricing"
            className="py-28 px-5 sm:px-8"
            style={{ backgroundColor: "#0d1117" }}
          >
            <div className="max-w-2xl mx-auto text-center">
              <span
                className="text-xs font-mono uppercase tracking-widest mb-3 block"
                style={{ color: "#0072E5" }}
              >
                Pricing
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
                One plan. No surprises.
              </h2>
              <p className="text-lg text-slate-500 mb-14">
                Everything your team needs to stop missing contract deadlines.
              </p>

              <div
                className="rounded-3xl border overflow-hidden text-left relative"
                style={{
                  borderColor: "rgba(0,114,229,0.2)",
                  backgroundColor: "#030712",
                  boxShadow:
                    "0 0 80px rgba(0,114,229,0.1), 0 0 0 1px rgba(0,114,229,0.08)",
                }}
              >
                {/* Glow top-right */}
                <div
                  className="absolute top-0 right-0 pointer-events-none"
                  style={{
                    width: "300px",
                    height: "200px",
                    background:
                      "radial-gradient(ellipse at 100% 0%, rgba(0,114,229,0.12) 0%, transparent 70%)",
                  }}
                />

                {/* Plan header */}
                <div
                  className="px-7 sm:px-8 pt-8 pb-7 border-b relative"
                  style={{ borderColor: "rgba(0,114,229,0.12)" }}
                >
                  {/* 14-day badge */}
                  <div
                    className="absolute top-7 right-7 sm:right-8 px-3 py-1 rounded-full text-xs font-semibold"
                    style={{
                      backgroundColor: "rgba(0,114,229,0.15)",
                      border: "1px solid rgba(0,114,229,0.3)",
                      color: "#75D8FC",
                    }}
                  >
                    14-day free trial
                  </div>

                  <div>
                    <p
                      className="text-xs font-mono uppercase tracking-widest mb-2"
                      style={{ color: "#0072E5" }}
                    >
                      Pro Team
                    </p>
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-5xl font-bold text-white tracking-tight">
                        $49
                      </span>
                      <span className="text-slate-500 text-base">
                        / month per team
                      </span>
                    </div>
                    <p className="text-sm text-slate-500">
                      No credit card required to start
                    </p>
                  </div>

                  <a
                    href="/signup"
                    className="mt-6 inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-white font-semibold text-base transition-all duration-200 hover:opacity-90 hover:scale-[1.02]"
                    style={{
                      backgroundColor: "#0072E5",
                      boxShadow: "0 0 30px rgba(0,114,229,0.4)",
                    }}
                  >
                    Start free trial
                    <ArrowRight size={16} />
                  </a>
                </div>

                {/* Feature list */}
                <div className="px-7 sm:px-8 py-7 grid sm:grid-cols-2 gap-y-3 gap-x-6">
                  {PLAN_INCLUDES.map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-2.5 text-sm text-slate-300"
                    >
                      <span
                        className="shrink-0 w-4 h-4 rounded-full flex items-center justify-center"
                        style={{
                          backgroundColor: "rgba(0,114,229,0.15)",
                          color: "#0072E5",
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
                  className="mx-6 sm:mx-8 mb-7 mt-1 p-4 rounded-xl flex items-start gap-3.5"
                  style={{
                    backgroundColor: "rgba(0,114,229,0.05)",
                    border: "1px solid rgba(0,114,229,0.12)",
                  }}
                >
                  <ShieldCheck
                    size={18}
                    className="shrink-0 mt-0.5"
                    style={{ color: "#0072E5" }}
                  />
                  <div>
                    <p className="text-sm font-semibold text-slate-200 mb-0.5">
                      Enterprise plans available
                    </p>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      SSO, white-label, audit logs, webhook delivery, read-only
                      API access, and custom clause types.{" "}
                      <a
                        href="mailto:hello@scriviq.com"
                        className="hover:underline"
                        style={{ color: "#75D8FC" }}
                      >
                        Talk to us
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ════════════════════════════════════════════════════════════════
              FINAL CTA
          ════════════════════════════════════════════════════════════════ */}
          <section
            className="py-36 px-5 sm:px-8 relative overflow-hidden"
            style={{ backgroundColor: "#030712" }}
          >
            {/* Grid */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(0,114,229,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,114,229,0.04) 1px, transparent 1px)",
                backgroundSize: "56px 56px",
              }}
            />
            {/* Orb */}
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
              style={{
                width: "800px",
                height: "400px",
                background:
                  "radial-gradient(ellipse at 50% 50%, rgba(0,114,229,0.15) 0%, transparent 65%)",
                filter: "blur(60px)",
                animation: "glowPulse 6s ease-in-out infinite",
              }}
            />

            <div className="relative max-w-3xl mx-auto text-center">
              <div
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-sm mb-8"
                style={{
                  borderColor: "rgba(0,114,229,0.3)",
                  backgroundColor: "rgba(0,114,229,0.08)",
                  color: "#75D8FC",
                }}
              >
                <Zap size={13} style={{ color: "#0072E5" }} />
                Start in under 60 seconds
              </div>

              <h2
                className="font-bold text-white tracking-tight leading-tight mb-6"
                style={{ fontSize: "clamp(2.2rem, 7vw, 3.8rem)" }}
              >
                Stop guessing.
                <br />
                <span className="gradient-text">Start knowing.</span>
              </h2>

              <p className="text-lg text-slate-400 mb-10 max-w-xl mx-auto leading-relaxed">
                Upload your first contract in under a minute. scriviq extracts
                every clause, flags every risk, and tracks every deadline — so
                you don&apos;t have to.
              </p>

              <a
                href="/signup"
                className="inline-flex items-center gap-2 px-9 py-4 rounded-xl text-white font-bold text-base transition-all duration-200 hover:opacity-90 hover:scale-[1.02]"
                style={{
                  backgroundColor: "#0072E5",
                  boxShadow: "0 0 50px rgba(0,114,229,0.5)",
                }}
              >
                Start free — 14 days, no card needed
                <ArrowRight size={16} />
              </a>

              <p className="text-sm text-slate-700 mt-5">
                $49/mo per team after trial · Cancel anytime
              </p>
            </div>
          </section>
        </main>

        {/* ════════════════════════════════════════════════════════════════
            FOOTER
        ════════════════════════════════════════════════════════════════ */}
        <footer
          className="border-t border-slate-800/40 px-5 sm:px-8 pt-14 pb-10"
          style={{ backgroundColor: "#0d1117" }}
        >
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-12">
              {/* Brand */}
              <div className="max-w-xs">
                <div className="flex items-center gap-2.5 mb-4">
                  <Image
                    src="/logo-icon.svg"
                    alt="scriviq"
                    width={28}
                    height={28}
                  />
                  <span className="text-white font-semibold tracking-tight text-[15px]">
                    scriviq
                  </span>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Intelligence embedded in every clause. Enterprise contract
                  intelligence for digital agencies and IT consultancies.
                </p>
              </div>

              {/* Links */}
              <div className="grid grid-cols-3 gap-x-10 sm:gap-x-16 gap-y-8 text-sm">
                <div className="space-y-3">
                  <p className="text-[11px] uppercase tracking-wider font-semibold text-slate-600">
                    Product
                  </p>
                  {["Features", "Pricing", "How it works", "Changelog"].map(
                    (l) => (
                      <a
                        key={l}
                        href="#"
                        className="block text-slate-500 hover:text-slate-300 transition-colors"
                      >
                        {l}
                      </a>
                    )
                  )}
                </div>
                <div className="space-y-3">
                  <p className="text-[11px] uppercase tracking-wider font-semibold text-slate-600">
                    Company
                  </p>
                  {["About", "Blog", "Privacy", "Terms"].map((l) => (
                    <a
                      key={l}
                      href="#"
                      className="block text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      {l}
                    </a>
                  ))}
                </div>
                <div className="space-y-3">
                  <p className="text-[11px] uppercase tracking-wider font-semibold text-slate-600">
                    Support
                  </p>
                  {["Docs", "Contact", "Security", "Status"].map((l) => (
                    <a
                      key={l}
                      href="#"
                      className="block text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      {l}
                    </a>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-12 pt-6 border-t border-slate-800/40 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-700">
              <span>© 2025 scriviq. All rights reserved.</span>
              <span className="font-mono">Know every clause. Miss nothing.</span>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
