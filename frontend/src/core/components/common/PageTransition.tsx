import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import type { ReactNode } from "react";

export function PageTransition({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();

  useEffect(() => {
    const scrollContainer = document.getElementById("main-scroll");
    if (scrollContainer) {
      scrollContainer.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  }, [pathname]);

  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: 15 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full grow flex flex-col"
    >
      {children}
    </motion.div>
  );
}