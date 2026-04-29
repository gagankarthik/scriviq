"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Zap, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function LoginPage() {
  const router = useRouter();
  const [loading,  setLoading]  = useState(false);
  const [email,    setEmail]    = useState("");
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
        body:    JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        router.push("/dashboard");
      } else {
        setError(data.error ?? "Invalid email or password.");
      }
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
        <div
          className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shrink-0"
          style={{ boxShadow: "0 0 18px rgb(79 70 229 / 0.4)" }}
        >
          <Zap size={18} strokeWidth={2.5} />
        </div>
        <span className="text-[var(--fg-primary)] font-bold tracking-tight text-lg">scriviq</span>
      </div>

      <h1 className="text-xl font-bold text-[var(--fg-primary)] mb-1">Welcome back</h1>
      <p className="text-sm text-[var(--fg-muted)] mb-7">Sign in to your workspace to continue.</p>

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
            <a href="#" className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">
              Forgot password?
            </a>
          </div>
        </div>

        {error && <p className="text-xs text-red-500">{error}</p>}

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
        New to scriviq?{" "}
        <Link href="/signup" className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold">
          Start free trial →
        </Link>
      </p>
    </div>
  );
}
