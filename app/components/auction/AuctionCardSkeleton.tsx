interface AuctionCardSkeletonProps {
  viewMode?: "grid" | "list";
}

export function AuctionCardSkeleton({ viewMode = "grid" }: AuctionCardSkeletonProps) {
  // Vista de lista compacta
  if (viewMode === "list") {
    return (
      <div className="bg-gray-900/80 border border-gray-800 rounded-xl overflow-hidden animate-pulse">
        <div className="flex items-center gap-4 p-4">
          {/* Info principal */}
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center gap-2">
              <div className="h-5 bg-gray-700 rounded w-40" />
              <div className="h-5 bg-gray-800 rounded-full w-20" />
            </div>
            <div className="h-4 bg-gray-800 rounded w-64" />
          </div>

          {/* Precio */}
          <div className="text-center shrink-0 space-y-1">
            <div className="h-3 bg-gray-800 rounded w-14 mx-auto" />
            <div className="h-6 bg-gray-700 rounded w-20" />
          </div>

          {/* Pujas */}
          <div className="text-center shrink-0 w-16 space-y-1">
            <div className="h-3 bg-gray-800 rounded w-10 mx-auto" />
            <div className="h-4 bg-gray-700 rounded w-8 mx-auto" />
          </div>

          {/* Timer */}
          <div className="h-8 bg-gray-800 rounded-full w-24 shrink-0" />
        </div>
      </div>
    );
  }

  // Vista de grid (original)
  return (
    <div className="bg-gray-900/80 border border-gray-800 rounded-2xl overflow-hidden animate-pulse">
      {/* Imagen skeleton */}
      <div className="relative aspect-[4/3] bg-gradient-to-br from-gray-800 to-gray-900">
        {/* Badge categoría */}
        <div className="absolute top-3 left-3">
          <div className="h-6 bg-gray-700/80 rounded-full w-20" />
        </div>
        {/* Timer */}
        <div className="absolute top-3 right-3">
          <div className="h-6 bg-gray-800/80 rounded-full w-16" />
        </div>
      </div>

      {/* Contenido */}
      <div className="p-4 space-y-3">
        {/* Título */}
        <div className="h-5 bg-gray-700 rounded w-3/4" />
        
        {/* Descripción */}
        <div className="space-y-1.5">
          <div className="h-3 bg-gray-800 rounded w-full" />
          <div className="h-3 bg-gray-800 rounded w-2/3" />
        </div>

        {/* Precio y pujas */}
        <div className="flex items-center justify-between pt-2">
          <div className="space-y-1">
            <div className="h-3 bg-gray-800 rounded w-14" />
            <div className="h-6 bg-gray-700 rounded w-20" />
          </div>
          <div className="space-y-1 text-right">
            <div className="h-3 bg-gray-800 rounded w-10 ml-auto" />
            <div className="h-5 bg-gray-700 rounded w-8 ml-auto" />
          </div>
        </div>
      </div>
    </div>
  );
}

interface AuctionGridSkeletonProps {
  count?: number;
  viewMode?: "grid" | "list";
}

export function AuctionGridSkeleton({ count = 4, viewMode = "grid" }: AuctionGridSkeletonProps) {
  return (
    <div
      className={`grid gap-4 ${
        viewMode === "grid"
          ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          : "grid-cols-1"
      }`}
    >
      {Array.from({ length: count }).map((_, index) => (
        <AuctionCardSkeleton key={index} viewMode={viewMode} />
      ))}
    </div>
  );
}
