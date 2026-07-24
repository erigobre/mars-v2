type SupportFooterProps = {
  className?: string;
};

export default function SupportFooter({ className = "" }: SupportFooterProps) {
  return (
    <div className={`w-full flex justify-center px-4 ${className}`}>
      <div className="bg-transparent backdrop-blur-md border border-white/20 rounded-full px-5 py-2.5 shadow-xl transition-transform">
        <p className="text-white text-xs sm:text-sm font-medium tracking-wide text-center drop-shadow-sm">
          Para dudas, comentarios o soporte, contáctanos en:{" "}
          <a
            href="mailto:contacto@ganaconmars.com"
            className="text-white font-extrabold hover:text-theme-secondary hover:underline underline-offset-2 transition-all"
          >
            contacto@ganaconmars.com
          </a>
        </p>
      </div>
    </div>
  );
}
