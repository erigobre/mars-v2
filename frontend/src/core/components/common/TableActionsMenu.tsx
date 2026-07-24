import { useState, useRef, useEffect } from "react";
import {
  MdMoreVert,
  MdEdit,
  MdDelete,
  MdVisibility,
  MdAddShoppingCart,
} from "react-icons/md";

type TableActionsMenuProps = {
  onEdit?: () => void;
  onDelete?: () => void;
  onView?: () => void;
  onAssignSale?: () => void;
};

export default function TableActionsMenu({
  onEdit,
  onDelete,
  onView,
  onAssignSale,
}: TableActionsMenuProps) {
  const [open, setOpen] = useState(false);

  const [menuCoords, setMenuCoords] = useState({ top: 0, right: 0 });
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (open) setOpen(false);
    };
    // Usamos capture: true para detectar el scroll de cualquier contenedor padre
    window.addEventListener("scroll", handleScroll, true);
    return () => window.removeEventListener("scroll", handleScroll, true);
  }, [open]);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation(); // Evita que otros eventos interfieran
    
    if (!open && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setMenuCoords({
        top: rect.bottom + 8, // 8px de margen debajo del botón
        right: window.innerWidth - rect.right, // Alineado al borde derecho del botón
      });
    }
    
    setOpen(!open);
  };

  return (
    <div className="relative inline-block text-left" ref={ref}>
      <button
        onClick={handleToggle}
        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
      >
        <MdMoreVert size={20} />
      </button>

      {open && (
        <div
          className="fixed mt-2 w-48 rounded-xl bg-white shadow-xl ring-1 ring-gray-200 ring-opacity-5 z-9999 overflow-hidden"
          style={{ top: menuCoords.top, right: menuCoords.right }}
        >
          <div className="py-1">
            {onAssignSale && (
              <button
                onClick={() => {
                  setOpen(false);
                  onAssignSale();
                }}
                className="flex items-center w-full px-4 py-2.5 text-sm text-emerald-600 hover:bg-emerald-50 cursor-pointer"
              >
                <MdAddShoppingCart
                  className="mr-3 text-emerald-500"
                  size={18}
                />
                Asignar Venta
              </button>
            )}

            {onView && (
              <button
                onClick={() => {
                  setOpen(false);
                  onView();
                }}
                className="flex items-center w-full px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                <MdVisibility className="mr-3 text-slate-400" size={18} />
                Ver Detalles
              </button>
            )}
            {onEdit && (
              <button
                onClick={() => {
                  setOpen(false);
                  onEdit();
                }}
                className="flex items-center w-full px-4 py-2.5 text-sm text-blue-600 hover:bg-blue-50 cursor-pointer"
              >
                <MdEdit className="mr-3 text-blue-500" size={18} />
                Editar
              </button>
            )}
            {onDelete && (
              <>
                <div className="h-px bg-slate-100 my-1 mx-2" />
                <button
                  onClick={() => {
                    setOpen(false);
                    onDelete();
                  }}
                  className="flex items-center w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 font-medium cursor-pointer"
                >
                  <MdDelete className="mr-3 text-red-400" size={18} />
                  Eliminar
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
