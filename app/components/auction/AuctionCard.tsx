import Link from "next/link";
import type { AuctionDto } from "@/app/types";
import { formatTimeRemaining, isEndingVerySoon } from "@/app/lib/utils";
import { formatCurrency } from "@/app/lib/utils";
import { ClockIcon, GavelIcon, FireIcon } from "@/app/components/ui";

interface AuctionCardProps {
  auction: AuctionDto;
  index: number;
}

/**
 * Determina si una subasta es "hot" basándose en el número de pujas
 */
function isHotAuction(totalBids: number): boolean {
  return totalBids >= 20;
}

export function AuctionCard({ auction, index }: AuctionCardProps) {
  const timeDisplay = formatTimeRemaining(auction.timeRemaining);
  const isEnding = isEndingVerySoon(auction.timeRemaining);
  const isHot = isHotAuction(auction.totalBids);

  return (
    <Link
      href={`/auctions/${auction.id}`}
      className="group relative bg-gray-900/80 backdrop-blur-sm border border-gray-800 hover:border-primary/50 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 opacity-0 animate-slide-up"
      style={{ animationDelay: `${index * 75}ms`, animationFillMode: "forwards" }}
    >
      {/* Imagen */}
      <div className="relative aspect-[4/3] bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden">
        {/* Imagen real o placeholder */}
        {auction.imageUrl ? (
          <img
            src={auction.imageUrl}
            alt={auction.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center">
              <GavelIcon className="w-8 h-8 text-gray-500" />
            </div>
          </div>
        )}

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-60" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          <span className="px-2.5 py-1 bg-gray-900/80 backdrop-blur-sm text-xs font-medium text-gray-300 rounded-full">
            {auction.categoryName}
          </span>
          {isHot && (
            <span className="px-2.5 py-1 bg-orange-500/90 backdrop-blur-sm text-xs font-bold text-white rounded-full flex items-center gap-1">
              <FireIcon className="w-3 h-3" />
              Hot
            </span>
          )}
        </div>

        {/* Timer */}
        <div
          className={`absolute top-3 right-3 px-2.5 py-1 backdrop-blur-sm text-xs font-medium rounded-full flex items-center gap-1.5 ${
            isEnding
              ? "bg-red-500/90 text-white animate-pulse-soft"
              : "bg-gray-900/80 text-gray-300"
          }`}
        >
          <ClockIcon className="w-3.5 h-3.5" />
          {timeDisplay}
        </div>
      </div>

      {/* Contenido */}
      <div className="p-4">
        <h3 className="font-semibold text-white group-hover:text-primary transition-colors line-clamp-1 mb-1">
          {auction.title}
        </h3>
        <p className="text-sm text-gray-400 line-clamp-1 mb-4">
          {auction.description}
        </p>

        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Puja actual</p>
            <p className="text-xl font-bold text-white">
              {formatCurrency(auction.currentPrice)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500 mb-0.5">Pujas</p>
            <p className="text-sm font-semibold text-primary">{auction.totalBids}</p>
          </div>
        </div>
      </div>

      {/* Hover effect */}
      <div className="absolute inset-0 border-2 border-primary/0 group-hover:border-primary/50 rounded-2xl transition-colors pointer-events-none" />
    </Link>
  );
}
