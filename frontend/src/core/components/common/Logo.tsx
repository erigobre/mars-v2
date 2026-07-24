
type LogoProps = {
  className?: string;
};

export default function Logo({ className }: LogoProps = {}) {
  return (
    <div className={`h-20 flex items-center gap-2 text-white text-2xl font-black tracking-tighter ${className}`}>
      {/* Plan Frios 2026 */}
      <div
        className="w-full h-full aspect-video bg-(image:--logo-main) bg-contain bg-no-repeat bg-center"
        role="img"
        aria-label="Logo Frigolazo"
      />
    </div>
  );
}
