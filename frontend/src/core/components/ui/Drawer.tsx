import type { ReactNode } from "react";
import { MdClose } from "react-icons/md";
import Swal from "sweetalert2";

type DrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  isDirty?: boolean;
};

export function Drawer({
  isOpen,
  onClose,
  title,
  icon,
  children,
  footer,
  isDirty = false,
}: DrawerProps) {
  if (!isOpen) return null;

  const handleClose = () => {
    if (isDirty) {
      Swal.fire({
        title: "¿Descartar cambios?",
        text: "Tienes cambios sin guardar. Si cierras ahora, se perderán.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#ef4444",
        cancelButtonColor: "#64748b",
        confirmButtonText: "Sí, descartar",
        cancelButtonText: "Continuar editando",
        reverseButtons: true,
      }).then((result) => {
        if (result.isConfirmed) {
          onClose();
        }
      });
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      />
      
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-gray-200 animate-slide-left">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 text-primary">
            {icon && <span className="text-2xl">{icon}</span>}
            <h3 className="text-xl font-bold text-gray-900">{title}</h3>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <MdClose className="text-xl" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white">
          {children}
        </div>

        {footer && (
          <div className="p-6 border-t border-gray-100 shrink-0 bg-white">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}