import { getTierIcon } from "../utils/tierIcons";

type TierBadgeProps = {
  name: string;
  color?: string | null;
  icon?: string | null;
  size?: "sm" | "md" | "lg";
  showName?: boolean;
};

export default function TierBadge({
  name,
  color,
  icon,
  size = "md",
  showName = true,
}: TierBadgeProps) {
  const IconComponent = getTierIcon(icon);
  const safeColor = color || "#64748b";

  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-16 h-16",
  };

  const iconSizes = {
    sm: 14,
    md: 18,
    lg: 36,
  };

  return (
    <div className="flex items-center gap-3">
      <div
        className={`${sizeClasses[size]} rounded-xl flex items-center justify-center shrink-0 shadow-sm`}
        style={{
          backgroundColor: `${safeColor}1A`,
          color: safeColor,
          border: `1px solid ${safeColor}33`,
        }}
      >
        <IconComponent size={iconSizes[size]} />
      </div>
      {showName && (
        <span
          className={`font-bold ${size === "lg" ? "text-3xl" : "text-sm"}`}
          style={{ color: safeColor }}
        >
          {name}
        </span>
      )}
    </div>
  );
}
