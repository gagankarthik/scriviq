"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", company: "", password: "" });

  function set(key: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1100));
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

      <h1 className="text-xl font-semibold text-white mb-1">
        Start your free trial
      </h1>
      <p className="text-sm text-slate-500 mb-7">
        14 days free · No credit card required.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Full name"
          id="name"
          type="text"
          placeholder="Your name"
          value={form.name}
          onChange={set("name")}
          required
        />
        <Input
          label="Work email"
          id="email"
          type="email"
          placeholder="you@company.com"
          value={form.email}
          onChange={set("email")}
          required
        />
        <Input
          label="Company / Agency name"
          id="company"
          type="text"
          placeholder="Acme Agency"
          value={form.company}
          onChange={set("company")}
          required
        />
        <Input
          label="Password"
          id="password"
          type="password"
          placeholder="Min. 8 characters"
          value={form.password}
          onChange={set("password")}
          required
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={loading}
          className="w-full mt-2"
          glow
        >
          Create account
        </Button>
      </form>

      <p className="text-center text-xs text-slate-600 mt-4">
        By signing up you agree to our{" "}
        <a href="#" className="text-slate-500 hover:underline">Terms</a> and{" "}
        <a href="#" className="text-slate-500 hover:underline">Privacy Policy</a>.
      </p>

      <p className="text-center text-sm text-slate-500 mt-4">
        Already have an account?{" "}
        <Link href="/login" className="text-indigo-400 hover:underline font-medium">
          Sign in
        </Link>
      </p>
    </div>
  );
}
