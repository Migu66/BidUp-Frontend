"use client";

import { useState, useEffect, useMemo } from "react";
import type { AuctionDto, CategoryDto } from "@/app/types";
import { AuctionGrid, CategoryFilter } from "@/app/components/auction";
import { getActiveAuctions, getCategories, getAuctionsByCategory } from "@/app/lib/api";

export default function AuctionsPage() {
  const [auctions, setAuctions] = useState<AuctionDto[]>([]);
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  // Cargar subastas cuando cambia la categoría seleccionada
  useEffect(() => {
    async function loadAuctions() {
      setIsLoading(true);
      setError(null);

      try {
        let data: AuctionDto[];

        if (selectedCategory === "all") {
          data = await getActiveAuctions();
        } else {
          data = await getAuctionsByCategory(selectedCategory);
        }

        setAuctions(data);
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Error al cargar las subastas";
        setError(errorMessage);
        setAuctions([]);
      } finally {
        setIsLoading(false);
      }
    }

    loadAuctions();
  }, [selectedCategory]);

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
            Explora todas las subastas disponibles en tiempo real
          </p>
        </div>

        {/* Filtros */}
        <section className="mb-6">
          <CategoryFilter
            categories={categoryFilters}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
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
              onClick={() => setSelectedCategory(selectedCategory)}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Grid de subastas */}
        {!isLoading && !error && (
          <section>
            <AuctionGrid auctions={auctions} viewMode={viewMode} />
          </section>
        )}
      </main>
    </div>
  );
}
