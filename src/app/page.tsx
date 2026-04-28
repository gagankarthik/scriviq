// ─────────────────────────────────────────────────────────────────────────────
// scriviq — Landing Page
// Enterprise SOW & Contract Intelligence Platform
// ─────────────────────────────────────────────────────────────────────────────

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
    icon: "⏰",
    title: "Missed payment deadlines",
    desc: "A 30-day clause slips to 45. The penalty clause you didn't read just cost you $2,400 and a client relationship.",
  },
  {
    icon: "↻",
    title: "Silent auto-renewals",
    desc: "That $85k retainer renewed because no one tracked the 30-day cancellation window. It happens every quarter.",
  },
  {
    icon: "©",
    title: "Unchecked IP transfers",
    desc: "You built the design system. The contract says it's theirs. scriviq flags every IP clause before you sign.",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Upload your contract",
    desc: "Drag and drop a PDF or DOCX. Any SOW, service agreement, or retainer — scriviq handles it.",
    chip: "PDF · DOCX · Up to 25MB",
  },
  {
    n: "02",
    title: "AI extracts every clause",
    desc: "GPT-4o reads the full document and returns structured data — clause type, due date, amount, notice period, and risk score.",
    chip: "~15 seconds per contract",
  },
  {
    n: "03",
    title: "Get alerts before it matters",
    desc: "Deadline alerts land in your inbox 7 days and 1 day before every due date. No manual tracking required.",
    chip: "7d · 1d · Overdue alerts",
  },
];

