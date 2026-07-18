"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

const quickFacts = [
  "Upload Shopify, WooCommerce, or Amazon CSVs",
  "See money lost, top leaks, and quick wins",
  "No API connection required",
];

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const res = await authApi.register({ email, password });
      if (res.data.code === 200) {
        const loginRes = await authApi.login({ email, password });
        if (loginRes.data.code === 200) {
          const { token, userId, email: userEmail, plan, role } = loginRes.data.data;
          const user = { id: userId, email: userEmail, plan, role };
          login(token, user);
          router.push("/dashboard");
        } else {
          router.push("/login");
        }
      } else {
        setError(res.data.message || "Registration failed.");
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafaf8] px-4 py-10 sm:px-6">
      <div className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <section className="rounded-[28px] border border-black/5 bg-white p-8 shadow-sm sm:p-10">
          <div className="inline-flex items-center gap-3 rounded-full border border-black/5 bg-[#fafaf8] px-3 py-2 text-sm font-medium text-gray-700">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-950 text-white">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            StoreAI Doctor
          </div>

          <p className="mt-8 text-sm font-semibold uppercase tracking-[0.18em] text-orange-600">
            Revenue Leak Checker
          </p>
          <h1 className="mt-4 max-w-xl text-4xl font-bold tracking-tight text-gray-950 sm:text-5xl">
            Create your account and get your first revenue leak report fast.
          </h1>
          <p className="mt-4 max-w-lg text-base leading-7 text-gray-600">
            Start with one free report preview, see where revenue is leaking, then decide if you want to unlock the full report.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-black/5 bg-[#fafaf8] p-4">
              <p className="text-2xl font-bold text-gray-950">3 min</p>
              <p className="mt-1 text-sm text-gray-600">to create an account and upload your first CSV</p>
            </div>
            <div className="rounded-2xl border border-black/5 bg-[#fafaf8] p-4">
              <p className="text-2xl font-bold text-gray-950">Free</p>
              <p className="mt-1 text-sm text-gray-600">one store, one report preview, basic diagnosis</p>
            </div>
            <div className="rounded-2xl border border-black/5 bg-[#fafaf8] p-4">
              <p className="text-2xl font-bold text-gray-950">No API</p>
              <p className="mt-1 text-sm text-gray-600">just upload a CSV and review the report</p>
            </div>
          </div>

          <div className="mt-8 space-y-3">
            {quickFacts.map((item) => (
              <div key={item} className="flex items-start gap-3 text-sm text-gray-700">
                <svg className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>{item}</span>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3 text-sm">
            <Link href="/demo" className="font-semibold text-orange-600 hover:text-orange-700">
              View demo report
            </Link>
            <span className="text-gray-300">·</span>
            <Link href="/pricing" className="font-semibold text-gray-700 hover:text-gray-950">
              See pricing
            </Link>
            <span className="text-gray-300">·</span>
            <Link href="/privacy" className="font-semibold text-gray-700 hover:text-gray-950">
              Data privacy
            </Link>
          </div>
        </section>

        <section className="rounded-[28px] border border-black/5 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-2xl font-bold text-gray-950">Create your account</h2>
          <p className="mt-2 text-sm leading-6 text-gray-600">
            Start free. Upload a CSV after signup and generate your first diagnosis.
          </p>

          {error && (
            <div className="mt-4 rounded-2xl border border-red-100 bg-red-50 p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-xl border border-gray-200 px-3 py-3 text-sm transition-shadow focus:border-transparent focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="w-full rounded-xl border border-gray-200 px-3 py-3 text-sm transition-shadow focus:border-transparent focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="At least 8 characters"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="mb-1 block text-sm font-medium text-gray-700">
                Confirm password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full rounded-xl border border-gray-200 px-3 py-3 text-sm transition-shadow focus:border-transparent focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Repeat your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gray-950 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Creating account..." : "Create account"}
            </button>

            <p className="text-xs leading-6 text-gray-500">
              By creating an account, you agree to our{" "}
              <Link href="/terms" className="font-medium text-gray-900 hover:text-orange-600">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="font-medium text-gray-900 hover:text-orange-600">
                Privacy Policy
              </Link>
              .
            </p>
          </form>

          <div className="mt-6 rounded-2xl border border-orange-100 bg-orange-50/70 p-4">
            <p className="text-sm font-semibold text-gray-950">Data handling</p>
            <p className="mt-1 text-sm leading-6 text-gray-600">
              We use your CSV only to generate the diagnosis report, avoid unnecessary customer identifiers, and do not keep original files longer than needed.
            </p>
          </div>

          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-gray-900 hover:text-orange-600">
              Sign in
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
}
