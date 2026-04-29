"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { ArrowLeft, CheckCircle2, Mail, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/Button";

const CODE_LEN = 6;

function VerifyInner() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const emailFromUrl = searchParams.get("email") ?? "";

  const [email, setEmail]         = useState(emailFromUrl);
  const [digits, setDigits]       = useState<string[]>(Array(CODE_LEN).fill(""));
  const [loading, setLoading]     = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [info, setInfo]           = useState<string | null>(null);
  const [resendIn, setResendIn]   = useState(0);

  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  // Pull pending email from sessionStorage if not in the URL
  useEffect(() => {
    if (!email) {
      try {
        const stored = sessionStorage.getItem("scriviq:pending-email");
        if (stored) setEmail(stored);
      } catch {}
    }
    // Focus the first digit on mount
    inputRefs.current[0]?.focus();
  }, [email]);

  // Resend cooldown ticker
  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setInterval(() => setResendIn((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [resendIn]);

  function setDigitAt(idx: number, raw: string) {
    // Allow paste of a full code into one box
    if (raw.length > 1) {
      const next = raw.replace(/\D/g, "").slice(0, CODE_LEN).padEnd(CODE_LEN, "").split("");
      const filled = Array.from({ length: CODE_LEN }, (_, i) => next[i] ?? "");
      setDigits(filled);
      const lastIdx = Math.min(raw.replace(/\D/g, "").length, CODE_LEN) - 1;
      if (lastIdx >= 0) inputRefs.current[lastIdx]?.focus();
      return;
    }
    const ch = raw.replace(/\D/g, "");
    setDigits((prev) => {
      const copy = [...prev];
      copy[idx] = ch;
      return copy;
    });
    if (ch && idx < CODE_LEN - 1) {
      inputRefs.current[idx + 1]?.focus();
    }
  }

  function handleKeyDown(idx: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
    if (e.key === "ArrowRight" && idx < CODE_LEN - 1) {
      inputRefs.current[idx + 1]?.focus();
    }
  }

  async function submit(code: string) {
    if (!email) {
      setError("We need your email to verify. Please try signing up again.");
      return;
    }
    setLoading(true);
    setError(null);
    setInfo(null);

    let storedPassword: string | null = null;
    try {
      storedPassword = sessionStorage.getItem("scriviq:pending-password");
    } catch {}

    try {
      const res = await fetch("/api/auth/verify", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          email,
          code,
          ...(storedPassword ? { password: storedPassword } : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Verification failed. Please try again.");
        return;
      }

      // Clean up sensitive sessionStorage entries
      try {
        sessionStorage.removeItem("scriviq:pending-password");
        sessionStorage.removeItem("scriviq:pending-email");
      } catch {}

      if (data.loggedIn) {
        router.push("/dashboard");
      } else {
        // Fallback: no password to auto-login (e.g. private mode) — go to login
        router.push(`/login?verified=1&email=${encodeURIComponent(email)}`);
      }
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const code = digits.join("");
    if (code.length < CODE_LEN) {
      setError(`Please enter all ${CODE_LEN} digits.`);
      return;
    }
    void submit(code);
  }

  // Auto-submit once all 6 digits are entered
  useEffect(() => {
    const code = digits.join("");
    if (code.length === CODE_LEN && !loading && !error) {
      void submit(code);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [digits]);

  async function resend() {
    if (!email || resendIn > 0) return;
    setResending(true);
    setError(null);
    setInfo(null);

    try {
      const res = await fetch("/api/auth/resend-code", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not resend code.");
        return;
      }
      setInfo(`A new code was sent to ${data.codeDeliveredTo ?? email}.`);
      setResendIn(45); // 45-second cooldown
      setDigits(Array(CODE_LEN).fill(""));
      inputRefs.current[0]?.focus();
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setResending(false);
    }
  }

  // Mask email for display
  function maskEmail(e: string) {
    const [local, domain] = e.split("@");
    if (!domain) return e;
    if (local.length <= 2) return `${local[0]}***@${domain}`;
    return `${local.slice(0, 2)}${"*".repeat(Math.max(1, local.length - 3))}${local.slice(-1)}@${domain}`;
  }

  return (
    <div className="rounded-3xl border border-[var(--border-color)] bg-[var(--surface-elevated)] p-8 shadow-xl">
      {/* Logo */}
      <div className="flex items-center gap-2.5 mb-8">
        <Image src="/logo-icon.svg" alt="scriviq" width={36} height={36} />
        <span className="text-[var(--fg-primary)] font-bold tracking-tight text-lg">
          scriviq
        </span>
      </div>

      {/* Icon header */}
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5"
        style={{
          background: "linear-gradient(135deg, rgba(0,114,229,0.15), rgba(117,216,252,0.05))",
          border: "1px solid rgba(0,114,229,0.25)",
        }}
      >
        <Mail size={20} style={{ color: "#0072E5" }} />
      </div>

      <h1 className="text-xl font-semibold text-[var(--fg-primary)] mb-1.5">
        Verify your email
      </h1>
      <p className="text-sm text-[var(--fg-muted)] mb-7 leading-relaxed">
        We sent a 6-digit code to{" "}
        <span className="text-[var(--fg-secondary)] font-medium">
          {email ? maskEmail(email) : "your email"}
        </span>
        . Enter it below to activate your account.
      </p>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/25 text-sm text-red-400">
          {error}
        </div>
      )}
      {info && !error && (
        <div className="mb-4 p-3 rounded-xl flex items-start gap-2 text-sm"
          style={{
            backgroundColor: "rgba(16,185,129,0.08)",
            border: "1px solid rgba(16,185,129,0.25)",
            color: "#10B981",
          }}
        >
          <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
          {info}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* 6-digit code input */}
        <div>
          <label className="block text-sm font-medium text-[var(--fg-secondary)] mb-2">
            Verification code
          </label>
          <div className="flex gap-2 justify-between">
            {digits.map((d, i) => (
              <input
                key={i}
                ref={(el) => { inputRefs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                autoComplete={i === 0 ? "one-time-code" : "off"}
                maxLength={CODE_LEN}
                value={d}
                onChange={(e) => setDigitAt(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                onFocus={(e) => e.currentTarget.select()}
                disabled={loading}
                className="w-full aspect-square rounded-xl text-center text-xl font-mono font-semibold bg-[var(--surface-subtle)] border border-[var(--border-color)] text-[var(--fg-primary)] focus:outline-none transition-colors"
                style={{
                  caretColor: "#0072E5",
                }}
                onFocusCapture={(e) => {
                  e.currentTarget.style.borderColor = "#0072E5";
                  e.currentTarget.style.boxShadow = "0 0 0 3px rgba(0,114,229,0.15)";
                }}
                onBlurCapture={(e) => {
                  e.currentTarget.style.borderColor = "";
                  e.currentTarget.style.boxShadow = "";
                }}
              />
            ))}
          </div>
          <p className="text-xs text-[var(--fg-muted)] mt-2">
            Tip: you can paste the full code into any box.
          </p>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={loading}
          className="w-full"
          glow
        >
          Verify &amp; continue
        </Button>
      </form>

      <div className="mt-6 pt-5 border-t border-[var(--border-subtle)] flex items-center justify-between gap-3 text-sm">
        <button
          type="button"
          onClick={resend}
          disabled={resending || resendIn > 0 || !email}
          className="inline-flex items-center gap-1.5 text-[var(--fg-secondary)] hover:text-[#0072E5] dark:hover:text-[#75D8FC] disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        >
          <RotateCw size={13} className={resending ? "animate-spin" : ""} />
          {resendIn > 0 ? `Resend in ${resendIn}s` : resending ? "Sending..." : "Resend code"}
        </button>

        <Link
          href="/signup"
          className="inline-flex items-center gap-1 text-[var(--fg-muted)] hover:text-[var(--fg-secondary)] transition-colors"
        >
          <ArrowLeft size={13} />
          Use a different email
        </Link>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="rounded-3xl border border-[var(--border-color)] bg-[var(--surface-elevated)] p-8 shadow-xl">
        <div className="h-4 w-32 bg-[var(--surface-subtle)] rounded animate-pulse mb-6" />
        <div className="h-12 w-full bg-[var(--surface-subtle)] rounded-xl animate-pulse" />
      </div>
    }>
      <VerifyInner />
    </Suspense>
  );
}
