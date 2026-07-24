
type StatCardProps = {
  value: string;
  label: string;
  valueClass?: string;
  className?: string;
}

export default function StatCard({
  value,
  label,
  valueClass = "text-theme-text-dark",
  className = "",
} : StatCardProps) {

  const getDynamicTextSize = (text: string) => {
    const length = text.length;
    
    if (length <= 3) return "text-5xl md:text-6xl";
    if (length <= 5) return "text-4xl md:text-5xl";
    if (length <= 8) return "text-3xl md:text-4xl";
    return "text-2xl md:text-3xl";
  };

  const dynamicSizeClass = getDynamicTextSize(value);

  return (
    <div className={`rounded-2xl p-6 shadow-sm border-2 flex flex-col items-center justify-center text-center text-theme-text-dark ${className}`}>
      <span className={`font-heading ${dynamicSizeClass} ${valueClass}`}>{value}</span>
      <p className="text-sm font-bold uppercase tracking-widest mt-1">
        {label}
      </p>
    </div>
  );
}