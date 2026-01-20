"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { AdvancedFilters } from "@/app/hooks/useAdvancedFilters";

interface AdvancedFilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  filters: AdvancedFilters;
  onUpdateFilter: <K extends keyof AdvancedFilters>(
    key: K,
    value: AdvancedFilters[K]
  ) => void;
  onReset: () => void;
  hasActiveFilters: boolean;
  buttonRef?: React.RefObject<HTMLButtonElement | null>;
}

export function AdvancedFilterPanel({
  isOpen,
  onClose,
  filters,
  onUpdateFilter,
  onReset,
  hasActiveFilters,
  buttonRef,
}: AdvancedFilterPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, right: 0 });
  const [mounted, setMounted] = useState(false);

  // Solo montar en el cliente
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        panelRef.current && 
        !panelRef.current.contains(event.target as Node) &&
        buttonRef?.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen, onClose, buttonRef]);

  // Calcular posición cuando se abre el panel y recalcular en resize/scroll
  useEffect(() => {
    function updatePosition() {
      if (buttonRef?.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        setPosition({
          top: rect.bottom + 8,
          right: window.innerWidth - rect.right,
        });
      }
    }

    if (isOpen) {
      updatePosition();
      window.addEventListener("resize", updatePosition);
      window.addEventListener("scroll", updatePosition);
      return () => {
        window.removeEventListener("resize", updatePosition);
        window.removeEventListener("scroll", updatePosition);
      };
    }
  }, [isOpen, buttonRef]);

  console.log("Panel isOpen:", isOpen);

  if (!isOpen || !mounted) return null;

  const panelContent = (
    <div
      ref={panelRef}
      className="fixed z-[9999] w-62 bg-gray-900 border border-gray-800 rounded-xl shadow-2xl p-6"
      style={{
        top: `${position.top}px`,
        right: `${position.right}px`,
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Filtros Avanzados</h3>
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="text-sm text-primary hover:text-primary/80 transition-colors"
          >
            Limpiar
          </button>
        )}
      </div>

      {/* Ordenar por */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-3">
          Ordenar por
        </label>
        <div className="space-y-2">
          {[
            { value: "ending-soon", label: "Terminando pronto" },
            { value: "newest", label: "Más recientes" },
            { value: "most-bids", label: "Más pujadas" },
            { value: "price-asc", label: "Precio: menor a mayor" },
            { value: "price-desc", label: "Precio: mayor a menor" },
          ].map((option) => (
            <label
              key={option.value}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <input
                type="radio"
                name="sortBy"
                value={option.value}
                checked={filters.sortBy === option.value}
                onChange={(e) =>
                  onUpdateFilter(
                    "sortBy",
                    e.target.value as AdvancedFilters["sortBy"]
                  )
                }
                className="w-4 h-4 text-primary bg-gray-800 border-gray-700 focus:ring-primary focus:ring-2"
              />
              <span className="text-sm text-gray-400 group-hover:text-white transition-colors">
                {option.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Rango de precio */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-3">
          Rango de precio (€)
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Mín"
            value={filters.minPrice ?? ""}
            onChange={(e) =>
              onUpdateFilter(
                "minPrice",
                e.target.value ? parseFloat(e.target.value) : undefined
              )
            }
            className="w-20 px-2 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <span className="text-gray-500 text-sm">-</span>
          <input
            type="number"
            placeholder="Máx"
            value={filters.maxPrice ?? ""}
            onChange={(e) =>
              onUpdateFilter(
                "maxPrice",
                e.target.value ? parseFloat(e.target.value) : undefined
              )
            }
            className="w-20 px-2 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* Estado */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-3">
          Estado
        </label>
        <label className="flex items-center gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={filters.endingSoon}
            onChange={(e) => onUpdateFilter("endingSoon", e.target.checked)}
            className="w-4 h-4 text-primary bg-gray-800 border-gray-700 rounded focus:ring-primary focus:ring-2"
          />
          <span className="text-sm text-gray-400 group-hover:text-white transition-colors">
            Terminando pronto (menos de 1 hora)
          </span>
        </label>
      </div>
    </div>
  );

  return createPortal(panelContent, document.body);
}
