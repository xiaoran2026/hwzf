import { Suspense } from "react";
import RedirectClient from "./redirect-client";

export default function PaymentRedirectPage() {
  return (
    <Suspense fallback={<div className="min-h-[70vh]" />}>
      <RedirectClient />
    </Suspense>
  );
}
