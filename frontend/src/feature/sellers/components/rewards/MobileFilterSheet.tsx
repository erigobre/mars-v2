import type { FilterState } from "@/core/types";
import { MdClose } from "react-icons/md";

export default function MobileFilterSheet({
  categories,
  open,
  filters,
  onChange,
  onClose,
}: {
  categories: string[];
  open: boolean;
  filters: FilterState;
  onChange: (f: FilterState) => void;
  onClose: () => void;
}) {
  const toggleCategory = (cat: string) => {
    const next = filters.categories.includes(cat)
      ? filters.categories.filter((c) => c !== cat)
      : [...filters.categories, cat];
    onChange({ ...filters, categories: next });
  };

  if (!open) return null;

  return (
    <>
      <div
        className="md:hidden fixed inset-0 bg-black/50 z-40 cursor-pointer"
        onClick={onClose}
      />
      <div className="fixed bottom-0 left-0 right-0 bg-theme-secondary rounded-t-3xl z-50 p-6 pb-10 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-3xl font-bold text-white">Filtros</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/30 cursor-pointer transition-colors"
          >
            <MdClose className="text-xl text-white" />
          </button>
        </div>

        <div className="mb-5">
          <p className="text-sm font-semibold text-white uppercase tracking-wider mb-3">
            Categorías
          </p>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => toggleCategory(cat)}
                className={[
                  "px-3 py-1.5 rounded-full text-sm font-semibold transition-all",
                  filters.categories.includes(cat)
                    ? "bg-white text-theme-text-dark"
                    : "bg-transparent text-white border-white border-2",
                ].join(" ")}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <label className="flex items-center gap-3 cursor-pointer mb-6">
          <input
            type="checkbox"
            checked={filters.onlyAffordable}
            onChange={(e) =>
              onChange({ ...filters, onlyAffordable: e.target.checked })
            }
            className="w-5 h-5 rounded border-2 border-white bg-transparent text-theme-secondary focus:ring-theme-secondary  focus:ring-2 focus:ring-offset-0 focus:outline-none transition-colors"
          /> 
          <span className="text-sm text-white">Solo los que puedo canjear</span>
        </label>

        <div className="flex gap-3">
          <button
            onClick={() =>
              onChange({
                categories: [],
                minPoints: "",
                maxPoints: "",
                onlyAffordable: false,
              })
            }
            className="flex-1 py-3 bg-transparent text-white border-white border-2 font-semibold rounded-xl text-sm"
          >
            Limpiar
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-white text-theme-text-dark font-bold rounded-xl text-sm"
          >
            Aplicar
          </button>
        </div>
      </div>
    </>
  );
}
