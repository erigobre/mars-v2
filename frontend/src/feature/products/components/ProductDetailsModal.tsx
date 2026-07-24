import { useState } from "react";
import {
  MdInventory,
  MdClose,
  MdCheckCircle,
  MdCompareArrows,
  MdHistory,
  MdDescription,
  MdStorage,
  MdStore,
  MdEdit,
  MdDelete,
  MdSettingsSuggest,
  MdCancel,
} from "react-icons/md";
import type { Product } from "../schemas/product";
import { formatCurrency } from "@/core/utils/formatDate";

type ProductDetailsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onCustomize: (product: Product) => void;
  onReset: (product: Product) => void;
};

export default function ProductDetailsModal({
  isOpen,
  onClose,
  product,
  onCustomize,
  onReset,
}: ProductDetailsModalProps) {
  const [activeTab, setActiveTab] = useState<
    "comparativa" | "historial" | "especificaciones"
  >("comparativa");

  if (!isOpen || !product) return null;

  const isCustomized = product.isCustomized ?? !!product.customization;
  const basePrice = product.defaultPrice ?? product.price ?? 0;
  const customPrice = product.customization?.customPrice ?? product.price ?? 0;
  const displayName = product.display?.name ?? "Estándar";
  const displayPoints = product.display?.valuePoints ?? 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm">
      <div className="flex flex-col bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-full overflow-hidden relative">
        <header className="shrink-0 flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div className="flex items-center gap-3">
            <MdInventory className="text-primary text-2xl" />
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              Detalles del Producto
            </h2>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center rounded-lg h-10 w-10 hover:bg-slate-100 transition-colors text-slate-500"
          >
            <MdClose className="text-2xl" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center mb-10">
            <div className="relative aspect-square max-h-64 md:max-h-80 rounded-xl overflow-hidden bg-slate-50 flex items-center justify-center border border-slate-100">
              {product.imageThumb || product.image ? (
                <img
                  alt={product.name}
                  className="object-contain w-full h-full p-4 md:p-8"
                  src={product.imageThumb! ?? product.image}
                />
              ) : (
                <MdInventory className="text-6xl text-slate-300" />
              )}
            </div>

            <div className="flex flex-col gap-4">
              <div className="space-y-1">
                <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
                  {product.category ?? "General"}
                </span>
                <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight text-slate-900">
                  {product.name}
                </h1>
                <p className="text-slate-500 font-medium font-mono">
                  SKU: {product.sku}
                </p>
              </div>

              <div className="flex flex-wrap gap-2 mt-2">
                <div className="flex-1 min-w-35 p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-xs text-slate-500 uppercase font-bold tracking-widest">
                    Estatus
                  </p>
                  {product.isActive ? (
                    <p className="text-2xl font-bold text-green-500 flex items-center gap-1">
                      <MdCheckCircle className="text-xl" /> Activo
                    </p>
                  ) : (
                    <p className="text-2xl font-bold text-slate-400 flex items-center gap-1">
                      <MdCancel className="text-xl" /> Inactivo
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex border-b border-slate-200 mb-8 overflow-x-auto custom-scrollbar">
            <button
              onClick={() => setActiveTab("comparativa")}
              className={`flex items-center gap-2 px-6 py-3 font-bold whitespace-nowrap border-b-2 transition-colors ${
                activeTab === "comparativa"
                  ? "border-primary text-primary"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              <MdCompareArrows className="text-lg" /> Vista Comparativa
            </button>
            <button
              onClick={() => setActiveTab("historial")}
              className={`flex items-center gap-2 px-6 py-3 font-bold whitespace-nowrap border-b-2 transition-colors ${
                activeTab === "historial"
                  ? "border-primary text-primary"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              <MdHistory className="text-lg" /> Historial de Cambios
            </button>
            <button
              onClick={() => setActiveTab("especificaciones")}
              className={`flex items-center gap-2 px-6 py-3 font-bold whitespace-nowrap border-b-2 transition-colors ${
                activeTab === "especificaciones"
                  ? "border-primary text-primary"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              <MdDescription className="text-lg" /> Especificaciones Téc.
            </button>
          </div>

          {activeTab === "comparativa" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="flex flex-col border border-slate-200 rounded-xl p-6 bg-slate-50/50">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center">
                    <MdStorage className="text-xl text-slate-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-900">
                      Catálogo Maestro
                    </h3>
                    <p className="text-xs text-slate-500">
                      Valores base del sistema
                    </p>
                  </div>
                </div>

                <div className="space-y-4 flex-1">
                  <div className="flex justify-between items-center py-2 border-b border-slate-100">
                    <span className="text-slate-500">Precio Base</span>
                    <span className="font-bold text-slate-900">
                      {formatCurrency(basePrice)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-100">
                    <span className="text-slate-500">Display</span>
                    <span className="font-bold text-slate-900">
                      {displayName}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-slate-100">
                    <span className="text-slate-500">
                      Valor Estimado en Puntos
                    </span>
                    <span className="font-bold text-slate-400 italic">
                      {displayPoints} pts
                    </span>
                  </div>
                  <div className="flex flex-col gap-2 pt-2">
                    <span className="text-slate-500 text-sm">
                      Reglas Generales
                    </span>
                    <ul className="text-sm space-y-1">
                      <li className="flex items-center gap-2 text-slate-600">
                        <MdCheckCircle className="text-xs text-green-500" /> Los
                        vendedores canjean por puntos del display
                      </li>
                      <li className="flex items-center gap-2 text-slate-600">
                        <MdCheckCircle className="text-xs text-green-500" />{" "}
                        Facturación basada en precio
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {isCustomized ? (
                <div className="flex flex-col border-2 border-primary rounded-xl p-6 bg-primary/5 relative">
                  <div className="absolute -top-3 right-6 bg-primary text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                    Tu Configuración
                  </div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <MdStore className="text-xl text-primary" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-slate-900">
                          Tus Reglas
                        </h3>
                        <p className="text-xs text-primary/80">
                          Personalizado para tu red
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1 rounded-lg">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span className="text-xs font-bold uppercase">
                        Activo
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b border-primary/10">
                      <span className="text-slate-500">
                        Tu Precio Personalizado
                      </span>
                      <span className="font-extrabold text-primary text-xl">
                        {formatCurrency(customPrice)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-primary/10">
                      <span className="text-slate-500">Tu SKU</span>
                      <span className="font-bold text-slate-900 font-mono">
                        {product.customization?.customSku ||
                          "Mismo que original"}
                      </span>
                    </div>

                    {product.customization?.notes && (
                      <div className="mt-4 p-4 rounded-lg bg-white border border-primary/20">
                        <p className="text-sm text-slate-600 italic">
                          "{product.customization.notes}"
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="mt-auto pt-6 flex gap-3">
                    <button
                      onClick={() => {
                        onClose();
                        onCustomize(product);
                      }}
                      className="flex-1 bg-primary text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                    >
                      <MdEdit className="text-lg" /> Editar Reglas
                    </button>
                    <button
                      onClick={() => {
                        onClose();
                        onReset(product);
                      }}
                      className="w-12 h-12 border-2 border-primary/20 text-primary rounded-lg flex items-center justify-center hover:bg-primary/10 transition-all"
                      title="Eliminar Personalización"
                    >
                      <MdDelete className="text-xl" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col border border-dashed border-slate-300 rounded-xl p-6 bg-slate-50 items-center justify-center text-center">
                  <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                    <MdSettingsSuggest className="text-3xl text-slate-400" />
                  </div>
                  <h3 className="font-bold text-lg mb-2 text-slate-700">
                    Usando valores maestros
                  </h3>
                  <p className="text-sm text-slate-500 mb-6 max-w-60">
                    No has personalizado este producto. Tus clientes verán el
                    precio y display base del catálogo.
                  </p>
                  <button
                    onClick={() => {
                      onClose();
                      onCustomize(product);
                    }}
                    className="bg-primary text-white font-bold px-6 py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-primary/90 transition-all"
                  >
                    Personalizar ahora
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab !== "comparativa" && (
            <div className="py-12 flex flex-col items-center justify-center text-slate-400">
              <MdHistory className="text-6xl mb-4 opacity-20" />
              <p>Módulo en construcción...</p>
            </div>
          )}
        </div>

        <footer className="shrink-0 bg-slate-50 px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-slate-200">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            Actualizado por última vez:{" "}
            {product.updatedAt
              ? new Date(product.updatedAt).toLocaleDateString()
              : "Recientemente"}
          </div>
        </footer>
      </div>
    </div>
  );
}
