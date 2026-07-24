import { z } from "zod";
import { TopProductItemSchema } from "../../schemas/distributorDashboardSchema";
import { MdShoppingBag } from "react-icons/md";

type TopProductsProps = {
  products: z.infer<typeof TopProductItemSchema>[];
};

export default function TopProductsList({ products }: TopProductsProps) {
  return (
    <section className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-6 border-b border-slate-50">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <MdShoppingBag className="text-primary" size={24} />
          Más Vendidos
        </h2>
      </div>
      <div className="p-6 space-y-5">
        {products.map((product) => (
          <div
            key={product.productId}
            className="flex items-center gap-4 group cursor-pointer"
          >
            <div className="w-14 h-14 bg-slate-100 rounded-lg overflow-hidden shrink-0">
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-200 text-slate-400">
                  <span className="material-symbols-outlined">inventory_2</span>
                </div>
              )}
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-slate-800 text-sm group-hover:text-primary transition-colors">
                {product.name}
              </h4>
              <p className="text-xs text-slate-500">
                {product.totalSold} unidades vendidas
              </p>
              <div className="w-full bg-slate-100 h-1.5 mt-2 rounded-full">
                <div
                  className="bg-primary h-full rounded-full"
                  style={{ width: `${product.percentageOfTotal || 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
