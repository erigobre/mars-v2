import type { ReactNode } from "react";
import BottomDecoration from "@/core/components/common/BottomDecoration";

type LegalDocumentLayoutProps = {
  subtitle: string;
  children: ReactNode;
};



export default function LegalDocumentLayout({
  subtitle,
  children,
}: LegalDocumentLayoutProps) {

  return (
    <div
      className="min-h-dvh font-sans antialiased relative overflow-hidden"
    >
      <BottomDecoration />

      {/* Content */}
      <main className="relative z-10 max-w-3xl mx-auto px-4 pb-16 pt-8">
        {/* Document Header */}
        <div className="mb-8 text-center space-y-2">
          <p className="text-white/70 text-sm md:text-base">{subtitle}</p>
        </div>

        {/* Document Body */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-5 md:p-8 shadow-2xl">
          {children}
        </div>
      </main>
    </div>
  );
}
