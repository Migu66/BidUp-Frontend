import type { AuctionDto } from "@/app/types";
import { AuctionCard } from "./AuctionCard";
import { SearchIcon } from "@/app/components/ui";

interface AuctionGridProps {
  auctions: AuctionDto[];
  viewMode: "grid" | "list";
}

export function AuctionGrid({ auctions, viewMode }: AuctionGridProps) {
  if (auctions.length === 0) {
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
      {auctions.map((auction, index) => (
        <AuctionCard key={auction.id} auction={auction} index={index} viewMode={viewMode} />
      ))}
    </div>
  );
}
