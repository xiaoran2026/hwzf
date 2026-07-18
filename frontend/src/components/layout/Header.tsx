"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

export default function Header() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const unlockHref = user ? "/billing" : "/pricing";

  return (
    <header className="sticky top-0 z-40 border-b border-gray-100 bg-white">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-950">
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
          </div>
          <div>
            <p className="text-sm font-bold tracking-tight text-gray-900">StoreAI Doctor</p>
            <p className="text-[10px] uppercase tracking-[0.16em] text-gray-500">Revenue Leak Checker</p>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/dashboard"
            className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            Dashboard
          </Link>
          <Link
            href="/stores"
            className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            Upload CSV
          </Link>
          <Link
            href="/reports"
            className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            My Reports
          </Link>
          <Link
            href={unlockHref}
            className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            Unlock
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <span className="text-sm text-gray-600">{user.email}</span>
                <button
                  onClick={logout}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 border border-red-100 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center rounded-lg border border-black/10 px-3 py-1.5 text-sm font-medium text-gray-900 transition-colors hover:bg-gray-50"
              >
                Sign in
              </Link>
            )}
          </div>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100"
            aria-label="Toggle menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 px-4 py-3 space-y-1">
          <Link
            href="/dashboard"
            onClick={() => setMenuOpen(false)}
            className="block text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg px-3 py-2 transition-colors"
          >
            Dashboard
          </Link>
          <Link
            href="/stores"
            onClick={() => setMenuOpen(false)}
            className="block text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg px-3 py-2 transition-colors"
          >
            Upload CSV
          </Link>
          <Link
            href="/reports"
            onClick={() => setMenuOpen(false)}
            className="block text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg px-3 py-2 transition-colors"
          >
            My Reports
          </Link>
          <Link
            href={unlockHref}
            onClick={() => setMenuOpen(false)}
            className="block text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg px-3 py-2 transition-colors"
          >
            Unlock
          </Link>
          {user ? (
            <>
              <div className="border-t border-gray-100 my-2 pt-2">
                <p className="text-sm text-gray-500 px-3 py-1">{user.email}</p>
                <button
                  onClick={() => { logout(); setMenuOpen(false); }}
                  className="w-full text-left inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </button>
              </div>
            </>
          ) : (
            <div className="border-t border-gray-100 my-2 pt-2">
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="block rounded-lg px-3 py-2 text-sm font-medium text-gray-900 transition-colors hover:bg-gray-50"
              >
                Sign in
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
