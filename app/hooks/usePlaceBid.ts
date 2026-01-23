"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { auctionHub } from "@/app/lib/signalr/auctionHub";
import type { BidDto } from "@/app/types";
import { useAuth } from "@/app/context";

interface UsePlaceBidOptions {
  auctionId: string;
  currentPrice: number;
  minBidIncrement: number;
  onSuccess?: (bid: BidDto) => void;
  onError?: (error: string) => void;
}

interface UsePlaceBidReturn {
  bidAmount: string;
  setBidAmount: (amount: string) => void;
  isSubmitting: boolean;
  error: string | null;
  submitBid: () => Promise<void>;
  quickBid: () => Promise<void>;
  minNextBid: number;
  isValidBid: boolean;
}

// Contador global para identificar pujas únicas
let bidRequestId = 0;

/**
 * Hook para manejar la lógica de realizar pujas vía SignalR.
 * Sin cooldown - el backend controla el rate limiting.
 * Usa la conexión WebSocket existente para máxima eficiencia.
 */
export function usePlaceBid({
  auctionId,
  currentPrice,
  minBidIncrement,
  onSuccess,
  onError,
}: UsePlaceBidOptions): UsePlaceBidReturn {
  const { isAuthenticated } = useAuth();
  const [bidAmount, setBidAmount] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Ref para manejar callback pendiente y evitar race conditions
  const pendingBidIdRef = useRef<number | null>(null);
  
  // Refs para callbacks actuales (evitan closure stale)
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);
  
  useEffect(() => {
    onSuccessRef.current = onSuccess;
    onErrorRef.current = onError;
  }, [onSuccess, onError]);

  // Calcular la puja mínima siguiente
  const minNextBid = currentPrice + minBidIncrement;

  // Validar si la puja actual es válida
  // Debe ser MAYOR que el precio actual para evitar conflictos de redondeo
  const numericBid = parseFloat(bidAmount) || 0;
  const isValidBid = numericBid > currentPrice && numericBid >= minNextBid;

  // Registrar listeners para respuestas de pujas
  useEffect(() => {
    const handleBidAccepted = (bid: BidDto) => {
      console.log("[usePlaceBid] BidAccepted recibido:", bid);
      // Solo procesar si tenemos una puja pendiente
      if (pendingBidIdRef.current !== null) {
        pendingBidIdRef.current = null;
        setIsSubmitting(false);
        setError(null);
        setBidAmount("");
        onSuccessRef.current?.(bid);
      }
    };

    const handleBidError = (errorMessage: string) => {
      console.log("[usePlaceBid] BidError recibido:", errorMessage);
      // Solo procesar si tenemos una puja pendiente
      if (pendingBidIdRef.current !== null) {
        pendingBidIdRef.current = null;
        setIsSubmitting(false);
        setError(errorMessage);
        onErrorRef.current?.(errorMessage);
      }
    };

    const handleNewBid = (data: { auctionId: string; bid: BidDto }) => {
      console.log("[usePlaceBid] onNewBid recibido:", data);
      // Si detectamos que OTRO usuario pujó mientras teníamos una puja pendiente,
      // cancelar nuestro intento porque el precio cambió y nuestra puja ya no es válida
      if (pendingBidIdRef.current !== null && data.auctionId.toLowerCase() === auctionId.toLowerCase()) {
        // Verificar si la puja es de otro usuario (el backend debería enviar bidderId)
        // Si es nuestra propia puja, ya la manejará handleBidAccepted
        // Por seguridad, cancelamos el estado de "procesando" para evitar que se quede trabado
        const isProbablyOurBid = data.bid.amount === parseFloat(bidAmount);
        
        if (!isProbablyOurBid) {
          console.log("[usePlaceBid] Otra persona pujó, cancelando nuestro intento pendiente");
          pendingBidIdRef.current = null;
          setIsSubmitting(false);
          setError("Alguien más realizó una puja. Intenta de nuevo con el nuevo precio.");
        }
      }
    };

    // Suscribirse a los eventos de puja usando el sistema de listeners del hub
    auctionHub.setListeners({
      onBidAccepted: handleBidAccepted,
      onBidError: handleBidError,
    });

    // También escuchar el evento general de nuevas pujas
    auctionHub.on("onNewBid", handleNewBid);

    return () => {
      // Limpiar listeners al desmontar
      auctionHub.off("onBidAccepted");
      auctionHub.off("onBidError");
      auctionHub.off("onNewBid");
      pendingBidIdRef.current = null;
    };
  }, [auctionId, bidAmount]);

  // Función interna para ejecutar la puja vía SignalR
  const executeBid = useCallback(
    async (amount: number) => {
      if (!isAuthenticated) {
        setError("Debes iniciar sesión para pujar");
        onErrorRef.current?.("Debes iniciar sesión para pujar");
        return;
      }

      // Evitar múltiples pujas simultáneas
      if (isSubmitting) {
        return;
      }

      setIsSubmitting(true);
      setError(null);

      // Asignar ID único a esta puja
      const currentBidId = ++bidRequestId;
      pendingBidIdRef.current = currentBidId;

      // Enviar puja vía SignalR (usa WebSocket existente)
      console.log("[usePlaceBid] Enviando puja:", { auctionId, amount, currentBidId });
      await auctionHub.placeBid(auctionId, amount);

      // Timeout de seguridad: si no recibimos respuesta en 10s, fallar
      setTimeout(() => {
        if (pendingBidIdRef.current === currentBidId) {
          pendingBidIdRef.current = null;
          setIsSubmitting(false);
          setError("Tiempo de espera agotado. Inténtalo de nuevo.");
          onErrorRef.current?.("Tiempo de espera agotado. Inténtalo de nuevo.");
        }
      }, 10000);
    },
    [auctionId, isAuthenticated, isSubmitting]
  );

  // Realizar puja con cantidad específica
  const submitBid = useCallback(async () => {
    if (!isValidBid) {
      setError(`La puja debe ser mayor a ${currentPrice.toFixed(2)} €. Puja mínima recomendada: ${minNextBid.toFixed(2)} €`);
      return;
    }

    await executeBid(numericBid);
  }, [numericBid, isValidBid, currentPrice, minNextBid, executeBid]);

  // Puja rápida con el incremento mínimo
  const quickBid = useCallback(async () => {
    await executeBid(minNextBid);
  }, [minNextBid, executeBid]);

  return {
    bidAmount,
    setBidAmount,
    isSubmitting,
    error,
    submitBid,
    quickBid,
    minNextBid,
    isValidBid,
  };
}
