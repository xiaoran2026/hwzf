"use client";

import Link from "next/link";

const posts = [
  {
    slug: "shopify-repeat-purchase-rate-benchmark",
    title: "Shopify Repeat Purchase Rate Benchmark 2026: What's Healthy (and What's Leaking Revenue)",
    description:
      "Shopify repeat purchase rate benchmark by category. See if your store's retention is healthy, what's average in 2026, and how to fix repeat purchase leaks.",
    date: "August 3, 2026",
    readTime: "11 min read",
    category: "Benchmarks",
  },
  {
    slug: "shopify-aov-benchmark",
    title: "Shopify Average Order Value (AOV) Benchmark 2026: What's Normal By Category",
    description:
      "Shopify average order value (AOV) benchmark by category. See how your store's AOV compares to industry averages and find opportunities to increase it.",
    date: "August 3, 2026",
    readTime: "9 min read",
    category: "Benchmarks",
  },
];

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-[#fafaf8] text-gray-950">
      <header className="border-b border-black/5 bg-[#fafaf8]/95 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gray-950 text-white flex items-center justify-center">
              <span className="text-sm font-bold">SL</span>
            </div>
            <div>
              <p className="text-sm font-bold tracking-tight">Store Leak</p>
              <p className="text-[10px] text-gray-500 uppercase tracking-[0.18em]">Shopify Revenue Recovery Audit</p>
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm text-gray-600">
            <Link href="/" className="hover:text-gray-950 transition-colors">Home</Link>
            <Link href="/case-studies" className="hover:text-gray-950 transition-colors">Case Studies</Link>
            <Link href="/blog" className="text-gray-950 font-semibold transition-colors">Blog</Link>
          </nav>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-gray-950 text-white hover:bg-gray-800 transition-colors"
          >
            Get Free Audit
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 md:px-6 py-16 md:py-24">
        <section>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500">Store Leak Blog</p>
          <h1 className="mt-4 text-4xl md:text-5xl font-bold tracking-tight leading-[1.02]">
            Data, benchmarks, and playbooks for Shopify DTC growth
          </h1>
          <p className="mt-5 text-lg text-gray-600 leading-relaxed max-w-2xl">
            Practical analysis and benchmarks to help Shopify founders spot hidden revenue leaks and recover lost revenue — without needing an analytics degree.
          </p>
        </section>

        <section className="mt-14 space-y-6">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="block rounded-2xl border border-black/8 bg-white p-6 hover:border-black/20 transition-colors group"
            >
              <div className="flex items-center gap-3 text-xs">
                <span className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 font-semibold uppercase tracking-[0.12em]">
                  {post.category}
                </span>
                <span className="text-gray-400">{post.date}</span>
                <span className="text-gray-400">·</span>
                <span className="text-gray-400">{post.readTime}</span>
              </div>
              <h2 className="mt-4 text-2xl font-bold tracking-tight text-gray-950 group-hover:text-gray-700 transition-colors">
                {post.title}
              </h2>
              <p className="mt-3 text-sm text-gray-600 leading-relaxed">{post.description}</p>
              <div className="mt-4 text-sm font-semibold text-gray-900 group-hover:text-gray-700 transition-colors">
                Read article →
              </div>
            </Link>
          ))}
        </section>
      </main>
    </div>
  );
}