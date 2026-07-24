import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import type { ReactNode } from "react";

type BaseModalProps = {
  open: boolean;
  onClose?: () => void;
  children: ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl";
};

export function BaseModal({
  open,
  onClose,
  children,
  maxWidth = "sm",
}: BaseModalProps) {
  if (typeof document === "undefined") return null;

  const maxWidthClass = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
  }[maxWidth];

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          // Al hacer clic en el fondo, se cierra (si se provee onClose)
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm px-4 pb-4 sm:pb-0"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            // Evita que el clic dentro de la tarjeta cierre el modal
            onClick={(e) => e.stopPropagation()}
            className={`bg-white rounded-3xl w-full ${maxWidthClass} shadow-2xl overflow-hidden`}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
