"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import api, { paymentApi } from "@/lib/api";
import type { UsageSummary } from "@/lib/types";
import Loading from "@/components/ui/Loading";
import { useAuth } from "@/contexts/AuthContext";
import UnlockButton from "@/components/payment/UnlockButton";

interface PaymentRecord {
  id: number;
  amount: number;
  currency: string;
  status: string;
  plan: string;
  createdAt: string;
}

interface Usage {
  currentPlan: string;
  storesUsed: number;
  storeLimit: number;
  csvRowsUsed: number;
  csvRowLimit: number;
  remainingQuota: number;
  nextResetDate: string | null;
  storeUsagePct: number;
  csvUsagePct: number;
  storeLimitDisplay: string;
  csvRowLimitDisplay: string;
  remainingDisplay: string;
}

interface Billing {
  currentPlan: string;
  canUpgrade: boolean;
  canCancel: boolean;
  subscription: unknown;
  paymentHistory: PaymentRecord[];
  usage: Usage;
}

const faqItems = [
  {
    q: "What does the free plan include?",
    a: "Free includes one store, one report preview, and a simple diagnosis so you can verify the value before paying.",
  },
  {
    q: "What do I unlock when I upgrade?",
    a: "Upgrade unlocks the full report, more uploads, more reports, and a deeper revenue recovery plan.",
  },
  {
    q: "Do I need a Shopify API connection?",
    a: "No. This product stays CSV-first so setup is lightweight and trust barriers stay lower.",
  },
  {
    q: "How is my CSV handled?",
    a: "CSV data is used to generate the diagnosis report. Original files should not be kept longer than needed, and unnecessary customer identifiers should be avoided.",
  },
];

const SUPPORT_EMAIL = "support@store-leak.com";

const fmtCurrency = (v: number, cur = "USD") =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: cur,
    maximumFractionDigits: 2,
  }).format(v);

const fmtDate = (d: string) => {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return d;
  }
};

const fmtNumber = (v: number) => new Intl.NumberFormat("en-US").format(v);

