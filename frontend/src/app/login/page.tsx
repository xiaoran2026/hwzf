"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

const supportPoints = [
  "Upload a CSV and open your latest revenue leak report",
  "See preview insights before paying",
  "No Shopify API setup required",
];

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await authApi.login({ email, password });
      if (res.data.code === 200) {
        const { token, userId, email: userEmail, plan, role } = res.data.data;
        const user = { id: userId, email: userEmail, plan, role };
        login(token, user);
        router.push(role === "ADMIN" ? "/admin" : "/dashboard");
      } else {
        setError(res.data.message || "Login failed.");
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Login failed. Please try again.");
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            StoreAI Doctor
          </div>

          <p className="mt-8 text-sm font-semibold uppercase tracking-[0.18em] text-orange-600">
            Revenue Leak Checker
          </p>
          <h1 className="mt-4 max-w-xl text-4xl font-bold tracking-tight text-gray-950 sm:text-5xl">
            Welcome back. Open your latest report and keep fixing lost revenue.
          </h1>
          <p className="mt-4 max-w-lg text-base leading-7 text-gray-600">
            Sign in to upload a fresh CSV, compare recent reports, and decide when to unlock the full recovery plan.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-black/5 bg-[#fafaf8] p-4">
              <p className="text-2xl font-bold text-gray-950">CSV</p>
              <p className="mt-1 text-sm text-gray-600">Upload new exports any time you need a refreshed diagnosis</p>
            </div>
            <div className="rounded-2xl border border-black/5 bg-[#fafaf8] p-4">
              <p className="text-2xl font-bold text-gray-950">Reports</p>
              <p className="mt-1 text-sm text-gray-600">Review leaks, quick wins, and revenue recovery ideas</p>
            </div>
            <div className="rounded-2xl border border-black/5 bg-[#fafaf8] p-4">
              <p className="text-2xl font-bold text-gray-950">Trust</p>
              <p className="mt-1 text-sm text-gray-600">Lightweight setup without requiring Shopify API access</p>
            </div>
          </div>

          <div className="mt-8 space-y-3">
            {supportPoints.map((item) => (
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
              View pricing
            </Link>
            <span className="text-gray-300">·</span>
            <Link href="/privacy" className="font-semibold text-gray-700 hover:text-gray-950">
              Data privacy
            </Link>
          </div>
        </section>

        <section className="rounded-[28px] border border-black/5 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-2xl font-bold text-gray-950">Sign in</h2>
          <p className="mt-2 text-sm leading-6 text-gray-600">
            Access your dashboard, recent uploads, and revenue leak reports.
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
                className="w-full rounded-xl border border-gray-200 px-3 py-3 text-sm transition-shadow focus:border-transparent focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Enter your password"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500" />
                <span className="text-sm text-gray-600">Remember me</span>
              </label>
              <Link href="/privacy" className="text-sm font-medium text-gray-900 hover:text-orange-600">
                Privacy
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gray-950 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-medium text-gray-900 hover:text-orange-600">
              Create one free
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
}
