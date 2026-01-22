"use client";

import { useState, useCallback } from "react";
import { placeBid, BidError } from "@/app/lib/api/bids";
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

/**
 * Hook para manejar la lógica de realizar pujas
 */
export function usePlaceBid({
  auctionId,
  currentPrice,
  minBidIncrement,
  onSuccess,
  onError,
}: UsePlaceBidOptions): UsePlaceBidReturn {
  const { isAuthenticated, getValidToken } = useAuth();
  const [bidAmount, setBidAmount] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calcular la puja mínima siguiente
  const minNextBid = currentPrice + minBidIncrement;

  // Validar si la puja actual es válida
  const numericBid = parseFloat(bidAmount) || 0;
  const isValidBid = numericBid >= minNextBid;

  // Realizar puja con cantidad específica
  const submitBid = useCallback(async () => {
    if (!isAuthenticated) {
      setError("Debes iniciar sesión para pujar");
      onError?.("Debes iniciar sesión para pujar");
      return;
    }

    // Obtener token válido (refresca automáticamente si es necesario)
    const token = await getValidToken();
    if (!token) {
      setError("Tu sesión ha expirado. Por favor, vuelve a iniciar sesión.");
      onError?.("Tu sesión ha expirado. Por favor, vuelve a iniciar sesión.");
      return;
    }

    if (!isValidBid) {
      setError(`La puja mínima es ${minNextBid.toFixed(2)} €`);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const bid = await placeBid(auctionId, numericBid, token);
      setBidAmount("");
      onSuccess?.(bid);
    } catch (err) {
      const message = err instanceof BidError 
        ? err.message 
        : "Error al realizar la puja";
      setError(message);
      onError?.(message);
    } finally {
      setIsSubmitting(false);
    }
  }, [
    auctionId,
    numericBid,
    isValidBid,
    minNextBid,
    getValidToken,
    isAuthenticated,
    onSuccess,
    onError,
  ]);

  // Puja rápida con el incremento mínimo
  const quickBid = useCallback(async () => {
    if (!isAuthenticated) {
      setError("Debes iniciar sesión para pujar");
      onError?.("Debes iniciar sesión para pujar");
      return;
    }

    // Obtener token válido (refresca automáticamente si es necesario)
    const token = await getValidToken();
    if (!token) {
      setError("Tu sesión ha expirado. Por favor, vuelve a iniciar sesión.");
      onError?.("Tu sesión ha expirado. Por favor, vuelve a iniciar sesión.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const bid = await placeBid(auctionId, minNextBid, token);
      onSuccess?.(bid);
    } catch (err) {
      const message = err instanceof BidError 
        ? err.message 
        : "Error al realizar la puja";
      setError(message);
      onError?.(message);
    } finally {
      setIsSubmitting(false);
    }
  }, [auctionId, minNextBid, getValidToken, isAuthenticated, onSuccess, onError]);

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
