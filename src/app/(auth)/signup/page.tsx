"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", email: "", company: "", password: "" });

  function set(key: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email:    form.email,
          password: form.password,
          name:     form.name,
          company:  form.company,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Sign-up failed. Please try again.");
        return;
      }

      // Stash password in sessionStorage so the verify page can auto-login.
      // Cleared automatically when the verify flow completes or the tab closes.
      try {
        sessionStorage.setItem("scriviq:pending-password", form.password);
        sessionStorage.setItem("scriviq:pending-email",    data.email);
      } catch {
        // sessionStorage may be unavailable in private mode — verify page
        // will fall back to asking the user to sign in after confirmation.
      }

      router.push(`/verify?email=${encodeURIComponent(data.email)}`);
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
        <Image src="/logo-icon.svg" alt="scriviq" width={36} height={36} />
        <span className="text-[var(--fg-primary)] font-bold tracking-tight text-lg">
          scriviq
        </span>
      </div>

      <h1 className="text-xl font-semibold text-[var(--fg-primary)] mb-1">
        Start your free trial
      </h1>
      <p className="text-sm text-[var(--fg-muted)] mb-7">
        14 days free · No credit card required.
      </p>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/25 text-sm text-red-400">
          {error}
        </div>
      )}

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
          minLength={8}
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

      <p className="text-center text-xs text-[var(--fg-muted)] mt-4">
        By signing up you agree to our{" "}
        <a href="#" className="text-[var(--fg-secondary)] hover:underline">Terms</a> and{" "}
        <a href="#" className="text-[var(--fg-secondary)] hover:underline">Privacy Policy</a>.
      </p>

      <p className="text-center text-sm text-[var(--fg-muted)] mt-4">
        Already have an account?{" "}
        <Link href="/login" className="text-[#0072E5] dark:text-[#75D8FC] hover:underline font-medium">
          Sign in
        </Link>
      </p>
    </div>
  );
}
