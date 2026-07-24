import { MdStorefront } from "react-icons/md";
import type { z } from "zod";
import type { topProductSchema } from "../../schemas/salesAnalytics";

type TopProduct = z.infer<typeof topProductSchema>;

export default function TopProductsList({ data }: { data: TopProduct[] }) {
  // 1. Verificamos si hay datos
  const isEmpty = !data || data.length === 0;

  return (
    <div className="col-span-12 bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden mt-8">
      <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
            Productos Más Vendidos
          </h2>
          <p className="text-sm text-slate-500">
            Top productos con mayor rendimiento comercial
          </p>
        </div>
        {/* {!isEmpty && (
          <div className="flex gap-2 sm:flex">
            <button className="px-4 py-1.5 rounded-lg text-xs font-bold bg-primary text-white shadow-lg shadow-slate-900/20">
              Por Unidades
            </button>
            <button className="px-4 py-1.5 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors border border-slate-200">
              Por Puntos
            </button>
          </div>
        )} */}
      </div>

      {isEmpty ? (
        <div className="flex flex-col items-center justify-center text-slate-400 py-16">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
            <MdStorefront className="text-3xl opacity-40" />
          </div>
          <p className="text-sm text-center font-medium">
            No hay productos vendidos <br /> con los filtros actuales.
          </p>
        </div>
      ) : (
        <div className="p-6">
          <div className="flex overflow-x-auto gap-6 pb-4 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-slate-200">
            {data.map((product, index) => (
              <div
                key={product.productId}
                className="group cursor-pointer min-w-55 max-w-55 shrink-0 snap-start"
              >
                <div className="relative mb-3 aspect-square rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center transition-all hover:shadow-md">
                  {product.image ? (
                    <img
                      src={`${product.image}`}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Si la imagen falla al cargar, la ocultamos para mostrar el fallback visual (opcional)
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="text-5xl opacity-10 font-black text-slate-900">
                      {product.name.substring(0, 2).toUpperCase()}
                    </div>
                  )}

                  <div
                    className={`absolute top-2 left-2 text-white text-[10px] font-black px-2 py-1 rounded uppercase tracking-wider ${
                      index === 0
                        ? "bg-primary shadow-md shadow-primary/30"
                        : "bg-slate-900"
                    }`}
                  >
                    Top {index + 1}
                  </div>
                </div>
                <h3
                  className="text-sm font-bold text-slate-900 group-hover:text-primary transition-colors truncate"
                  title={product.name}
                >
                  {product.name}
                </h3>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-slate-500">
                    {product.totalSold.toLocaleString()} uds
                  </span>
                  <span className="text-xs font-bold text-emerald-600">
                    +{product.totalPoints.toLocaleString()} pts
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
