import type { ReactNode } from "react";
import { MdArrowForward } from "react-icons/md";
import { Button } from "@/core/components/ui";

type FeaturedCardStatus = "open" | "closed" | "no_goals";

type FeaturedCardProps = {
  sectionTitle?: string;
  imageSrc: string;
  imageAlt?: string;
  badgeText?: string;
  title: string;
  footerText?: string;
  showIndicator?: boolean;
  actionIcon?: ReactNode;
  onAction: () => void;
  status?: FeaturedCardStatus;
  nextOpeningText?: string;
  bgColor?: string;
  imageOverflow?: boolean; 
};

// const STATUS_CONFIG: Record<
//   FeaturedCardStatus,
//   { label: string; labelClass: string; icon: ReactNode; dimImage: boolean }
// > = {
//   open: {
//     label: "",
//     labelClass: "",
//     icon: null,
//     dimImage: false,
//   },
//   closed: {
//     label: "Tienda cerrada",
//     labelClass: "bg-gray-800/80 text-white",
//     icon: <MdStorefront className="text-base" />,
//     dimImage: true,
//   },
//   no_goals: {
//     label: "Sin metas activas",
//     labelClass: "bg-blue-900/70 text-white",
//     icon: <MdInbox className="text-base" />,
//     dimImage: true,
//   },
// };

export default function FeaturedCard({
  sectionTitle,
  imageSrc,
  imageAlt,
  badgeText,
  title,
  footerText,
  showIndicator = true,
  actionIcon = <MdArrowForward className="text-xl" />,
  onAction,
  status = "closed",
  nextOpeningText,
  bgColor,
  imageOverflow = false,
}: FeaturedCardProps) {
  const isClosed = status !== "open";

  return (
    <section className="space-y-4 h-full">
      {sectionTitle && (
        <h2 className="relative z-30 text-4xl font-heading text-white px-1">{sectionTitle}</h2>
      )}

      <div
        role="button"
        tabIndex={0}
        onClick={onAction}
        onKeyDown={(e) => e.key === "Enter" && onAction()}
        className={`group bg-white rounded-3xl shadow-lg transition-all border-2 border-theme-light-secondary ${
          imageOverflow ? "mt-16 md:mt-12" : "overflow-hidden"
        }`}
      >
        <div 
          className={`h-44 relative ${bgColor} ${
            imageOverflow ? "rounded-t-3xl" : "overflow-hidden"
          }`}
        >
          <img
            alt={imageAlt || title}
            className={`absolute transition-transform duration-500 z-10 ${
              imageOverflow 
                ? "w-full sm:w-[55%] md:w-full md:scale-125 bottom-0 right-5 object-contain object-bottom drop-shadow-lg" 
                : "h-full object-cover"
            }`}
            src={imageSrc}
          />
          
          <div className={`absolute inset-0 bg-linear-to-t from-gray-900/80 via-gray-900/20 to-transparent z-10 ${
            imageOverflow ? "rounded-t-3xl" : ""
          }`} />

          <div className="absolute bottom-4 left-4 text-white z-20">
            {badgeText && (
              <p className="text-xs font-bold uppercase tracking-widest mb-1 text-secondary drop-shadow-md">
                {badgeText}
              </p>
            )}
            <p className="text-xl font-extrabold drop-shadow-md">{title}</p>
          </div>
        </div>

        <div className={`p-5 flex items-center justify-between bg-gray-50 relative z-20 ${
          imageOverflow ? "rounded-b-3xl" : ""
        }`}>
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-3">
              {showIndicator && status === "open" && (
                <div className="relative flex h-4 w-4 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75" />
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-secondary border-2 border-white" />
                </div>
              )}
              {footerText && (
                <span className="text-base font-bold text-gray-700">
                  {footerText}
                </span>
              )}
            </div>

            {status === "closed" && nextOpeningText && (
              <p className="text-xs text-gray-400 mt-0.5">{nextOpeningText}</p>
            )}
          </div>

          <Button
            variant="ghost"
            size="sm"
            className={`rounded-full p-2! ${
              isClosed ? "opacity-40 cursor-not-allowed" : ""
            }`}
            onClick={isClosed ? undefined : onAction}
            disabled={isClosed}
          >
            {actionIcon}
          </Button>
        </div>
      </div>
    </section>
  );
}