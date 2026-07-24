import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";

export function useTableFilters<TFilters extends Record<string, any>>(defaultPerPage: number = 10, debounceMs = 500) {
  const [searchParams, setSearchParams] = useSearchParams();

  const page = Number(searchParams.get("page")) || 1;
  const perPage = Number(searchParams.get("per_page")) || defaultPerPage;

  const appliedFilters: Record<string, any> = {};
  searchParams.forEach((value, key) => {
    if (key !== "page" && key !== "per_page") {
      appliedFilters[key] = value;
    }
  });

  const [localFilters, setLocalFilters] = useState<Partial<TFilters>>(
    appliedFilters as Partial<TFilters>
  );

  const isInternalUpdate = useRef(false);

  useEffect(() => {
    if (!isInternalUpdate.current) {
      setLocalFilters(appliedFilters as Partial<TFilters>);
    }
    isInternalUpdate.current = false;
  }, [searchParams]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchParams((prev) => {
        const newParams = new URLSearchParams(prev);
        let hasChanges = false;

        Object.entries(localFilters).forEach(([key, value]) => {
          if (value === undefined || value === "") {
            if (newParams.has(key)) {
              newParams.delete(key);
              hasChanges = true;
            }
          } else {
            if (newParams.get(key) !== String(value)) {
              newParams.set(key, String(value));
              hasChanges = true;
            }
          }
        });

        Array.from(newParams.keys()).forEach((key) => {
          if (key !== "page" && key !== "per_page" && !(key in localFilters)) {
            newParams.delete(key);
            hasChanges = true;
          }
        });

        if (hasChanges) {
          newParams.set("page", "1"); // Reseteamos la página
          isInternalUpdate.current = true;
          return newParams;
        }

        return prev;
      });
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [localFilters, debounceMs, setSearchParams]);

  const setFilter = (key: keyof TFilters, value: any) => {
    setLocalFilters((prev) => ({ ...prev, [key]: value }));
  };

  const setFilters = (newValues: Partial<TFilters>) => {
    setLocalFilters((prev) => ({ ...prev, ...newValues }));
  };

  const setPage = (newPage: number) => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      newParams.set("page", String(newPage));
      return newParams;
    });
  };

  const setPerPage = (newPerPage: number) => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      newParams.set("per_page", String(newPerPage));
      newParams.set("page", "1"); // Resetear a la página 1 al cambiar el conteo
      return newParams;
    });
  };

  return {
    page,
    perPage,
    filters: localFilters,
    appliedFilters: appliedFilters as Partial<TFilters>,
    setFilter,
    setFilters,
    setPage,
    setPerPage
  };
}
