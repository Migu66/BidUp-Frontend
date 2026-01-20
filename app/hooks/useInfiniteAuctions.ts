import { useState, useEffect, useCallback, useRef } from 'react';
import type { AuctionDto } from '@/app/types';
import { getActiveAuctions, getAuctionsByCategory } from '@/app/lib/api';

interface UseInfiniteAuctionsOptions {
  pageSize?: number;
  category?: string;
}

interface UseInfiniteAuctionsReturn {
  auctions: AuctionDto[];
  totalCount: number;
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => void;
  reset: () => void;
  sentinelRef: (node: HTMLDivElement | null) => void;
}

/**
 * Hook para cargar subastas con infinite scroll
 * El backend controla la paginación y devuelve hasMore/totalCount
 */
export function useInfiniteAuctions({
  pageSize = 20,
  category = 'all',
}: UseInfiniteAuctionsOptions = {}): UseInfiniteAuctionsReturn {
  const [auctions, setAuctions] = useState<AuctionDto[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  
  const observerRef = useRef<IntersectionObserver | null>(null);
  const isLoadingRef = useRef(false);

  // Función para cargar subastas
  const fetchAuctions = useCallback(async (pageNum: number, isInitial: boolean) => {
    // Evitar llamadas duplicadas
    if (isLoadingRef.current) return;
    isLoadingRef.current = true;

    if (isInitial) {
      setIsLoading(true);
    } else {
      setIsLoadingMore(true);
    }
    setError(null);

    try {
      const result = category === 'all'
        ? await getActiveAuctions(pageNum, pageSize)
        : await getAuctionsByCategory(category, pageNum, pageSize);

      // Usar hasMore y totalCount del backend
      setHasMore(result.hasMore);
      setTotalCount(result.totalCount);

      if (isInitial) {
        setAuctions(result.data);
      } else {
        // Filtrar duplicados al añadir nuevas subastas
        setAuctions(prev => {
          const existingIds = new Set(prev.map(a => a.id));
          const newAuctions = result.data.filter(a => !existingIds.has(a.id));
          return [...prev, ...newAuctions];
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Error al cargar las subastas';
      setError(errorMessage);
      
      if (isInitial) {
        setAuctions([]);
      }
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
      isLoadingRef.current = false;
    }
  }, [category, pageSize]);

  // Cargar primera página cuando cambia la categoría
  useEffect(() => {
    setPage(1);
    setAuctions([]);
    setHasMore(true);
    setTotalCount(0);
    fetchAuctions(1, true);
  }, [category, fetchAuctions]);

  // Función para cargar más
  const loadMore = useCallback(() => {
    if (!hasMore || isLoadingRef.current) return;
    
    const nextPage = page + 1;
    setPage(nextPage);
    fetchAuctions(nextPage, false);
  }, [page, hasMore, fetchAuctions]);

  // Reset manual
  const reset = useCallback(() => {
    setPage(1);
    setAuctions([]);
    setHasMore(true);
    fetchAuctions(1, true);
  }, [fetchAuctions]);

  // Ref callback para el sentinel (elemento que dispara la carga)
  const sentinelRef = useCallback((node: HTMLDivElement | null) => {
    // Limpiar observer anterior
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    if (!node) return;

    // Crear nuevo observer
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasMore && !isLoadingRef.current) {
          loadMore();
        }
      },
      {
        root: null,
        rootMargin: '600px', // Cargar con más anticipación para UX fluida
        threshold: 0,
      }
    );

    observerRef.current.observe(node);
  }, [hasMore, loadMore]);

  // Cleanup del observer
  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return {
    auctions,
    totalCount,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    loadMore,
    reset,
    sentinelRef,
  };
}
