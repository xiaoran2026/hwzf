"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { paymentApi } from "@/lib/api";

interface UnlockButtonProps {
  label?: string;
  className?: string;
  plan?: "STARTER" | "PRO";
  unauthHref?: string;
  fullWidth?: boolean;
}

export default function UnlockButton({
  label = "Unlock full report",
  className = "",
  plan = "PRO",
  unauthHref = "/register",
  fullWidth = false,
}: UnlockButtonProps) {
  const router = useRouter();
  const { user, token } = useAuth();
  const [unlocking, setUnlocking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUnlock() {
    if (!user && !token) {
      router.push(unauthHref);
      return;
    }

    try {
      setUnlocking(true);
      setError(null);
      const res = await paymentApi.createPayment({ plan });
      const url = res?.data?.data?.paymentUrl;
      if (!url) {
        setError("Payment link not available. Please try again.");
        return;
      }
      window.sessionStorage.setItem("paymentRedirectUrl", url);
      router.push("/payment/redirect");
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Failed to start checkout. Please try again.");
    } finally {
      setUnlocking(false);
    }
  }

  return (
    <div className={fullWidth ? "w-full" : ""}>
      {error && (
        <div className="mb-3 rounded-2xl border border-red-100 bg-red-50 p-3">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
      <button
        type="button"
        onClick={handleUnlock}
        disabled={unlocking}
        className={className}
      >
        {unlocking ? "Opening checkout..." : label}
      </button>
    </div>
  );
}
