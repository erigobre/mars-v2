import { Skeleton } from "@/core/components/ui/Skeleton";
import type { FilterState } from "@/core/types";
import { MdFilterList } from "react-icons/md";

export default function FilterSidebar({
  categories,
  filters,
  onChange,
}: {
  categories: string[];
  filters: FilterState;
  onChange: (f: FilterState) => void;
}) {
  const toggleCategory = (cat: string) => {
    const next = filters.categories.includes(cat)
      ? filters.categories.filter((c) => c !== cat)
      : [...filters.categories, cat];
    onChange({ ...filters, categories: next });
  };

  return (
    <aside className="w-64 shrink-0">
      <div className="rounded-3xl p-6 shadow-xl border-2 border-white sticky top-28 bg-transparent backdrop-blur-md">
        <div className="flex items-center gap-2 mb-6 text-lg font-bold text-white border-b border-white pb-4 drop-shadow-md">
          <MdFilterList className="text-2xl text-white" />
          Filtros
        </div>

        <div className="mb-6">
          <h3 className="font-bold text-xs text-white uppercase tracking-widest mb-4 drop-shadow-sm">
            Categorías
          </h3>
          <ul className="space-y-3">
            {!categories.length && <Skeleton className="bg-white/10 h-8" />}

            {categories.map((cat) => (
              <li key={cat}>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={filters.categories.includes(cat)}
                    onChange={() => toggleCategory(cat)}
                    className="w-5 h-5 rounded border-2 border-white bg-transparent text-theme-secondary focus:ring-white focus:ring-offset-0 transition-all cursor-pointer"
                  />
                  <span className="text-sm font-medium text-white group-hover:text-white transition-colors drop-shadow-sm">
                    {cat}
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </div>

        <div className="mb-6">
          <h3 className="font-bold text-xs text-white uppercase tracking-widest mb-4 drop-shadow-sm">
            Rango de Puntos
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Min"
                value={filters.minPoints}
                onChange={(e) =>
                  onChange({ ...filters, minPoints: e.target.value })
                }
                className="w-full h-11 px-4 bg-transparent border-2 border-white hover:border-white/80 rounded-xl text-white placeholder:text-white focus:border-white focus:ring-2 focus:ring-white/30 focus:outline-none transition-all"
              />
              <span className="text-white font-bold">-</span>
              <input
                type="number"
                placeholder="Max"
                value={filters.maxPoints}
                onChange={(e) =>
                  onChange({ ...filters, maxPoints: e.target.value })
                }
                className="w-full h-11 px-4 bg-transparent border-2 border-white hover:border-white/80 rounded-xl text-white placeholder:text-white focus:border-white focus:ring-2 focus:ring-white/30 focus:outline-none transition-all"
              />
            </div>
          </div>
        </div>

        <label className="flex items-center gap-3 cursor-pointer mb-6 group">
          <input
            type="checkbox"
            checked={filters.onlyAffordable}
            onChange={(e) =>
              onChange({ ...filters, onlyAffordable: e.target.checked })
            }
            className="w-5 h-5 rounded border-2 border-white bg-transparent text-theme-secondary focus:ring-white focus:ring-offset-0 transition-all cursor-pointer"
          />
          <span className="text-sm font-medium text-white group-hover:text-white drop-shadow-sm transition-colors">
            Solo los que puedo canjear
          </span>
        </label>

        <button
          onClick={() =>
            onChange({
              categories: [],
              minPoints: "",
              maxPoints: "",
              onlyAffordable: false,
            })
          }
          className="w-full py-3 bg-transparent border-2 border-white hover:border-white hover:bg-white text-white font-bold rounded-xl transition-all tracking-wider uppercase text-xs cursor-pointer"
        >
          Limpiar filtros
        </button>
      </div>
    </aside>
  );
}