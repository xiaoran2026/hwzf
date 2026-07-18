"use client";

import type { AdminDeploymentInfo } from "@/lib/types";

interface Props {
  data: AdminDeploymentInfo | null;
  loading: boolean;
}

function InfoRow({ label, value, mono = false }: { label: string; value?: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-xs text-gray-400">{label}</span>
      <span className={`text-xs text-gray-700 ${mono ? "font-mono" : "font-medium"}`}>
        {value || "-"}
      </span>
    </div>
  );
}

export default function DeploymentInfoCard({ data, loading }: Props) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 p-6 animate-pulse">
        <div className="h-4 bg-gray-100 rounded w-36 mb-4" />
        <div className="space-y-3">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-3 bg-gray-100 rounded w-full" />
          ))}
        </div>
      </div>
    );
  }

  const envColor = data?.environment === "Production"
    ? "bg-green-50 text-green-700 border-green-200"
    : data?.environment === "Staging"
    ? "bg-amber-50 text-amber-700 border-amber-200"
    : "bg-blue-50 text-blue-700 border-blue-200";

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-gray-900">System Information</h2>
        {data?.environment && (
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium border ${envColor}`}>
            {data.environment}
          </span>
        )}
      </div>

      <div className="space-y-0">
        <InfoRow label="Frontend Version" value={data?.frontendVersion || "1.0.0"} />
        <div className="border-t border-gray-50" />
        <InfoRow label="Backend Version" value={data?.backendVersion || "1.0.0"} />
        <div className="border-t border-gray-50" />
        <InfoRow label="Java Version" value={data?.javaVersion} />
        <div className="border-t border-gray-50" />
        <InfoRow label="Spring Boot Version" value={data?.springBootVersion} />
        <div className="border-t border-gray-50" />
        <InfoRow label="Database Version" value={data?.databaseVersion} />
        <div className="border-t border-gray-50" />
        <InfoRow label="Server Time" value={data?.serverTime} />
        <div className="border-t border-gray-50" />
        <InfoRow label="Timezone" value={data?.timezone} />
        <div className="border-t border-gray-50" />
        <InfoRow label="Docker Version" value={data?.dockerVersion || "N/A"} />
        <div className="border-t border-gray-50" />
        <InfoRow label="Container ID" value={data?.containerId || "N/A"} mono />
        <div className="border-t border-gray-50" />
        <InfoRow label="Build Time" value={data?.buildTime || "N/A"} />
        <div className="border-t border-gray-50" />
        <InfoRow label="Git Commit" value={data?.gitCommit || "N/A"} mono />
      </div>
    </div>
  );
}