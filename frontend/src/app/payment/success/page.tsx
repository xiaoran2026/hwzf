"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { paymentApi } from "@/lib/api";

type UnlockStatus = "checking" | "unlocked" | "pending" | "guest";

export default function PaymentSuccessPage() {
  const { user, token, isLoading } = useAuth();
  const [status, setStatus] = useState<UnlockStatus>("checking");
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    if (isLoading) return;
    if (!user && !token) {
      setStatus("guest");
      return;
    }

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    async function checkAccess(round = 0) {
      try {
        const res = await paymentApi.getUsage();
        const plan = res?.data?.data?.plan?.toUpperCase();
        if (cancelled) return;

        if (plan && plan !== "FREE") {
          setStatus("unlocked");
          return;
        }

        if (round >= 5) {
          setStatus("pending");
          return;
        }

        setStatus("checking");
        setAttempts(round + 1);
        timer = setTimeout(() => checkAccess(round + 1), 3000);
      } catch {
        if (cancelled) return;
        if (round >= 5) {
          setStatus("pending");
          return;
        }
        setAttempts(round + 1);
        timer = setTimeout(() => checkAccess(round + 1), 3000);
      }
    }

    checkAccess(0);

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [isLoading, token, user]);

  const content = useMemo(() => {
    if (status === "guest") {
      return {
        badge: "Payment received",
        title: "Finish sign-in to sync your full report access.",
        body: "Your payment looks complete. Sign in with the same email used at checkout so the webhook can match and unlock your account.",
      };
    }

    if (status === "unlocked") {
      return {
        badge: "Full report unlocked",
        title: "Your access is ready.",
        body: "The full revenue leak report is now available. Open your report or upload a new CSV to keep going.",
      };
    }

    if (status === "pending") {
      return {
        badge: "Payment received",
        title: "We are still syncing your unlock.",
        body: "Gumroad webhooks can take a few seconds. Your purchase looks complete, but access has not refreshed yet.",
      };
    }

    return {
      badge: "Payment received",
      title: "Checking your unlock status…",
      body: "We are confirming your payment and updating your account access now.",
    };
  }, [status]);

  return (
    <div className="min-h-[70vh] px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-600">{content.badge}</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-gray-950 sm:text-4xl">{content.title}</h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-gray-600 sm:text-base">{content.body}</p>

        {status === "checking" && (
          <p className="mt-3 text-xs text-gray-500">Checking access update {attempts > 0 ? `(${attempts}/6)` : ""}</p>
        )}

        <div className="mt-8 grid gap-4 lg:grid-cols-[1fr_0.9fr]">
          <section className="rounded-[28px] border border-black/5 bg-white p-6">
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-400">What happens now</p>
                <p className="mt-2 text-sm font-semibold text-gray-950">Webhook sync</p>
                <p className="mt-2 text-sm leading-6 text-gray-600">Your purchase is matched to your account email and upgrades access.</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-400">Typical timing</p>
                <p className="mt-2 text-sm font-semibold text-gray-950">A few seconds</p>
                <p className="mt-2 text-sm leading-6 text-gray-600">Most unlocks appear quickly after Gumroad sends the webhook.</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-400">Need help</p>
                <p className="mt-2 text-sm font-semibold text-gray-950">Support available</p>
                <p className="mt-2 text-sm leading-6 text-gray-600">If access still looks locked, contact support with the checkout email.</p>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              {status === "guest" ? (
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center rounded-xl bg-gray-950 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-gray-800"
                >
                  Sign in
                </Link>
              ) : (
                <Link
                  href="/reports"
                  className="inline-flex items-center justify-center rounded-xl bg-gray-950 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-gray-800"
                >
                  Open my reports
                </Link>
              )}
              <Link
                href="/stores"
                className="inline-flex items-center justify-center rounded-xl border border-black/10 px-4 py-3 text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-50"
              >
                Upload another CSV
              </Link>
              <Link
                href="/billing"
                className="inline-flex items-center justify-center rounded-xl border border-black/10 px-4 py-3 text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-50"
              >
                View billing
              </Link>
            </div>
          </section>

          <aside className="rounded-[28px] border border-emerald-200 bg-emerald-50/70 p-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-700">Full report</p>
            <h2 className="mt-3 text-xl font-bold text-gray-950">You unlock the full leak breakdown and recovery plan.</h2>
            <p className="mt-3 text-sm leading-7 text-gray-700">
              No subscription required. If the page still shows Free after a short wait, refresh once or check billing again.
            </p>
            <div className="mt-5 space-y-2 text-sm text-gray-700">
              <div className="flex items-center justify-between">
                <span>Full leak breakdown</span>
                <span className="font-semibold text-gray-950">Included</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Recovery actions</span>
                <span className="font-semibold text-gray-950">Included</span>
              </div>
              <div className="flex items-center justify-between">
                <span>PDF export</span>
                <span className="font-semibold text-gray-950">Included</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
