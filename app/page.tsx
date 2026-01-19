"use client";

import { useState, useEffect, useMemo } from "react";
import type { AuctionDto, CategoryDto } from "@/app/types";
import { Header, Footer, HeroBanner, RegisterCTA } from "@/app/components/layout";
import { AuctionGrid, CategoryFilter } from "@/app/components/auction";
import { getActiveAuctions, getCategories, getAuctionsByCategory } from "@/app/lib/api";

export default function Home() {
  const [auctions, setAuctions] = useState<AuctionDto[]>([]);
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isLoading, setIsLoading] = useState(true);

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
      try {
        let data: AuctionDto[];

        if (selectedCategory === "all") {
          data = await getActiveAuctions();
        } else {
          data = await getAuctionsByCategory(selectedCategory);
        }

        setAuctions(data);
      } catch (err) {
        console.error("Error al cargar subastas:", err);
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

  // Filtrar subastas por búsqueda local
  const filteredAuctions = useMemo(() => {
    if (searchQuery === "") return auctions;

    return auctions.filter((auction) => {
      return (
        auction.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        auction.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [auctions, searchQuery]);

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <HeroBanner activeAuctions={auctions.length} connectedUsers={2400} />

        <section className="mb-6 animate-fade-in" style={{ animationDelay: "100ms" }}>
          <CategoryFilter
            categories={categoryFilters}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />
        </section>

        <section>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4" />
              <p className="text-gray-400">Cargando subastas...</p>
            </div>
          ) : (
            <AuctionGrid auctions={filteredAuctions} viewMode={viewMode} />
          )}
        </section>

        <RegisterCTA />
      </main>

      <Footer />
    </div>
  );
}
