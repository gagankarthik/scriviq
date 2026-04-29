"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
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

  // Pull email from sessionStorage if missing from URL
  useEffect(() => {
    if (!email) {
      try {
        const stored = sessionStorage.getItem("scriviq:pending-email");
        if (stored) setEmail(stored);
      } catch {}
    }
    inputRefs.current[0]?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Countdown ticker for resend cooldown
  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setInterval(() => setResendIn((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [resendIn]);

  const submit = useCallback(
    async (code: string, currentEmail: string) => {
      if (!currentEmail) {
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
          body: JSON.stringify({
            email: currentEmail,
            code,
            ...(storedPassword ? { password: storedPassword } : {}),
          }),
        });
        const data = await res.json();

        if (!res.ok) {
          setError(data.error ?? "Verification failed. Please try again.");
          return;
        }

        try {
          sessionStorage.removeItem("scriviq:pending-password");
          sessionStorage.removeItem("scriviq:pending-email");
        } catch {}

        if (data.loggedIn) {
          router.push("/dashboard");
        } else {
          router.push(`/login?verified=1&email=${encodeURIComponent(currentEmail)}`);
        }
      } catch {
        setError("Network error. Please check your connection.");
      } finally {
        setLoading(false);
      }
    },
    [router]
  );

  function setDigitAt(idx: number, raw: string) {
    // Handle paste of full code into any box
    const digits_only = raw.replace(/\D/g, "");
    if (digits_only.length > 1) {
      const filled = Array.from({ length: CODE_LEN }, (_, i) => digits_only[i] ?? "");
      setDigits(filled);
      const focusIdx = Math.min(digits_only.length, CODE_LEN) - 1;
      inputRefs.current[focusIdx]?.focus();
      return;
    }
    const ch = digits_only.slice(0, 1);
    setDigits((prev) => {
      const copy = [...prev];
      copy[idx]  = ch;
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
    if (e.key === "ArrowLeft"  && idx > 0)            inputRefs.current[idx - 1]?.focus();
    if (e.key === "ArrowRight" && idx < CODE_LEN - 1) inputRefs.current[idx + 1]?.focus();
  }

  // Auto-submit when all digits filled — guards against empty email race
  useEffect(() => {
    const code = digits.join("");
    if (code.length === CODE_LEN && email && !loading) {
      void submit(code, email);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [digits, email]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const code = digits.join("");
    if (code.length < CODE_LEN) {
      setError(`Please enter all ${CODE_LEN} digits.`);
      return;
    }
    void submit(code, email);
  }

  const resend = useCallback(async () => {
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
      setInfo(`New code sent to ${data.codeDeliveredTo ?? email}.`);
      setResendIn(45);
      setDigits(Array(CODE_LEN).fill(""));
      inputRefs.current[0]?.focus();
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setResending(false);
    }
  }, [email, resendIn]);

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
        <span className="text-[var(--fg-primary)] font-bold tracking-tight text-lg">scriviq</span>
      </div>

      {/* Icon */}
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
        <div
          className="mb-4 p-3 rounded-xl flex items-start gap-2 text-sm"
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
        <div>
          <label className="block text-sm font-medium text-[var(--fg-secondary)] mb-3">
            Verification code
          </label>
          <div className="flex gap-2">
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
                disabled={loading}
                className="flex-1 min-w-0 aspect-square rounded-xl text-center text-xl font-mono font-semibold bg-[var(--surface-subtle)] border border-[var(--border-color)] text-[var(--fg-primary)] focus:outline-none transition-all"
                onFocus={(e) => {
                  e.currentTarget.select();
                  e.currentTarget.style.borderColor = "#0072E5";
                  e.currentTarget.style.boxShadow   = "0 0 0 3px rgba(0,114,229,0.15)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "";
                  e.currentTarget.style.boxShadow   = "";
                }}
              />
            ))}
          </div>
          <p className="text-xs text-[var(--fg-muted)] mt-2">
            You can paste the full code into any box.
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
          Different email
        </Link>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="rounded-3xl border border-[var(--border-color)] bg-[var(--surface-elevated)] p-8 shadow-xl">
          <div className="h-4 w-32 bg-[var(--surface-subtle)] rounded animate-pulse mb-6" />
          <div className="h-12 w-full bg-[var(--surface-subtle)] rounded-xl animate-pulse" />
        </div>
      }
    >
      <VerifyInner />
    </Suspense>
  );
}