const FEATURES = [
  {
    icon: "⊡",
    title: "Clause Intelligence",
    desc: "13 critical clause types extracted — payment milestones, auto-renewals, IP transfers, liability caps, termination notices, and more.",
  },
  {
    icon: "◈",
    title: "AI Risk Scoring",
    desc: "Every clause scored Low, Medium, or High with a plain-English reason. Know what to negotiate before you sign.",
  },
  {
    icon: "◎",
    title: "Deadline Alerts",
    desc: "Automated email alerts at 7 days, 1 day, and overdue. Sent by AWS SES — reliable enough to sleep on.",
  },
  {
    icon: "⊕",
    title: "Team Workspaces",
    desc: "Role-based access for owners, admins, and members. Every contract visible to the right people.",
  },
  {
    icon: "▦",
    title: "Portfolio Dashboard",
    desc: "Total contract value, active clauses, and upcoming deadlines across your entire client base — at a glance.",
  },
  {
    icon: "⊙",
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

// ─── Nav ──────────────────────────────────────────────────────────────────────
function Nav() {
  return (
    <header
      className="fixed top-0 inset-x-0 z-50 border-b border-white/[0.06]"
      style={{
        backgroundColor: "rgba(10, 15, 30, 0.88)",
        backdropFilter: "blur(20px) saturate(1.4)",
        WebkitBackdropFilter: "blur(20px) saturate(1.4)",
      }}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between gap-6">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2.5 shrink-0">
          <div
            className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-sm font-bold select-none"
            style={{ boxShadow: "0 0 18px rgb(79 70 229 / 0.5)" }}
          >
            C
          </div>
          <span className="text-white font-semibold tracking-tight text-[15px]">
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
              className="text-sm text-slate-400 hover:text-slate-100 transition-colors duration-150"
            >
              {label}
            </a>
          ))}
        </nav>

        {/* CTAs */}
        <div className="flex items-center gap-2 shrink-0">
          <a
            href="/login"
            className="hidden sm:block text-sm text-slate-400 hover:text-slate-100 transition-colors px-3 py-2"
          >
            Sign in
          </a>
          <a
            href="/signup"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-all duration-150"
            style={{ boxShadow: "0 0 20px rgb(79 70 229 / 0.3)" }}
          >
            Get started free
          </a>
        </div>
      </div>
    </header>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section
      className="relative pt-28 sm:pt-36 pb-0 px-5 sm:px-8 overflow-hidden"
      style={{
        backgroundColor: "#0A0F1E",
        backgroundImage:
          "radial-gradient(circle, #1E2A45 1px, transparent 1px)",
        backgroundSize: "28px 28px",
      }}
    >
      {/* Ambient glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] pointer-events-none opacity-20"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, #4F46E5 0%, transparent 60%)",
          filter: "blur(80px)",
        }}
      />

      <div className="relative max-w-5xl mx-auto text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-indigo-800/40 bg-indigo-950/40 text-indigo-300 text-sm mb-8">
          <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
          Enterprise Contract Intelligence — built for agencies
        </div>

        {/* Headline */}
        <h1
          className="font-semibold text-white tracking-tight leading-[1.04] mb-5"
          style={{ fontSize: "clamp(2.5rem, 8vw, 4.5rem)" }}
        >
          Know every clause.
          <br />
          <span className="text-indigo-400">Miss nothing.</span>
        </h1>

        {/* Sub */}
        <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed mb-10">
          scriviq automatically extracts, risk-scores, and tracks every payment
          milestone, termination clause, and renewal deadline buried in your
          agency SOWs — before they become expensive surprises.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-14">
          <a
            href="/signup"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-base transition-all duration-150"
            style={{ boxShadow: "0 0 36px rgb(79 70 229 / 0.4)" }}
          >
            Start 14-day free trial
            <span aria-hidden="true">→</span>
          </a>
          <a
            href="#how-it-works"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl border border-slate-700/80 text-slate-300 hover:text-white hover:border-slate-500 font-medium text-base transition-all duration-150"
          >
            See how it works
          </a>
        </div>

        {/* Extraction Preview Window */}
        <div
          className="rounded-t-2xl border border-slate-800/80 border-b-0 overflow-hidden"
          style={{ boxShadow: "0 -12px 80px rgb(79 70 229 / 0.1)" }}
        >
          {/* Window chrome */}
          <div className="bg-slate-900/90 border-b border-slate-800/60 px-5 py-3 flex items-center gap-3">
            <div className="flex gap-1.5">
              <span className="w-3 h-3 rounded-full bg-slate-700/80" />
              <span className="w-3 h-3 rounded-full bg-slate-700/80" />
              <span className="w-3 h-3 rounded-full bg-slate-700/80" />
            </div>
            <div className="flex-1 min-w-0 bg-slate-800/60 rounded px-3 py-1 text-xs text-slate-500 font-mono text-left truncate">
              acme-corp-web-redesign-sow-2025.pdf
            </div>
            <span className="hidden sm:block text-xs text-emerald-400 font-mono whitespace-nowrap shrink-0">
              ✓ 8 clauses extracted
            </span>
          </div>

          {/* Two-panel content */}
          <div className="grid md:grid-cols-2 bg-[#070C18]">
            {/* Left — raw document */}
            <div className="p-5 sm:p-6 border-b md:border-b-0 md:border-r border-slate-800/50">
              <p className="text-[11px] uppercase tracking-widest font-medium text-slate-600 mb-4">
                Raw Contract Text
              </p>
              <div className="space-y-3 font-mono text-[11.5px] leading-relaxed">
                {EXTRACTION_DEMO.map((c, i) => (
                  <div
                    key={i}
                    className={`relative pl-3 py-2.5 pr-3 rounded-r-lg border-l-2 ${
                      c.highlight === "red"
                        ? "border-red-600/60 bg-red-950/10"
                        : c.highlight === "amber"
                        ? "border-amber-500/60 bg-amber-950/10"
                        : "border-slate-700 bg-slate-900/30"
                    }`}
                  >
                    <p className="text-slate-400 line-clamp-3">{c.raw}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — extracted */}
            <div className="p-5 sm:p-6">
              <p className="text-[11px] uppercase tracking-widest font-medium text-slate-600 mb-4">
                Extracted by scriviq
              </p>
              <div className="space-y-2.5">
                {EXTRACTION_DEMO.map((c, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/50 border border-slate-800/60"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className="text-[9px] font-mono uppercase tracking-widest text-slate-500 bg-slate-800/80 px-1.5 py-0.5 rounded">
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
                      <p className="text-[11px] text-amber-600/80 mt-1">
                        ⚠ {c.reason}
                      </p>
                    </div>
                    {c.daysLeft !== null && (
                      <div className="shrink-0 text-right mt-0.5">
                        <span
                          className={`text-sm font-mono font-semibold ${
                            c.daysLeft <= 7
                              ? "text-amber-400"
                              : "text-slate-600"
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
  );
}

// ─── Stats Bar ────────────────────────────────────────────────────────────────
function StatsBar() {
  const stats = [
    { value: "13", label: "Clause types extracted" },
    { value: "<15s", label: "Average extraction time" },
    { value: "3", label: "Alert levels — 7d, 1d, overdue" },
    { value: "$49", label: "Per team / month" },
  ];

  return (
    <div className="border-y border-slate-800/50 bg-[#070C18]/80">
      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-8 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-0 md:divide-x divide-slate-800/60">
        {stats.map(({ value, label }) => (
          <div key={label} className="text-center md:px-8">
            <p className="text-3xl font-semibold text-white tracking-tight font-mono">
              {value}
            </p>
            <p className="text-sm text-slate-500 mt-1 leading-snug">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Pain Points ──────────────────────────────────────────────────────────────
function PainPoints() {
  return (
    <section className="py-24 px-5 sm:px-8 bg-[#0A0F1E]">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-semibold text-white tracking-tight mb-4 leading-tight">
            Contracts lose agencies money —{" "}
            <span className="text-slate-600">silently.</span>
          </h2>
          <p className="text-lg text-slate-500 max-w-xl mx-auto leading-relaxed">
            The risk isn&apos;t the contract you read carefully. It&apos;s the
            one uploaded to Dropbox two years ago that just auto-renewed.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-5">
          {PAIN_POINTS.map(({ icon, title, desc }) => (
            <div
              key={title}
              className="p-6 rounded-2xl border border-slate-800/60 bg-slate-900/20"
            >
              <div className="w-11 h-11 rounded-xl bg-slate-800/60 border border-slate-700/40 flex items-center justify-center text-xl mb-5">
                {icon}
              </div>
              <h3 className="text-base font-semibold text-slate-100 mb-2">
                {title}
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── How It Works ─────────────────────────────────────────────────────────────
function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="py-24 px-5 sm:px-8"
      style={{ backgroundColor: "#070C18" }}
    >
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-xs font-mono uppercase tracking-widest text-indigo-500 mb-3 block">
            The process
          </span>
          <h2 className="text-3xl sm:text-4xl font-semibold text-white tracking-tight">
            From upload to insight in 15 seconds.
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-10 relative">
          {/* Connector line */}
          <div
            className="hidden md:block absolute top-7 left-[calc(33%+2rem)] right-[calc(33%+2rem)] h-px"
            style={{
              background:
                "linear-gradient(to right, #1E2A45, rgb(79 70 229 / 0.35), #1E2A45)",
            }}
          />

          {STEPS.map(({ n, title, desc, chip }) => (
            <div key={n} className="relative text-center">
              <div
                className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-700/60 flex items-center justify-center mx-auto mb-5 text-indigo-400 font-mono text-sm font-semibold relative z-10"
                style={{
                  boxShadow: "inset 0 1px 0 rgb(255 255 255 / 0.04)",
                }}
              >
                {n}
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed mb-4">
                {desc}
              </p>
              <span className="inline-block text-[11px] font-mono text-indigo-400 bg-indigo-950/40 border border-indigo-900/40 px-2.5 py-1 rounded-full">
                {chip}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Features ─────────────────────────────────────────────────────────────────
function Features() {
  return (
    <section id="features" className="py-24 px-5 sm:px-8 bg-[#0A0F1E]">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <span className="text-xs font-mono uppercase tracking-widest text-indigo-500 mb-3 block">
            Capabilities
          </span>
          <h2 className="text-3xl sm:text-4xl font-semibold text-white tracking-tight mb-4">
            Built for agencies that run on contracts.
          </h2>
          <p className="text-lg text-slate-500 max-w-lg mx-auto">
            Every feature exists to eliminate one thing: a clause you should
            have caught.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map(({ icon, title, desc }) => (
            <div
              key={title}
              className="p-6 rounded-2xl border border-slate-800/50 bg-slate-900/20 hover:bg-slate-900/50 hover:border-slate-700/60 transition-all duration-200 group"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-600/10 border border-indigo-800/30 flex items-center justify-center text-lg text-indigo-400 mb-4 group-hover:bg-indigo-600/15 transition-colors">
                {icon}
              </div>
              <h3 className="text-[15px] font-semibold text-slate-100 mb-2">
                {title}
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Testimonial ──────────────────────────────────────────────────────────────
function Testimonial() {
  return (
    <div
      className="py-20 px-5 sm:px-8"
      style={{ backgroundColor: "#070C18" }}
    >
      <div className="max-w-3xl mx-auto text-center">
        <div className="flex justify-center gap-1 mb-6">
          {[...Array(5)].map((_, i) => (
            <span key={i} className="text-amber-400 text-base">
              ★
            </span>
          ))}
        </div>
        <blockquote className="text-xl sm:text-2xl font-medium text-slate-200 leading-relaxed mb-7">
          &ldquo;scriviq caught an auto-renewal clause that would have locked us
          into another $85,000 year with a client we were actively
          off-boarding.&rdquo;
        </blockquote>
        <div className="flex items-center justify-center gap-3">
          <div className="w-9 h-9 rounded-full bg-indigo-950 border border-indigo-800/50 flex items-center justify-center text-indigo-400 text-sm font-semibold">
            S
          </div>
          <div className="text-left">
            <p className="text-sm font-medium text-slate-200">Sarah K.</p>
            <p className="text-xs text-slate-500">
              Creative Director, Momentum Agency
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Pricing ──────────────────────────────────────────────────────────────────
function Pricing() {
  return (
    <section id="pricing" className="py-24 px-5 sm:px-8 bg-[#0A0F1E]">
      <div className="max-w-2xl mx-auto text-center">
        <span className="text-xs font-mono uppercase tracking-widest text-indigo-500 mb-3 block">
          Pricing
        </span>
        <h2 className="text-3xl sm:text-4xl font-semibold text-white tracking-tight mb-4">
          One plan. No surprises.
        </h2>
        <p className="text-lg text-slate-500 mb-12">
          Everything your team needs to stop missing contract deadlines.
        </p>

        <div
          className="rounded-3xl border border-indigo-800/25 bg-slate-900/50 overflow-hidden text-left"
          style={{ boxShadow: "0 0 100px rgb(79 70 229 / 0.08)" }}
        >
          {/* Plan header */}
          <div className="px-7 sm:px-8 pt-8 pb-7 border-b border-slate-800/50">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5">
              <div>
                <p className="text-xs font-mono uppercase tracking-widest text-indigo-400 mb-2">
                  Pro Team
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-semibold text-white tracking-tight">
                    $49
                  </span>
                  <span className="text-slate-500 text-base">
                    / month per team
                  </span>
                </div>
                <p className="text-sm text-slate-500 mt-2">
                  14-day free trial · No credit card required
                </p>
              </div>
              <a
                href="/signup"
                className="shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-all duration-150"
                style={{ boxShadow: "0 0 24px rgb(79 70 229 / 0.3)" }}
              >
                Start free trial →
              </a>
            </div>
          </div>

          {/* Feature list */}
          <div className="px-7 sm:px-8 py-7 grid sm:grid-cols-2 gap-3">
            {PLAN_INCLUDES.map((item) => (
              <div
                key={item}
                className="flex items-center gap-2.5 text-sm text-slate-300"
              >
                <span className="text-indigo-400 shrink-0">✓</span>
                {item}
              </div>
            ))}
          </div>

          {/* Enterprise note */}
          <div className="mx-6 sm:mx-8 mb-7 mt-1 p-4 rounded-xl bg-slate-800/30 border border-slate-700/25 flex items-start gap-3.5">
            <span className="text-lg shrink-0 mt-0.5">◈</span>
            <div>
              <p className="text-sm font-medium text-slate-200 mb-0.5">
                Enterprise plans available
              </p>
              <p className="text-xs text-slate-500 leading-relaxed">
                SSO, white-label, audit logs, webhook delivery, read-only API
                access, and custom clause types.{" "}
                <a
                  href="mailto:hello@scriviq.com"
                  className="text-indigo-400 hover:underline"
                >
                  Talk to us →
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Final CTA ────────────────────────────────────────────────────────────────
function FinalCTA() {
  return (
    <section
      className="py-32 px-5 sm:px-8 relative overflow-hidden"
      style={{
        backgroundColor: "#070C18",
        backgroundImage:
          "radial-gradient(circle, #1E2A45 1px, transparent 1px)",
        backgroundSize: "28px 28px",
      }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 60%, rgba(79,70,229,0.14) 0%, transparent 60%)",
        }}
      />
      <div className="relative max-w-3xl mx-auto text-center">
        <h2 className="text-4xl sm:text-5xl font-semibold text-white tracking-tight leading-tight mb-6">
          Stop guessing.
          <br />
          <span className="text-indigo-400">Start knowing.</span>
        </h2>
        <p className="text-lg text-slate-400 mb-10 max-w-xl mx-auto leading-relaxed">
          Upload your first contract in under a minute. scriviq extracts every
          clause, flags every risk, and tracks every deadline — so you
          don&apos;t have to.
        </p>
        <a
          href="/signup"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-base transition-all duration-150"
          style={{ boxShadow: "0 0 44px rgb(79 70 229 / 0.45)" }}
        >
          Start free — 14 days, no card needed
        </a>
        <p className="text-sm text-slate-700 mt-5">
          $49/mo per team after trial · Cancel anytime
        </p>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="border-t border-slate-800/50 bg-[#0A0F1E] px-5 sm:px-8 pt-14 pb-10">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-12">
          {/* Brand */}
          <div className="max-w-xs">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                C
              </div>
              <span className="text-white font-semibold tracking-tight">
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
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0A0F1E]">
      <Nav />
      <main>
        <Hero />
        <StatsBar />
        <PainPoints />
        <HowItWorks />
        <Features />
        <Testimonial />
        <Pricing />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
