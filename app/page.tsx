"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import type { CategoryDto } from "@/app/types";
import { Header, Footer, HeroBanner, RegisterCTA } from "@/app/components/layout";
import { AuctionGrid, CategoryFilter, AdvancedFilterPanel } from "@/app/components/auction";
import { getCategories } from "@/app/lib/api";
import { useAuth } from "@/app/context";
import { useAdvancedFilters } from "@/app/hooks/useAdvancedFilters";
import { useInfiniteAuctions } from "@/app/hooks/useInfiniteAuctions";

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const filterButtonRef = useRef<HTMLButtonElement>(null);

  // Hook de infinite scroll - el backend controla la paginación
  const {
    auctions,
    totalCount,
    isLoading,
    isLoadingMore,
    hasMore,
    sentinelRef,
  } = useInfiniteAuctions({
    pageSize: 20,
    category: selectedCategory,
  });

  // Hook de filtros avanzados
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

  // Filtrar subastas por búsqueda local y aplicar filtros avanzados
  const filteredAuctions = useMemo(() => {
    let result = filteredAndSortedAuctions;
    
    if (searchQuery !== "") {
      result = result.filter((auction) => {
        return (
          auction.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          auction.description.toLowerCase().includes(searchQuery.toLowerCase())
        );
      });
    }
    
    return result;
  }, [filteredAndSortedAuctions, searchQuery]);

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <HeroBanner activeAuctions={totalCount} connectedUsers={2400} />

        <section className="mb-6 animate-fade-in relative" style={{ animationDelay: "100ms" }}>
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

        <section>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4" />
              <p className="text-gray-400">Cargando subastas...</p>
            </div>
          ) : (
            <>
              <AuctionGrid auctions={filteredAuctions} viewMode={viewMode} />
              
              {/* Sentinel para infinite scroll */}
              {hasMore && (
                <div ref={sentinelRef} className="flex justify-center py-8">
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
            </>
          )}
        </section>

        {!isAuthenticated && <RegisterCTA />}
      </main>

      <Footer />
    </div>
  );
}
