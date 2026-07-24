import React, { useState, useEffect, useRef } from "react";
import { MdSearch, MdClose, MdRefresh } from "react-icons/md";

export interface AsyncOption {
  value: string | number;
  label: string;
}

interface AsyncSelectProps {
  label?: string;
  placeholder?: string;
  value?: string | number;
  onChange: (value: string | number | undefined) => void;
  fetchOptions: (query: string) => Promise<AsyncOption[]>;
  defaultLabel?: string;
  leftIcon?: React.ReactNode;
  debounceTime?: number;
}

export function AsyncSelect({
  label,
  placeholder = "Buscar...",
  value,
  onChange,
  fetchOptions,
  defaultLabel = "",
  leftIcon,
  debounceTime = 300,
}: AsyncSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState(defaultLabel);
  const [options, setOptions] = useState<AsyncOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        if (!value) setQuery("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [value]);

  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const results = await fetchOptions(query);
        setOptions(results);
      } catch (error) {
        console.error("Error fetching options:", error);
        setOptions([]);
      } finally {
        setIsLoading(false);
      }
    }, debounceTime);

    return () => clearTimeout(timer);
  }, [query, isOpen, fetchOptions, debounceTime]);

  const handleSelect = (option: AsyncOption) => {
    setQuery(option.label);
    onChange(option.value);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setQuery("");
    onChange(undefined);
    setOptions([]);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full" ref={wrapperRef}>
      {label && (
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
          {label}
        </label>
      )}

      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
          {leftIcon || <MdSearch size={20} />}
        </div>

        <input
          type="text"
          className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-lg focus:ring-primary focus:border-primary block pl-10 pr-10 py-2.5 transition-colors outline-none"
          placeholder={placeholder}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            if (value) onChange(undefined);
          }}
          onClick={() => setIsOpen(true)}
        />

        {/* Botón de Limpiar / Loading */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center">
          {isLoading ? (
            <MdRefresh className="animate-spin text-primary" size={20} />
          ) : (
            (query || value) && (
              <button
                type="button"
                onClick={handleClear}
                className="text-slate-400 hover:text-rose-500 p-1 rounded-full hover:bg-rose-50 transition-colors outline-none"
              >
                <MdClose size={18} />
              </button>
            )
          )}
        </div>
      </div>

      {/* Dropdown de Resultados */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {options.length > 0 ? (
            <ul className="py-1">
              {options.map((option) => (
                <li
                  key={option.value}
                  onClick={() => handleSelect(option)}
                  className="px-4 py-2.5 text-sm text-slate-700 hover:bg-primary/5 hover:text-primary cursor-pointer transition-colors"
                >
                  {option.label}
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-3 text-sm text-slate-500 text-center">
              {isLoading
                ? "Buscando..."
                : query
                ? "No se encontraron resultados"
                : "Escribe para buscar..."}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
