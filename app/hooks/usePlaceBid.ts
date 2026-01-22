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
  const numericBid = parseFloat(bidAmount) || 0;
  const isValidBid = numericBid >= minNextBid;

  // Registrar listeners para respuestas de pujas
  useEffect(() => {
    const handleBidAccepted = (bid: BidDto) => {
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
      // Solo procesar si tenemos una puja pendiente
      if (pendingBidIdRef.current !== null) {
        pendingBidIdRef.current = null;
        setIsSubmitting(false);
        setError(errorMessage);
        onErrorRef.current?.(errorMessage);
      }
    };

    // Suscribirse a los eventos de puja
    auctionHub.on("onBidAccepted", handleBidAccepted);
    auctionHub.on("onBidError", handleBidError);

    return () => {
      // Cancelar puja pendiente al desmontar
      pendingBidIdRef.current = null;
    };
  }, []);

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
      setError(`La puja mínima es ${minNextBid.toFixed(2)} €`);
      return;
    }

    await executeBid(numericBid);
  }, [numericBid, isValidBid, minNextBid, executeBid]);

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
