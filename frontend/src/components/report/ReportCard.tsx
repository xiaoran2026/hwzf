import Link from "next/link";

interface ReportCardProps {
  id: number;
  storeId: number;
  storeName?: string;
  healthScore: number;
  createdAt: string;
}

export default function ReportCard({
  id,
  storeId,
  storeName,
  healthScore,
  createdAt,
}: ReportCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 bg-green-50";
    if (score >= 60) return "text-amber-600 bg-amber-50";
    return "text-red-600 bg-red-50";
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <Link
      href={`/reports/${id}`}
      className="block bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md hover:border-gray-200 transition-all"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`px-3 py-1 rounded-full text-xs font-semibold ${getScoreColor(healthScore)}`}>
          Health: {healthScore}
        </div>
        <span className="text-xs text-gray-400">{formatDate(createdAt)}</span>
      </div>

      <h3 className="text-sm font-semibold text-gray-900">
        Analysis Report #{id}
      </h3>
      <p className="mt-1 text-xs text-gray-500">
        {storeName || `Store #${storeId}`}
      </p>

      <div className="mt-4 flex items-center text-xs text-primary-600 font-medium">
        View Report
        <svg className="ml-1 w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </Link>
  );
}
