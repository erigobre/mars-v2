type StatCardProps = {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
  subClass?: string;
};

export default function StatCard({
  label,
  value,
  sub,
  icon,
  subClass = "text-gray-400",
}: StatCardProps) {
  return (
    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <p className="text-gray-500 text-sm font-medium">{label}</p>
        <span className="text-primary bg-primary/10 p-2 rounded-lg">
          {icon}
        </span>
      </div>
      <div className="flex items-baseline gap-2">
        <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
        {sub && <span className={`text-xs font-bold ${subClass}`}>{sub}</span>}
      </div>
    </div>
  );
}