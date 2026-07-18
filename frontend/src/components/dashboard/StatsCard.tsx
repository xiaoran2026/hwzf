interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon?: React.ReactNode;
  colorClass?: string;
}

export default function StatsCard({
  title,
  value,
  change,
  changeType = "neutral",
  icon,
  colorClass = "bg-primary-50 text-primary-600",
}: StatsCardProps) {
  const changeColors = {
    positive: "text-green-600",
    negative: "text-red-600",
    neutral: "text-gray-500",
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        {icon && (
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorClass}`}>
            {icon}
          </div>
        )}
      </div>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      {change && (
        <p className={`mt-1 text-xs font-medium ${changeColors[changeType]}`}>
          {change}
        </p>
      )}
    </div>
  );
}
