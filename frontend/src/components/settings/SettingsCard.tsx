"use client";

interface SettingsCardProps {
  children?: React.ReactNode;
  className?: string;
  danger?: boolean;
  loading?: boolean;
}

export default function SettingsCard({ children, className = "", danger = false, loading = false }: SettingsCardProps) {
  if (loading) {
    return (
      <div className={`bg-white rounded-xl border ${danger ? "border-red-200 bg-red-50/30" : "border-gray-100"} shadow-[0_1px_2px_rgba(0,0,0,0.04)] p-6 animate-pulse`}>
        <div className="space-y-4">
          <div className="h-4 w-1/3 bg-gray-100 rounded" />
          <div className="h-4 w-2/3 bg-gray-100 rounded" />
          <div className="h-10 w-full bg-gray-50 rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-white rounded-xl border shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-shadow duration-150 ${
        danger
          ? "border-red-200 bg-red-50/30"
          : "border-gray-100 hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)]"
      } ${className}`}
    >
      {children}
    </div>
  );
}
