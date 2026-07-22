import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { I18nProvider } from "@/lib/i18n/I18nContext";

export const metadata: Metadata = {
  title: "Store Leak - Shopify Revenue Recovery Audit",
  description:
    "Upload your Shopify orders and get a revenue recovery audit: health score, estimated opportunity, benchmark gaps, and recovery actions. No API required.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen">
        <I18nProvider>
          <AuthProvider>{children}</AuthProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
