import { type HTMLAttributes } from "react";

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  height?: string;
  width?: string;
  rounded?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
}

export function Skeleton({
  height = "h-4",
  width = "w-full",
  rounded = "lg",
  className = "",
  ...props
}: SkeletonProps) {
  return (
    <div
      className={`
        animate-pulse bg-linear-to-r from-gray-200 via-gray-100 to-gray-200
        bg-size-[400%_100%] animate-shimmer
        rounded-${rounded}
        ${height} ${width} ${className}
      `}
      {...props}
    />
  );
}
