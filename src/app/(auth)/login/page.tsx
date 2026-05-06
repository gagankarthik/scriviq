"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

function LoginInner() {
  const router       = useRouter();
  const searchParams = useSearchParams();

  const emailFromUrl = searchParams.get("email") ?? "";
  const verified     = searchParams.get("verified") === "1";

  const [loading,  setLoading]  = useState(false);
  const [email,    setEmail]    = useState(emailFromUrl);
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });
      const data = await res.json();

      if (res.ok) {
        router.push("/dashboard");
        return;
      }

      // Unconfirmed — redirect to verify page with pre-filled email
      if (data.code === "USER_NOT_CONFIRMED") {
        router.push(`/verify?email=${encodeURIComponent(email.trim().toLowerCase())}`);
        return;
      }

      setError(data.error ?? "Sign in failed. Please try again.");
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-3xl border border-[var(--border-color)] bg-[var(--surface-elevated)] p-8 shadow-xl">
      {/* Logo */}
      <div className="flex items-center gap-2.5 mb-8">
        <Image src="/logo.png" alt="Blue-IQ Govern" width={130} height={30} />
      </div>

      <h1 className="text-xl font-bold text-[var(--fg-primary)] mb-1">Welcome back</h1>
      <p className="text-sm text-[var(--fg-muted)] mb-7">Sign in to your workspace to continue.</p>

      {/* Verified success banner */}
      {verified && (
        <div
          className="flex items-start gap-2.5 p-3 rounded-xl mb-5 text-sm"
          style={{
            backgroundColor: "rgba(16,185,129,0.08)",
            border: "1px solid rgba(16,185,129,0.25)",
            color: "#10B981",
          }}
        >
          <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
          <span>
            <strong>Email verified!</strong> You can now sign in.
          </span>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/25 text-sm text-red-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Work email"
          id="email"
          type="email"
          placeholder="you@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <div>
          <Input
            label="Password"
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <div className="flex justify-end mt-1.5">
            <a href="#" className="text-xs text-[#0072E5] dark:text-[#75D8FC] hover:underline">
              Forgot password?
            </a>
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={loading}
          className="w-full mt-2"
          glow
        >
          {!loading && <ArrowRight size={15} />}
          Sign in
        </Button>
      </form>

      <p className="text-center text-sm text-[var(--fg-muted)] mt-6">
        New to Blue-IQ Govern?{" "}
        <Link href="/signup" className="text-[#0072E5] dark:text-[#75D8FC] hover:underline font-semibold">
          Start free trial →
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="rounded-3xl border border-[var(--border-color)] bg-[var(--surface-elevated)] p-8 shadow-xl">
        <div className="h-4 w-32 bg-[var(--surface-subtle)] rounded animate-pulse mb-6" />
        <div className="space-y-4">
          <div className="h-11 w-full bg-[var(--surface-subtle)] rounded-xl animate-pulse" />
          <div className="h-11 w-full bg-[var(--surface-subtle)] rounded-xl animate-pulse" />
          <div className="h-11 w-full bg-[var(--surface-subtle)] rounded-xl animate-pulse" />
        </div>
      </div>
    }>
      <LoginInner />
    </Suspense>
  );
}
