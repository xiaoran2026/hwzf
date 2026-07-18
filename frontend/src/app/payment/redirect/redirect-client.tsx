"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

function safeDecode(v: string) {
  try {
    return decodeURIComponent(v);
  } catch {
    return v;
  }
}

export default function RedirectClient() {
  const router = useRouter();
  const search = useSearchParams();
  const [copied, setCopied] = useState(false);

  const url = useMemo(() => {
    const fromQuery = search.get("to");
    if (fromQuery) return safeDecode(fromQuery);
    if (typeof window === "undefined") return null;
    return window.sessionStorage.getItem("paymentRedirectUrl");
  }, [search]);

  useEffect(() => {
    if (!url) return;
    const t = window.setTimeout(() => {
      window.location.href = url;
    }, 650);
    return () => window.clearTimeout(t);
  }, [url]);

  async function copyLink() {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {}
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 sm:px-6 py-16">
      <div className="w-full max-w-xl">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-orange-600">Redirecting to checkout</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-gray-950">Opening the payment page…</h1>
        <p className="mt-4 text-sm leading-7 text-gray-600">
          If the checkout page doesn’t open automatically, use the buttons below.
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => url && (window.location.href = url)}
            disabled={!url}
            className="inline-flex items-center justify-center rounded-xl bg-gray-950 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Open checkout
          </button>
          <button
            type="button"
            onClick={copyLink}
            disabled={!url}
            className="inline-flex items-center justify-center rounded-xl border border-black/10 px-4 py-3 text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {copied ? "Copied" : "Copy link"}
          </button>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => router.replace("/billing")}
            className="text-sm font-semibold text-gray-900 underline underline-offset-4 decoration-black/20 hover:decoration-black/40"
          >
            Back to billing
          </button>
          <Link
            href="/demo"
            className="text-sm font-semibold text-gray-900 underline underline-offset-4 decoration-black/20 hover:decoration-black/40"
          >
            View demo report
          </Link>
          <Link
            href="mailto:wen.dyens0038@gmail.com"
            className="text-sm font-semibold text-gray-900 underline underline-offset-4 decoration-black/20 hover:decoration-black/40"
          >
            Contact support
          </Link>
        </div>
      </div>
    </div>
  );
}

