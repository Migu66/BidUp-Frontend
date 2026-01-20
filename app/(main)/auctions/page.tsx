"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import type { CategoryDto } from "@/app/types";
import { AuctionGrid, CategoryFilter, AdvancedFilterPanel } from "@/app/components/auction";
import { getCategories } from "@/app/lib/api";
import { useAdvancedFilters } from "@/app/hooks/useAdvancedFilters";
import { useInfiniteAuctions } from "@/app/hooks/useInfiniteAuctions";

export default function AuctionsPage() {
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const filterButtonRef = useRef<HTMLButtonElement>(null);

  // Hook de infinite scroll - el backend controla la paginación
  const {
    auctions,
    totalCount,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    reset,
    sentinelRef,
  } = useInfiniteAuctions({
    pageSize: 20,
    category: selectedCategory,
  });

  // Hook de filtros avanzados (aplica filtros locales sobre los datos ya cargados)
  const {
    filters,
    updateFilter,
    resetFilters,
    filteredAndSortedAuctions,
    hasActiveFilters,
    isOpen: isFilterPanelOpen,
    setIsOpen: setFilterPanelOpen,
  } = useAdvancedFilters(auctions);

  // Cargar categorías al montar
  useEffect(() => {
    async function loadCategories() {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (err) {
        console.error("Error al cargar categorías:", err);
      }
    }
    loadCategories();
  }, []);

  // Preparar categorías para el filtro (añadiendo "Todas" al inicio)
  const categoryFilters = useMemo(() => {
    const totalAuctions = categories.reduce((sum, cat) => sum + cat.auctionCount, 0);
    return [
      { id: "all", name: "Todas", count: totalAuctions },
      ...categories.map((cat) => ({
        id: cat.id,
        name: cat.name,
        count: cat.auctionCount,
      })),
    ];
  }, [categories]);

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Título */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Subastas Activas
          </h1>
          <p className="text-gray-400">
            {totalCount > 0 
              ? `Mostrando ${auctions.length} de ${totalCount} subastas disponibles`
              : "Explora todas las subastas disponibles en tiempo real"
            }
          </p>
        </div>

        {/* Filtros */}
        <section className="mb-6 relative">
          <CategoryFilter
            categories={categoryFilters}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            onFilterClick={() => setFilterPanelOpen(!isFilterPanelOpen)}
            hasActiveFilters={hasActiveFilters}
            filterButtonRef={filterButtonRef}
          />
          <AdvancedFilterPanel
            isOpen={isFilterPanelOpen}
            onClose={() => setFilterPanelOpen(false)}
            filters={filters}
            onUpdateFilter={updateFilter}
            onReset={resetFilters}
            hasActiveFilters={hasActiveFilters}
            buttonRef={filterButtonRef}
          />
        </section>

        {/* Estado de carga */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4" />
            <p className="text-gray-400">Cargando subastas...</p>
          </div>
        )}

        {/* Error */}
        {error && !isLoading && (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-red-500/10 flex items-center justify-center">
              <span className="text-3xl">⚠️</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Error al cargar subastas
            </h3>
            <p className="text-gray-500 mb-4">{error}</p>
            <button
              onClick={reset}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Grid de subastas */}
        {!isLoading && !error && (
          <section>
            <AuctionGrid auctions={filteredAndSortedAuctions} viewMode={viewMode} />
            
            {/* Sentinel para infinite scroll - cuando es visible, carga más */}
            {hasMore && (
              <div 
                ref={sentinelRef}
                className="flex justify-center py-8"
              >
                {isLoadingMore && (
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                    <span className="text-gray-400 text-sm">Cargando más subastas...</span>
                  </div>
                )}
              </div>
            )}

            {/* Mensaje cuando no hay más subastas */}
            {!hasMore && auctions.length > 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500 text-sm">
                  Has visto todas las subastas disponibles
                </p>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
