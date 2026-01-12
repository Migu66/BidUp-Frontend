"use client";

import { useState, useMemo } from "react";
import type { AuctionDto } from "@/app/types";
import { Header, Footer, HeroBanner, RegisterCTA } from "@/app/components/layout";
import { AuctionGrid, CategoryFilter } from "@/app/components/auction";

// Categorías de ejemplo (vendrán del backend)
const categories = [
  { id: "all", name: "Todas", count: 156 },
  { id: "tech", name: "Tecnología", count: 42 },
  { id: "art", name: "Arte", count: 28 },
  { id: "watches", name: "Relojes", count: 35 },
  { id: "cars", name: "Vehículos", count: 18 },
  { id: "collectibles", name: "Coleccionables", count: 33 },
];

// Datos de ejemplo que simulan la respuesta del backend
// Estos datos siguen la estructura de AuctionDto del backend
const mockAuctions: AuctionDto[] = [
  {
    id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    title: "Rolex Submariner Date 2024",
    description: "Reloj de lujo en perfecto estado, con caja y documentación original",
    imageUrl: null,
    startingPrice: 8000,
    currentPrice: 12500,
    minBidIncrement: 100,
    startTime: "2026-01-10T10:00:00Z",
    endTime: "2026-01-12T14:34:00Z",
    status: "Active",
    totalBids: 47,
    timeRemaining: "02:34:00",
    sellerId: "user-1",
    sellerName: "Carlos Martínez",
    categoryId: "cat-watches",
    categoryName: "Relojes",
    latestBid: {
      id: "bid-1",
      amount: 12500,
      timestamp: "2026-01-12T11:30:00Z",
      isWinning: true,
      bidderId: "user-2",
      bidderName: "Ana García",
      auctionId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
    }
  },
  {
    id: "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    title: "MacBook Pro M3 Max 96GB",
    description: "Último modelo, configuración máxima, sin uso",
    imageUrl: null,
    startingPrice: 2500,
    currentPrice: 3200,
    minBidIncrement: 50,
    startTime: "2026-01-11T08:00:00Z",
    endTime: "2026-01-12T17:12:00Z",
    status: "Active",
    totalBids: 23,
    timeRemaining: "05:12:00",
    sellerId: "user-3",
    sellerName: "Tech Store Pro",
    categoryId: "cat-tech",
    categoryName: "Tecnología",
    latestBid: null
  },
  {
    id: "c3d4e5f6-a7b8-9012-cdef-123456789012",
    title: "Óleo Original - Atardecer Mediterráneo",
    description: "Pintura al óleo sobre lienzo, 80x60cm, firmada por artista reconocido",
    imageUrl: null,
    startingPrice: 500,
    currentPrice: 1800,
    minBidIncrement: 25,
    startTime: "2026-01-09T12:00:00Z",
    endTime: "2026-01-13T15:00:00Z",
    status: "Active",
    totalBids: 15,
    timeRemaining: "1.03:00:00",
    sellerId: "user-4",
    sellerName: "Galería Arte Moderno",
    categoryId: "cat-art",
    categoryName: "Arte",
    latestBid: null
  },
  {
    id: "d4e5f6a7-b8c9-0123-defa-234567890123",
    title: "Cámara Sony A7 IV + 24-70mm",
    description: "Kit completo con objetivo zoom profesional, incluye batería extra",
    imageUrl: null,
    startingPrice: 1800,
    currentPrice: 2400,
    minBidIncrement: 30,
    startTime: "2026-01-11T14:00:00Z",
    endTime: "2026-01-12T12:45:00Z",
    status: "Active",
    totalBids: 89,
    timeRemaining: "00:45:00",
    sellerId: "user-5",
    sellerName: "PhotoPro Equipment",
    categoryId: "cat-tech",
    categoryName: "Tecnología",
    latestBid: null
  },
  {
    id: "e5f6a7b8-c9d0-1234-efab-345678901234",
    title: "Colección Vinilos Beatles - Primera Edición",
    description: "Set completo de 12 álbumes originales UK pressing de los años 60",
    imageUrl: null,
    startingPrice: 2000,
    currentPrice: 4500,
    minBidIncrement: 75,
    startTime: "2026-01-08T10:00:00Z",
    endTime: "2026-01-12T20:20:00Z",
    status: "Active",
    totalBids: 34,
    timeRemaining: "08:20:00",
    sellerId: "user-6",
    sellerName: "Vinyl Collectors",
    categoryId: "cat-collectibles",
    categoryName: "Coleccionables",
    latestBid: null
  },
  {
    id: "f6a7b8c9-d0e1-2345-fabc-456789012345",
    title: "Porsche 911 Carrera S 2020",
    description: "20.000km, único dueño, mantenimiento oficial completo",
    imageUrl: null,
    startingPrice: 85000,
    currentPrice: 98000,
    minBidIncrement: 500,
    startTime: "2026-01-05T09:00:00Z",
    endTime: "2026-01-14T17:00:00Z",
    status: "Active",
    totalBids: 12,
    timeRemaining: "2.05:00:00",
    sellerId: "user-7",
    sellerName: "Premium Cars Madrid",
    categoryId: "cat-cars",
    categoryName: "Vehículos",
    latestBid: null
  },
  {
    id: "a7b8c9d0-e1f2-3456-abcd-567890123456",
    title: "iPad Pro 12.9\" M2 + Apple Pencil",
    description: "256GB WiFi + Cellular, Magic Keyboard incluido, estado impecable",
    imageUrl: null,
    startingPrice: 700,
    currentPrice: 950,
    minBidIncrement: 20,
    startTime: "2026-01-10T16:00:00Z",
    endTime: "2026-01-12T15:45:00Z",
    status: "Active",
    totalBids: 28,
    timeRemaining: "03:45:00",
    sellerId: "user-8",
    sellerName: "Apple Resellers",
    categoryId: "cat-tech",
    categoryName: "Tecnología",
    latestBid: null
  },
  {
    id: "b8c9d0e1-f2a3-4567-bcde-678901234567",
    title: "Omega Speedmaster Professional Moonwatch",
    description: "Edición 50 aniversario Apollo 11, numerado, con certificado",
    imageUrl: null,
    startingPrice: 6500,
    currentPrice: 8900,
    minBidIncrement: 150,
    startTime: "2026-01-09T11:00:00Z",
    endTime: "2026-01-12T18:15:00Z",
    status: "Active",
    totalBids: 41,
    timeRemaining: "06:15:00",
    sellerId: "user-9",
    sellerName: "Watch Collectors Club",
    categoryId: "cat-watches",
    categoryName: "Relojes",
    latestBid: null
  },
];

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Filtrar subastas basándose en categoría y búsqueda
  const filteredAuctions = useMemo(() => {
    return mockAuctions.filter((auction) => {
      const categoryMatch =
        selectedCategory === "all" ||
        auction.categoryName.toLowerCase() ===
          categories.find((c) => c.id === selectedCategory)?.name.toLowerCase();

      const searchMatch =
        searchQuery === "" ||
        auction.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        auction.description.toLowerCase().includes(searchQuery.toLowerCase());

      return categoryMatch && searchMatch;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <HeroBanner activeAuctions={mockAuctions.length} connectedUsers={2400} />

        <section className="mb-6 animate-fade-in" style={{ animationDelay: "100ms" }}>
          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />
        </section>

        <section>
          <AuctionGrid auctions={filteredAuctions} viewMode={viewMode} />
        </section>

        <RegisterCTA />
      </main>

      <Footer />
    </div>
  );
}
