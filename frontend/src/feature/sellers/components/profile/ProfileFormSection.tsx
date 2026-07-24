import type { ReactNode } from "react";

type ProfileFormSectionProps = {
  title: string;
  icon: ReactNode;
  children: ReactNode;
  className?: string;
};

export default function ProfileFormSection({
  title,
  icon,
  children,
  className = "",
}: ProfileFormSectionProps) {
  return (
    <section className={className}>
      <h3 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-3 mb-6 flex items-center">
        <span className="mr-2 text-primary text-xl flex items-center justify-center">
          {icon}
        </span>
        {title}
      </h3>
      {children}
    </section>
  );
}
