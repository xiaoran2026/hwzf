"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";

export default function NewStorePage() {
  const router = useRouter();
  const [storeName, setStoreName] = useState("");
  const [platform, setPlatform] = useState("Shopify");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) router.push("/login");
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!storeName.trim()) {
      setError("Store name is required.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await api.post("/stores", { storeName, platform });
      const newStoreId = res?.data?.data?.id || res?.data?.data?.storeId;

      if (res.data.code === 200) {
        if (newStoreId) {
          router.push(`/stores/${newStoreId}/upload`);
        } else {
          router.push("/stores");
        }
      } else {
        setError(res.data.message || "Failed to create store.");
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Failed to create store. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6">
      <nav className="mb-3 flex flex-wrap items-center gap-2 text-sm text-gray-500">
        <Link href="/stores" className="hover:text-gray-700">
          Stores
        </Link>
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="font-medium text-gray-900">Create store</span>
      </nav>

      <section className="overflow-hidden rounded-[28px] border border-black/5 bg-white">
        <div className="grid gap-8 px-6 py-8 sm:px-8 lg:grid-cols-[1fr_0.95fr] lg:items-start">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-orange-600">Create store</p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-gray-950 sm:text-4xl">
              Name the store, then go straight to CSV upload.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-gray-600 sm:text-base">
              This is not a deep store setup flow. It is just enough information to create a container for your reports and uploads.
            </p>

            <div className="mt-8 space-y-3">
              <div className="flex items-start gap-3 text-sm text-gray-700">
                <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-700">1</span>
                <span>Create a store name you can recognize later.</span>
              </div>
              <div className="flex items-start gap-3 text-sm text-gray-700">
                <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-700">2</span>
                <span>Choose the platform that matches your CSV export.</span>
              </div>
              <div className="flex items-start gap-3 text-sm text-gray-700">
                <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-700">3</span>
                <span>Continue to upload and generate the first revenue leak report.</span>
              </div>
            </div>
          </div>

          <div className="rounded-[24px] border border-gray-100 bg-[#fafaf8] p-5">
            {error && (
              <div className="mb-4 rounded-2xl border border-red-100 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="storeName" className="mb-1 block text-sm font-medium text-gray-700">
                  Store name
                </label>
                <input
                  id="storeName"
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="My Shopify Store"
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="platform" className="mb-1 block text-sm font-medium text-gray-700">
                  CSV source
                </label>
                <select
                  id="platform"
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="Shopify">Shopify</option>
                  <option value="WooCommerce">WooCommerce</option>
                  <option value="Amazon">Amazon</option>
                </select>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center justify-center rounded-xl bg-gray-950 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? "Creating store..." : "Create and continue"}
                </button>
                <Link
                  href="/stores"
                  className="inline-flex items-center justify-center rounded-xl border border-black/10 px-4 py-3 text-sm font-semibold text-gray-900 transition-colors hover:bg-white"
                >
                  Back
                </Link>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
