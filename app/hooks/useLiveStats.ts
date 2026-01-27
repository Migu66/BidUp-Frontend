"use client";

import { useEffect, useState, useRef } from "react";
import { auctionHub } from "@/app/lib/signalr";
import { useAuth } from "@/app/context";
import type { LiveStatsDto } from "@/app/types";

interface UseLiveStatsReturn {
  stats: LiveStatsDto;
  isConnected: boolean;
}

/**
 * Hook para recibir estadísticas en tiempo real del sistema (usuarios conectados, subastas activas).
 * Se conecta a SignalR solo si el usuario está autenticado.
 * Si no hay conexión, devuelve valores por defecto sin bloquear la UI.
 */
export function useLiveStats(initialStats: LiveStatsDto): UseLiveStatsReturn {
  const { isAuthenticated, getValidToken } = useAuth();
  const [stats, setStats] = useState<LiveStatsDto>(initialStats);
  const [isConnected, setIsConnected] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    // Si no hay autenticación, solo mostrar valores iniciales
    if (!isAuthenticated) {
      setIsConnected(false);
      return;
    }

    let cleanupDone = false;

    const connectAndListen = async () => {
      try {
        const accessToken = await getValidToken();
        
        if (!accessToken || !mountedRef.current) {
          return;
        }

        // Conectar al hub
        await auctionHub.connect(accessToken);

        if (!mountedRef.current) {
          return;
        }

        // Escuchar evento de estadísticas globales
        auctionHub.on("onLiveStatsUpdated", (data: LiveStatsDto) => {
          if (mountedRef.current) {
            setStats(data);
          }
        });

        setIsConnected(true);
      } catch (error) {
        // Silenciar completamente - el indicador visual muestra el estado
        setIsConnected(false);
      }
    };

    connectAndListen();

    // Cleanup
    return () => {
      mountedRef.current = false;
      if (!cleanupDone) {
        cleanupDone = true;
        auctionHub.off("onLiveStatsUpdated");
      }
    };
  }, [isAuthenticated, getValidToken]);

  return {
    stats,
    isConnected,
  };
}