function ProgressBar({ pct, color }: { pct: number; color: string }) {
  const clamped = Math.min(100, Math.max(0, pct));
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
      <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${clamped}%` }} />
    </div>
  );
}

export default function BillingPage() {
  const { user, token, isLoading: authLoading } = useAuth();
  const [billing, setBilling] = useState<Billing | null>(null);
  const [usage, setUsage] = useState<UsageSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    if (authLoading) return;
    if (!user && !token) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const [billingRes, usageRes] = await Promise.allSettled([api.get("/payment/billing"), paymentApi.getUsage()]);

        if (!cancelled && billingRes.status === "fulfilled" && billingRes.value.data.code === 200) {
          setBilling(billingRes.value.data.data);
        }

        if (!cancelled && usageRes.status === "fulfilled" && usageRes.value.data.code === 200) {
          setUsage(usageRes.value.data.data);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.message || "Failed to load billing info.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [authLoading, token, user]);

  const currentPlan = billing?.currentPlan?.toUpperCase() || usage?.plan?.toUpperCase() || "FREE";
  const isFree = currentPlan === "FREE";

  const accessSummary = useMemo(() => {
    if (!usage) return { planLabel: isFree ? "Free" : "Full Report", uploads: "—", stores: "—", reports: "—" };

    return {
      planLabel: isFree ? "Free" : "Full Report",
      uploads: usage.unlimitedUploads ? "Unlimited" : `${usage.uploadCount} / ${usage.uploadLimit ?? 0}`,
      stores: usage.unlimitedStores ? "Unlimited" : `${usage.storeCount} / ${usage.storeLimit ?? 0}`,
      reports: usage.reportLimit === null ? "Unlimited" : `${usage.reportCount} / ${usage.reportLimit}`,
    };
  }, [isFree, usage]);

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center px-4 py-32 sm:px-6">
        <Loading text="Loading access..." />
      </div>
    );
  }

  if (!user && !token) {
    return (
      <div className="max-w-6xl px-4 sm:px-6">
        <section className="mb-8 overflow-hidden rounded-[28px] border border-black/5 bg-white">
          <div className="grid gap-8 px-6 py-8 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-orange-600">Unlock full report</p>
              <h1 className="mt-3 text-3xl font-bold tracking-tight text-gray-950 sm:text-4xl">
                Sign in to unlock the full revenue leak report.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-gray-600 sm:text-base">
                One-time unlock. No subscription required. Create your account first, upload a CSV, then unlock when the preview proves value.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center rounded-xl bg-gray-950 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-gray-800"
                >
                  Create account
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center rounded-xl border border-black/10 px-4 py-3 text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-50"
                >
                  Sign in
                </Link>
                <Link
                  href="/demo"
                  className="inline-flex items-center justify-center rounded-xl border border-black/10 px-4 py-3 text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-50"
                >
                  View demo report
                </Link>
              </div>
            </div>
            <div className="rounded-2xl border border-orange-200 bg-orange-50/60 p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-orange-700">Full report</p>
              <div className="mt-3 flex items-end gap-2">
                <h2 className="text-2xl font-bold text-gray-950">$19</h2>
                <span className="pb-0.5 text-sm text-gray-600">one-time</span>
              </div>
              <p className="mt-2 text-sm leading-7 text-gray-700">
                Unlock the full breakdown, all recovery actions, and PDF export.
              </p>
              <Link
                href="/pricing"
                className="mt-5 inline-flex w-full items-center justify-center rounded-lg border border-orange-200 bg-white px-4 py-2.5 text-sm font-semibold text-orange-700 transition-colors hover:bg-orange-100"
              >
                View pricing
              </Link>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="max-w-6xl px-4 sm:px-6">
      <section className="mb-8 overflow-hidden rounded-[28px] border border-black/5 bg-white">
        <div className="grid gap-8 px-6 py-8 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-orange-600">Access and upgrade</p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-gray-950 sm:text-4xl">
              Keep billing focused on unlocking the full revenue leak report.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-gray-600 sm:text-base">
              This page is no longer a subscription-heavy SaaS control center. It explains what your current access includes, what unlocks next, and how your CSV workflow stays lightweight.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 rounded-xl bg-gray-950 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-gray-800"
              >
                View pricing
              </Link>
              <Link
                href="/demo"
                className="inline-flex items-center gap-2 rounded-xl border border-black/10 px-4 py-3 text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-50"
              >
                View demo report
              </Link>
              <Link
                href="/privacy"
                className="inline-flex items-center gap-2 rounded-xl border border-black/10 px-4 py-3 text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-50"
              >
                Data privacy
              </Link>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            <div className="rounded-2xl border border-black/5 bg-[#fafaf8] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">Current access</p>
              <p className="mt-2 text-2xl font-bold text-gray-950">{accessSummary.planLabel}</p>
              <p className="mt-1 text-sm text-gray-600">{isFree ? "Preview before paying" : "Expanded report access"}</p>
            </div>
            <div className="rounded-2xl border border-black/5 bg-[#fafaf8] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">Uploads</p>
              <p className="mt-2 text-2xl font-bold text-gray-950">{accessSummary.uploads}</p>
              <p className="mt-1 text-sm text-gray-600">CSV-based workflow only</p>
            </div>
            <div className="rounded-2xl border border-black/5 bg-[#fafaf8] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">Reports</p>
              <p className="mt-2 text-2xl font-bold text-gray-950">{accessSummary.reports}</p>
              <p className="mt-1 text-sm text-gray-600">Stores {accessSummary.stores}</p>
            </div>
          </div>
        </div>
      </section>

      {error && (
        <div className="mb-6 rounded-2xl border border-red-100 bg-red-50 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {usage && (
        <section className="mb-8 grid gap-4 lg:grid-cols-3">
          <div className="rounded-[24px] border border-gray-100 bg-white p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-400">Store usage</p>
            <div className="mt-3 flex items-center justify-between">
              <p className="text-2xl font-bold text-gray-950">{usage.unlimitedStores ? "Unlimited" : `${usage.storeCount} / ${usage.storeLimit}`}</p>
              <p className="text-xs text-gray-500">{usage.planDisplay}</p>
            </div>
            <div className="mt-3">
              <ProgressBar pct={usage.storeUsagePct} color={usage.storeUsagePct >= 100 ? "bg-red-500" : "bg-orange-500"} />
            </div>
            <p className="mt-2 text-sm text-gray-600">
              {usage.unlimitedStores ? "Add more stores whenever you need." : `${usage.remainingStoreSlots} slot(s) remaining.`}
            </p>
          </div>

          <div className="rounded-[24px] border border-gray-100 bg-white p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-400">Upload usage</p>
            <div className="mt-3 flex items-center justify-between">
              <p className="text-2xl font-bold text-gray-950">{usage.unlimitedUploads ? "Unlimited" : `${usage.uploadCount} / ${usage.uploadLimit}`}</p>
              <p className="text-xs text-gray-500">CSV uploads</p>
            </div>
            <div className="mt-3">
              <ProgressBar pct={usage.uploadUsagePct} color={usage.uploadUsagePct >= 100 ? "bg-red-500" : "bg-emerald-500"} />
            </div>
            <p className="mt-2 text-sm text-gray-600">
              {usage.unlimitedUploads ? "Keep refreshing reports with new exports." : `${usage.remainingUploads} upload(s) remaining.`}
            </p>
          </div>

          <div className="rounded-[24px] border border-gray-100 bg-white p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-400">CSV row limit</p>
            <p className="mt-3 text-2xl font-bold text-gray-950">{fmtNumber(usage.maxCsvRows)}</p>
            <p className="mt-2 text-sm text-gray-600">Maximum rows per upload. Keep files focused and clean before diagnosis.</p>
          </div>
        </section>
      )}

      <section className="mb-8 grid gap-4 lg:grid-cols-2">
        <div className="rounded-[24px] border border-gray-100 bg-white p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-400">Free</p>
          <h2 className="mt-3 text-2xl font-bold text-gray-950">$0</h2>
          <p className="mt-2 text-sm leading-7 text-gray-600">
            Good for validating the product quickly before paying.
          </p>
          <div className="mt-5 space-y-3 text-sm text-gray-700">
            <div className="flex items-start gap-3">
              <svg className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>1 store</span>
            </div>
            <div className="flex items-start gap-3">
              <svg className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>1 report preview</span>
            </div>
            <div className="flex items-start gap-3">
              <svg className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Basic diagnosis and preview report</span>
            </div>
          </div>
          <div className="mt-6">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-lg border border-black/10 px-4 py-2.5 text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-50"
            >
              Continue with free
            </Link>
          </div>
        </div>

        <div className="rounded-[24px] border border-orange-200 bg-orange-50/60 p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-orange-700">Full report</p>
          <div className="mt-3 flex items-end gap-2">
            <h2 className="text-2xl font-bold text-gray-950">$19</h2>
            <span className="pb-0.5 text-sm text-gray-600">one-time</span>
          </div>
          <p className="mt-2 text-sm leading-7 text-gray-700">
            Built for sellers who already see value in the preview and want the deeper recovery plan.
          </p>
          <div className="mt-5 space-y-3 text-sm text-gray-800">
            <div className="flex items-start gap-3">
              <svg className="mt-0.5 h-4 w-4 shrink-0 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>Full revenue leak report</span>
            </div>
            <div className="flex items-start gap-3">
              <svg className="mt-0.5 h-4 w-4 shrink-0 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>Priority actions, impact, and recovery ideas</span>
            </div>
            <div className="flex items-start gap-3">
              <svg className="mt-0.5 h-4 w-4 shrink-0 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>No subscription required</span>
            </div>
          </div>
          <div className="mt-6">
            <UnlockButton
              fullWidth
              className="inline-flex w-full items-center justify-center rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>
        </div>
      </section>

      <section className="mb-8 rounded-[24px] border border-gray-100 bg-white p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-400">Trust and data handling</p>
            <h2 className="mt-3 text-2xl font-bold text-gray-950">Keep setup simple and data exposure low.</h2>
            <p className="mt-3 text-sm leading-7 text-gray-600">
              The product stays CSV-first, avoids unnecessary identifiers, and should not keep original CSV files after parsing and report generation.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/privacy"
              className="inline-flex items-center justify-center rounded-lg border border-black/10 px-4 py-2.5 text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-50"
            >
              Privacy policy
            </Link>
            <Link
              href="/terms"
              className="inline-flex items-center justify-center rounded-lg border border-black/10 px-4 py-2.5 text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-50"
            >
              Terms of service
            </Link>
          </div>
        </div>
      </section>

      <section className="mb-8 rounded-[24px] border border-gray-100 bg-white p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-400">Payment history</p>
            <h2 className="mt-2 text-2xl font-bold text-gray-950">Invoices</h2>
          </div>
          <Link href="/pricing" className="text-sm font-semibold text-orange-600 hover:text-orange-700">
            View pricing
          </Link>
        </div>

        {billing?.paymentHistory && billing.paymentHistory.length > 0 ? (
          <div className="mt-5 space-y-3">
            {billing.paymentHistory.map((record) => (
              <div key={record.id} className="flex flex-col gap-3 rounded-2xl border border-gray-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-950">{record.plan} plan</p>
                  <p className="mt-1 text-xs text-gray-500">{fmtDate(record.createdAt)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-gray-950">{fmtCurrency(record.amount, record.currency)}</span>
                  <span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${record.status === "COMPLETED" ? "bg-emerald-50 text-emerald-700" : record.status === "PENDING" ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-700"}`}>
                    {record.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-5 rounded-2xl bg-[#fafaf8] p-6 text-center">
            <p className="text-sm font-semibold text-gray-950">No invoices yet</p>
            <p className="mt-2 text-sm text-gray-600">Your payment history appears here after your first successful unlock.</p>
          </div>
        )}
      </section>

      <section className="mb-8 grid gap-4 lg:grid-cols-[1fr_0.9fr]">
        <div className="rounded-[24px] border border-gray-100 bg-white p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-400">FAQ</p>
          <h2 className="mt-2 text-2xl font-bold text-gray-950">Common questions</h2>
          <div className="mt-5 space-y-2">
            {faqItems.map((faq, index) => (
              <div key={faq.q} className="overflow-hidden rounded-2xl border border-gray-100">
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="flex w-full items-center justify-between px-4 py-4 text-left"
                >
                  <span className="text-sm font-semibold text-gray-900">{faq.q}</span>
                  <svg className={`h-4 w-4 text-gray-400 transition-transform ${openFaq === index ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openFaq === index && (
                  <div className="px-4 pb-4">
                    <p className="text-sm leading-7 text-gray-600">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[24px] border border-gray-100 bg-white p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-400">Support</p>
          <h2 className="mt-2 text-2xl font-bold text-gray-950">Need help before upgrading?</h2>
          <p className="mt-3 text-sm leading-7 text-gray-600">
            If you are unsure whether the preview is enough or want help understanding the diagnosis, contact support before paying.
          </p>
          <div className="mt-6 rounded-2xl bg-[#fafaf8] p-4">
            <p className="text-sm font-semibold text-gray-950">Email support</p>
            <p className="mt-1 text-sm text-gray-600">Average response time is within 24 hours.</p>
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="mt-4 inline-flex items-center justify-center rounded-lg bg-gray-950 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-gray-800"
            >
              {SUPPORT_EMAIL}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
