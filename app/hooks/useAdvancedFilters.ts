"use client";

import { useState, useMemo } from "react";
import type { AuctionDto } from "@/app/types";

export interface AdvancedFilters {
  sortBy: "ending-soon" | "newest" | "most-bids" | "price-asc" | "price-desc";
  minPrice?: number;
  maxPrice?: number;
  endingSoon: boolean;
}

const DEFAULT_FILTERS: AdvancedFilters = {
  sortBy: "ending-soon",
  endingSoon: false,
};

export function useAdvancedFilters(auctions: AuctionDto[]) {
  const [filters, setFilters] = useState<AdvancedFilters>(DEFAULT_FILTERS);
  const [isOpen, setIsOpen] = useState(false);

  const filteredAndSortedAuctions = useMemo(() => {
    // Protección contra undefined/null
    if (!auctions || !Array.isArray(auctions)) {
      return [];
    }
    
    let result = [...auctions];

    // Filtrar por precio
    if (filters.minPrice !== undefined) {
      result = result.filter((a) => a.currentPrice >= filters.minPrice!);
    }
    if (filters.maxPrice !== undefined) {
      result = result.filter((a) => a.currentPrice <= filters.maxPrice!);
    }

    // Filtrar por "terminando pronto"
    if (filters.endingSoon) {
      result = result.filter((a) => {
        const now = new Date();
        const endTime = new Date(a.endTime);
        const hoursRemaining = (endTime.getTime() - now.getTime()) / (1000 * 60 * 60);
        return hoursRemaining > 0 && hoursRemaining <= 1;
      });
    }

    // Ordenar
    switch (filters.sortBy) {
      case "price-asc":
        result.sort((a, b) => a.currentPrice - b.currentPrice);
        break;
      case "price-desc":
        result.sort((a, b) => b.currentPrice - a.currentPrice);
        break;
      case "ending-soon":
        result.sort((a, b) => {
          const timeA = new Date(a.endTime).getTime();
          const timeB = new Date(b.endTime).getTime();
          return timeA - timeB;
        });
        break;
      case "newest":
        result.sort((a, b) => {
          const timeA = new Date(a.startTime).getTime();
          const timeB = new Date(b.startTime).getTime();
          return timeB - timeA;
        });
        break;
      case "most-bids":
        result.sort((a, b) => b.totalBids - a.totalBids);
        break;
    }

    return result;
  }, [auctions, filters]);

  const updateFilter = <K extends keyof AdvancedFilters>(
    key: K,
    value: AdvancedFilters[K]
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  const hasActiveFilters = useMemo(() => {
    return (
      filters.sortBy !== DEFAULT_FILTERS.sortBy ||
      filters.minPrice !== undefined ||
      filters.maxPrice !== undefined ||
      filters.endingSoon !== DEFAULT_FILTERS.endingSoon
    );
  }, [filters]);

  return {
    filters,
    updateFilter,
    resetFilters,
    filteredAndSortedAuctions,
    hasActiveFilters,
    isOpen,
    setIsOpen,
  };
}
