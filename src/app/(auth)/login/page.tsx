"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 900));
    router.push("/dashboard");
  }

  return (
    <div className="rounded-3xl border border-slate-800/60 bg-slate-900/40 p-8">
      {/* Logo */}
      <div className="flex items-center gap-2.5 mb-8">
        <div
          className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold"
          style={{ boxShadow: "0 0 18px rgb(79 70 229 / 0.4)" }}
        >
          C
        </div>
        <span className="text-white font-semibold tracking-tight text-lg">
          scriviq
        </span>
      </div>

      <h1 className="text-xl font-semibold text-white mb-1">Welcome back</h1>
      <p className="text-sm text-slate-500 mb-7">
        Sign in to your workspace to continue.
      </p>

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
            <a href="#" className="text-xs text-indigo-400 hover:underline">
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
          Sign in
        </Button>
      </form>

      <p className="text-center text-sm text-slate-500 mt-6">
        New to scriviq?{" "}
        <Link href="/signup" className="text-indigo-400 hover:underline font-medium">
          Start free trial →
        </Link>
      </p>
    </div>
  );
}
