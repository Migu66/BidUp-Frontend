"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { auctionHub } from "@/app/lib/signalr";
import type {
  BidNotificationDto,
  AuctionStatusNotificationDto,
  AuctionTimerSyncDto,
} from "@/app/types";
import { useAuth } from "@/app/context";

interface UseAuctionSignalROptions {
  auctionId: string;
  onBidPlaced?: (data: BidNotificationDto) => void;
  onAuctionUpdated?: (data: AuctionStatusNotificationDto) => void;
  onTimerSync?: (data: AuctionTimerSyncDto) => void;
}

interface UseAuctionSignalRReturn {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  requestTimerSync: () => Promise<void>;
}

/**
 * Hook para manejar la conexión SignalR en la página de detalle de subasta.
 * Solo intenta conectar si el usuario está autenticado con un token válido.
 * Si no hay autenticación, la página funciona normalmente sin actualizaciones en tiempo real.
 */
export function useAuctionSignalR({
  auctionId,
  onBidPlaced,
  onAuctionUpdated,
  onTimerSync,
}: UseAuctionSignalROptions): UseAuctionSignalRReturn {
  const { isAuthenticated, getValidToken } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Refs para los callbacks (evitar reconexiones por cambios de callback)
  const onBidPlacedRef = useRef(onBidPlaced);
  const onAuctionUpdatedRef = useRef(onAuctionUpdated);
  const onTimerSyncRef = useRef(onTimerSync);

  // Actualizar refs cuando cambien los callbacks
  useEffect(() => {
    onBidPlacedRef.current = onBidPlaced;
    onAuctionUpdatedRef.current = onAuctionUpdated;
    onTimerSyncRef.current = onTimerSync;
  }, [onBidPlaced, onAuctionUpdated, onTimerSync]);

  // Conectar y configurar SignalR solo si hay autenticación válida
  useEffect(() => {
    if (!isAuthenticated) {
      // Sin autenticación válida, no conectamos a SignalR
      // La página funciona normalmente pero sin actualizaciones en tiempo real
      setIsConnected(false);
      setIsConnecting(false);
      setError(null);
      return;
    }

    let isMounted = true;

    const connectAndJoin = async () => {
      // Obtener token válido (refresca automáticamente si es necesario)
      const accessToken = await getValidToken();
      
      if (!accessToken) {
        setIsConnected(false);
        setIsConnecting(false);
        return;
      }
      setIsConnecting(true);
      setError(null);

      try {
        // Conectar al hub con el token
        await auctionHub.connect(accessToken);

        // Configurar listeners solo después de conectar exitosamente
        auctionHub.on("onNewBid", (data) => {
          console.log("[Hook] onNewBid recibido, auctionId:", data.auctionId, "esperado:", auctionId);
          // Comparar ignorando case porque GUIDs pueden venir en diferentes formatos
          if (data.auctionId.toLowerCase() === auctionId.toLowerCase()) {
            onBidPlacedRef.current?.(data);
          }
        });

        auctionHub.on("onAuctionStatusChanged", (data) => {
          console.log("[Hook] onAuctionStatusChanged recibido:", data.auctionId);
          if (data.auctionId.toLowerCase() === auctionId.toLowerCase()) {
            onAuctionUpdatedRef.current?.(data);
          }
        });

        auctionHub.on("onTimerSync", (data) => {
          if (data.auctionId.toLowerCase() === auctionId.toLowerCase()) {
            onTimerSyncRef.current?.(data);
          }
        });

        auctionHub.on("onAuctionEnded", (data) => {
          console.log("[Hook] onAuctionEnded recibido:", data.auctionId);
          if (data.auctionId.toLowerCase() === auctionId.toLowerCase()) {
            onAuctionUpdatedRef.current?.(data);
          }
        });

        // Unirse a la sala de la subasta
        await auctionHub.joinAuction(auctionId);
        console.log("[Hook] Unido a la sala de subasta:", auctionId);

        if (isMounted) {
          setIsConnected(true);
          setIsConnecting(false);
        }
      } catch (err) {
        // Solo loguear en desarrollo, no mostrar errores de auth al usuario
        if (process.env.NODE_ENV === "development") {
          console.warn("SignalR connection skipped or failed:", err);
        }
        
        if (isMounted) {
          // No mostrar error si es un problema de autenticación
          // El usuario puede seguir usando la página sin tiempo real
          setError(null);
          setIsConnecting(false);
          setIsConnected(false);
        }
      }
    };

    connectAndJoin();

    // Cleanup al desmontar
    return () => {
      isMounted = false;
      // Solo intentar limpiar si estábamos conectados
      if (auctionHub.isConnected()) {
        auctionHub.leaveAuction(auctionId);
      }
      auctionHub.off("onNewBid");
      auctionHub.off("onAuctionStatusChanged");
      auctionHub.off("onTimerSync");
      auctionHub.off("onAuctionEnded");
    };
  }, [auctionId, isAuthenticated, getValidToken]);

  // Función para solicitar sincronización del timer
  const requestTimerSync = useCallback(async () => {
    if (isConnected) {
      await auctionHub.requestTimerSync(auctionId);
    }
  }, [auctionId, isConnected]);

  return {
    isConnected,
    isConnecting,
    error,
    requestTimerSync,
  };
}
