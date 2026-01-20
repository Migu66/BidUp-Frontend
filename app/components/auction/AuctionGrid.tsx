import type { AuctionDto } from "@/app/types";
import { AuctionCard } from "./AuctionCard";
import { AuctionCardSkeleton } from "./AuctionCardSkeleton";
import { SearchIcon } from "@/app/components/ui";

interface AuctionGridProps {
  auctions: AuctionDto[];
  viewMode: "grid" | "list";
  skeletonCount?: number; // Número de skeletons a mostrar al final
  showEmptyState?: boolean; // Mostrar estado vacío cuando no hay subastas
  initialLoadCount?: number; // Cuántas subastas son de la carga inicial (para animaciones)
}

export function AuctionGrid({ 
  auctions, 
  viewMode, 
  skeletonCount = 0,
  showEmptyState = true,
  initialLoadCount = 20 // Por defecto, la primera página
}: AuctionGridProps) {
  // Solo mostrar estado vacío si no hay skeletons (carga inicial completada)
  if (auctions.length === 0 && skeletonCount === 0 && showEmptyState) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-900 flex items-center justify-center">
          <SearchIcon className="w-8 h-8 text-gray-600" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">
          No se encontraron subastas
        </h3>
        <p className="text-gray-500">
          Intenta con otros filtros o términos de búsqueda
        </p>
      </div>
    );
  }

  return (
    <div
      className={`grid gap-4 ${
        viewMode === "grid"
          ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          : "grid-cols-1"
      }`}
    >
      {/* Subastas reales */}
      {auctions.map((auction, index) => (
        <AuctionCard 
          key={auction.id} 
          auction={auction} 
          index={index} 
          viewMode={viewMode}
          skipAnimation={index >= initialLoadCount} // Sin delay para cargas adicionales
        />
      ))}
      
      {/* Skeletons en las posiciones siguientes */}
      {Array.from({ length: skeletonCount }).map((_, index) => (
        <AuctionCardSkeleton key={`skeleton-${index}`} viewMode={viewMode} />
      ))}
    </div>
  );
}
