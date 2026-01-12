"use client";

import { FilterIcon, GridIcon, ListIcon } from "@/app/components/ui";

interface CategoryFilterProps {
  categories: Array<{
    id: string;
    name: string;
    count: number;
  }>;
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
}

export function CategoryFilter({
  categories,
  selectedCategory,
  onSelectCategory,
  viewMode,
  onViewModeChange,
}: CategoryFilterProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      {/* Categorías */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onSelectCategory(category.id)}
            className={`px-4 py-2 text-sm font-medium rounded-xl whitespace-nowrap transition-all ${
              selectedCategory === category.id
                ? "bg-primary text-white shadow-lg shadow-primary/25"
                : "bg-gray-900/50 text-gray-400 hover:text-white hover:bg-gray-800"
            }`}
          >
            {category.name}
            <span
              className={`ml-1.5 ${
                selectedCategory === category.id ? "text-white/70" : "text-gray-600"
              }`}
            >
              {category.count}
            </span>
          </button>
        ))}
      </div>

      {/* Controles de vista */}
      <div className="flex items-center gap-2">
        <button 
          className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
          aria-label="Filtros avanzados"
        >
          <FilterIcon />
        </button>
        <div className="flex bg-gray-900/50 rounded-lg p-1">
          <button
            onClick={() => onViewModeChange("grid")}
            className={`p-1.5 rounded-md transition-colors ${
              viewMode === "grid"
                ? "bg-gray-800 text-white"
                : "text-gray-500 hover:text-gray-300"
            }`}
            aria-label="Vista en cuadrícula"
          >
            <GridIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => onViewModeChange("list")}
            className={`p-1.5 rounded-md transition-colors ${
              viewMode === "list"
                ? "bg-gray-800 text-white"
                : "text-gray-500 hover:text-gray-300"
            }`}
            aria-label="Vista en lista"
          >
            <ListIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
