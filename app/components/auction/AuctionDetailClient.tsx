"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/app/context";
import { getAuctionById, getAuctionBids } from "@/app/lib/api";
import { useAuctionSignalR } from "@/app/hooks/useAuctionSignalR";
import { usePlaceBid } from "@/app/hooks/usePlaceBid";
import { formatCurrency, formatTimeRemaining, parseTimeRemaining, isEndingVerySoon } from "@/app/lib/utils";
import type { AuctionDto, BidDto, BidNotificationDto, AuctionStatusNotificationDto, AuctionTimerSyncDto } from "@/app/types";
import { ClockIcon, GavelIcon, FireIcon, UserIcon } from "@/app/components/ui";
import { SimpleHeader } from "@/app/components/layout";

interface AuctionDetailClientProps {
  auctionId: string;
}

export function AuctionDetailClient({ auctionId }: AuctionDetailClientProps) {
  const { user, isAuthenticated } = useAuth();
  
  // Estado de la subasta
  const [auction, setAuction] = useState<AuctionDto | null>(null);
  const [bids, setBids] = useState<BidDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estado de UI
  const [showAllBids, setShowAllBids] = useState(false);
  const [bidSuccess, setBidSuccess] = useState(false);

  // Callbacks para SignalR
  const handleBidPlaced = useCallback((data: BidNotificationDto) => {
    setAuction((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        currentPrice: data.newCurrentPrice,
        totalBids: data.totalBids,
        timeRemaining: data.timeRemaining,
        latestBid: data.bid,
      };
    });
    
    // Agregar la puja al historial
    setBids((prev) => [data.bid, ...prev]);
  }, []);

  const handleAuctionUpdated = useCallback((data: AuctionStatusNotificationDto) => {
    setAuction((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        status: data.status as AuctionDto["status"],
      };
    });
  }, []);

  const handleTimerSync = useCallback((data: AuctionTimerSyncDto) => {
    setAuction((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        timeRemaining: data.timeRemaining,
        endTime: data.endTime,
      };
    });
  }, []);

  // Conexión SignalR
  const { isConnected, isConnecting, error: signalRError } = useAuctionSignalR({
    auctionId,
    onBidPlaced: handleBidPlaced,
    onAuctionUpdated: handleAuctionUpdated,
    onTimerSync: handleTimerSync,
  });

  // Verificar si el usuario es el propietario de la subasta
  const isOwner = isAuthenticated && user?.userId === auction?.sellerId;

  // Función para recargar datos de la subasta
  const refreshAuctionData = useCallback(async () => {
    try {
      const [auctionData, bidsData] = await Promise.all([
        getAuctionById(auctionId),
        getAuctionBids(auctionId),
      ]);
      setAuction(auctionData);
      setBids(bidsData);
    } catch {
      // Silenciar errores de recarga
    }
  }, [auctionId]);

  // Hook para pujas
  const {
    bidAmount,
    setBidAmount,
    isSubmitting,
    error: bidError,
    submitBid,
    quickBid,
    minNextBid,
    isValidBid,
  } = usePlaceBid({
    auctionId,
    currentPrice: auction?.currentPrice ?? 0,
    minBidIncrement: auction?.minBidIncrement ?? 1,
    onSuccess: (bid) => {
      // Actualizar UI localmente con la nueva puja
      setAuction((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          currentPrice: bid.amount,
          totalBids: prev.totalBids + 1,
          latestBid: bid,
        };
      });
      // Agregar la puja al historial
      setBids((prev) => [bid, ...prev]);
      // Mostrar mensaje de éxito
      setBidSuccess(true);
      setTimeout(() => setBidSuccess(false), 3000);
    },
    onError: () => {
      // Cuando falla una puja, recargar datos para sincronizar con el servidor
      refreshAuctionData();
    },
  });

  // Cargar datos iniciales
  useEffect(() => {
    async function loadAuctionData() {
      setIsLoading(true);
      setError(null);

      try {
        const [auctionData, bidsData] = await Promise.all([
          getAuctionById(auctionId),
          getAuctionBids(auctionId),
        ]);

        setAuction(auctionData);
        setBids(bidsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar la subasta");
      } finally {
        setIsLoading(false);
      }
    }

    loadAuctionData();
  }, [auctionId]);

  // Loading state
  if (isLoading) {
    return (
      <>
        <SimpleHeader />
        <AuctionDetailSkeleton />
      </>
    );
  }

  // Error state
  if (error || !auction) {
    return (
      <>
        <SimpleHeader />
        <div className="min-h-screen bg-gray-950 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">
              {error || "Subasta no encontrada"}
            </h1>
            <Link
              href="/"
              className="text-primary hover:underline"
            >
              Volver a subastas
            </Link>
          </div>
        </div>
      </>
    );
  }

  const isEnding = isEndingVerySoon(auction.timeRemaining);
  const isActive = auction.status === "Active";
  const timeDisplay = formatTimeRemaining(auction.timeRemaining);
  const displayedBids = showAllBids ? bids : bids.slice(0, 5);

  return (
    <>
      <SimpleHeader />
      <div className="min-h-screen bg-gray-950">
        {/* Breadcrumb de navegación */}
        <div className="border-b border-gray-800">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <nav className="flex items-center gap-2 text-sm text-gray-400">
              <Link href="/" className="hover:text-white transition-colors">
                Subastas
              </Link>
              <span>/</span>
              <span className="text-gray-500">{auction.categoryName}</span>
              <span>/</span>
              <span className="text-white">{auction.title}</span>
            </nav>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Columna izquierda: Imagen y descripción */}
          <div className="space-y-6">
            {/* Imagen de la subasta */}
            <div className="relative aspect-square bg-gray-900 rounded-2xl overflow-hidden border border-gray-800">
              {auction.imageUrl ? (
                <img
                  src={auction.imageUrl}
                  alt={auction.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <GavelIcon className="w-24 h-24 text-gray-700" />
                </div>
              )}
              
              {/* Badge de estado */}
              <div className="absolute top-4 left-4">
                <span className={`px-3 py-1.5 rounded-full text-sm font-semibold ${
                  isActive
                    ? "bg-green-500/90 text-white"
                    : auction.status === "Completed"
                    ? "bg-gray-600 text-white"
                    : "bg-red-500/90 text-white"
                }`}>
                  {isActive ? "En vivo" : auction.status === "Completed" ? "Finalizada" : auction.status}
                </span>
              </div>

              {/* Badge hot */}
              {auction.totalBids >= 20 && (
                <div className="absolute top-4 right-4">
                  <span className="px-3 py-1.5 bg-orange-500/90 rounded-full text-sm font-bold text-white flex items-center gap-1">
                    <FireIcon className="w-4 h-4" />
                    Hot
                  </span>
                </div>
              )}
            </div>

            {/* Descripción */}
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-3">Descripción</h2>
              <p className="text-gray-400 leading-relaxed">
                {auction.description || "Sin descripción disponible."}
              </p>
            </div>

            {/* Información del vendedor */}
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-3">Vendedor</h2>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center">
                  <UserIcon className="w-6 h-6 text-gray-500" />
                </div>
                <div>
                  <p className="font-medium text-white">{auction.sellerName}</p>
                  <p className="text-sm text-gray-500">Vendedor verificado</p>
                </div>
              </div>
            </div>
          </div>

          {/* Columna derecha: Info de puja */}
          <div className="space-y-6">
            {/* Título y categoría */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 bg-gray-800 text-sm font-medium text-gray-400 rounded-full">
                  {auction.categoryName}
                </span>
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">
                {auction.title}
              </h1>
            </div>

            {/* Timer prominente */}
            <div className={`p-6 rounded-xl border ${
              isEnding
                ? "bg-red-500/10 border-red-500/50"
                : "bg-gray-900/50 border-gray-800"
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ClockIcon className={`w-8 h-8 ${isEnding ? "text-red-500 animate-pulse" : "text-primary"}`} />
                  <div>
                    <p className="text-sm text-gray-400">
                      {isActive ? "Tiempo restante" : "Estado"}
                    </p>
                    <p className={`text-2xl font-bold ${isEnding ? "text-red-500" : "text-white"}`}>
                      {timeDisplay}
                    </p>
                  </div>
                </div>
                
                {/* Indicador de conexión en tiempo real */}
                {isAuthenticated && (
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      isConnected ? "bg-green-500" : isConnecting ? "bg-yellow-500 animate-pulse" : "bg-gray-500"
                    }`} />
                    <span className="text-xs text-gray-500">
                      {isConnected ? "En vivo" : isConnecting ? "Conectando..." : "Sin conexión"}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Precio actual */}
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
              <div className="flex items-baseline justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Puja actual</p>
                  <p className="text-4xl font-bold text-white">
                    {formatCurrency(auction.currentPrice)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-400 mb-1">Pujas totales</p>
                  <p className="text-2xl font-bold text-primary">{auction.totalBids}</p>
                </div>
              </div>

              <div className="text-sm text-gray-500">
                <p>Precio inicial: {formatCurrency(auction.startingPrice)}</p>
                <p>Incremento mínimo: {formatCurrency(auction.minBidIncrement)}</p>
              </div>
            </div>

            {/* Panel de puja */}
            {isActive && (
              <div className="bg-gradient-to-br from-primary/10 to-primary/5 backdrop-blur-sm border border-primary/30 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Realizar puja</h2>
                
                {!isAuthenticated ? (
                  <div className="text-center py-4">
                    <p className="text-gray-400 mb-4">Inicia sesión para participar</p>
                    <Link
                      href="/login"
                      className="inline-flex items-center justify-center px-6 py-3 bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg transition-colors"
                    >
                      Iniciar sesión
                    </Link>
                  </div>
                ) : isOwner ? (
                  <div className="text-center py-4">
                    <div className="p-3 bg-yellow-500/20 border border-yellow-500/50 rounded-lg text-yellow-400 text-sm mb-4">
                      No puedes pujar en tu propia subasta
                    </div>
                    <p className="text-gray-400 text-sm">
                      Eres el vendedor de este artículo
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Mensaje de éxito */}
                    {bidSuccess && (
                      <div className="p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-green-400 text-sm">
                        ¡Puja realizada con éxito!
                      </div>
                    )}

                    {/* Error */}
                    {bidError && (
                      <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
                        {bidError}
                      </div>
                    )}

                    {/* Puja rápida */}
                    <button
                      onClick={quickBid}
                      disabled={isSubmitting}
                      className="w-full py-4 bg-primary hover:bg-primary/90 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold text-lg rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <span className="animate-pulse">Procesando...</span>
                      ) : (
                        <>
                          <GavelIcon className="w-5 h-5" />
                          Pujar {formatCurrency(minNextBid)}
                        </>
                      )}
                    </button>

                    {/* Puja personalizada */}
                    <div className="relative">
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">€</span>
                          <input
                            type="number"
                            value={bidAmount}
                            onChange={(e) => setBidAmount(e.target.value)}
                            placeholder={minNextBid.toFixed(2)}
                            min={minNextBid}
                            step={auction.minBidIncrement}
                            className="w-full pl-8 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-colors"
                          />
                        </div>
                        <button
                          onClick={submitBid}
                          disabled={isSubmitting || !bidAmount || !isValidBid}
                          className="px-6 py-3 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
                        >
                          Pujar
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Puja mínima: {formatCurrency(minNextBid)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Subasta finalizada */}
            {auction.status === "Completed" && (
              <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6 text-center">
                <h2 className="text-lg font-semibold text-white mb-2">Subasta finalizada</h2>
                {auction.latestBid ? (
                  <div>
                    <p className="text-gray-400 mb-2">Ganador:</p>
                    <p className="text-xl font-bold text-primary">{auction.latestBid.bidderName}</p>
                    <p className="text-2xl font-bold text-white mt-2">
                      {formatCurrency(auction.latestBid.amount)}
                    </p>
                  </div>
                ) : (
                  <p className="text-gray-400">Sin pujas</p>
                )}
              </div>
            )}

            {/* Historial de pujas */}
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">
                  Historial de pujas ({bids.length})
                </h2>
              </div>

              {bids.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  Aún no hay pujas. ¡Sé el primero!
                </p>
              ) : (
                <div className="space-y-3">
                  {displayedBids.map((bid, index) => (
                    <BidHistoryItem
                      key={bid.id}
                      bid={bid}
                      isWinning={index === 0}
                    />
                  ))}

                  {bids.length > 5 && (
                    <button
                      onClick={() => setShowAllBids(!showAllBids)}
                      className="w-full py-2 text-sm text-primary hover:text-primary/80 transition-colors"
                    >
                      {showAllBids ? "Ver menos" : `Ver todas las pujas (${bids.length})`}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}

function BidHistoryItem({ bid, isWinning }: { bid: BidDto; isWinning: boolean }) {
  const formattedTime = new Date(bid.timestamp).toLocaleString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className={`flex items-center justify-between p-3 rounded-lg ${
      isWinning ? "bg-primary/10 border border-primary/30" : "bg-gray-800/50"
    }`}>
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
          <UserIcon className="w-4 h-4 text-gray-400" />
        </div>
        <div>
          <p className={`font-medium ${isWinning ? "text-primary" : "text-white"}`}>
            {bid.bidderName}
          </p>
          <p className="text-xs text-gray-500">{formattedTime}</p>
        </div>
      </div>
      <div className="text-right">
        <p className={`font-bold ${isWinning ? "text-primary" : "text-white"}`}>
          {formatCurrency(bid.amount)}
        </p>
        {isWinning && (
          <span className="text-xs text-primary">Puja ganadora</span>
        )}
      </div>
    </div>
  );
}

function AuctionDetailSkeleton() {
  return (
    <div className="min-h-screen bg-gray-950 animate-pulse">
      <div className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="h-4 bg-gray-800 rounded w-64" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="aspect-square bg-gray-800 rounded-2xl" />
            <div className="h-32 bg-gray-800 rounded-xl" />
          </div>
          <div className="space-y-6">
            <div className="h-8 bg-gray-800 rounded w-32" />
            <div className="h-12 bg-gray-800 rounded w-3/4" />
            <div className="h-24 bg-gray-800 rounded-xl" />
            <div className="h-32 bg-gray-800 rounded-xl" />
            <div className="h-48 bg-gray-800 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
