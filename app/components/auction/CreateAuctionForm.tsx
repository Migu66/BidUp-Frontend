"use client";

import { useCreateAuction } from "@/app/hooks";
import { Button } from "@/app/components/ui";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { CategoryDto } from "@/app/types";
import { auctionApi } from "@/app/lib/api";

export function CreateAuctionForm() {
  const router = useRouter();
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const {
    formData,
    setFormData,
    errors,
    isSubmitting,
    isUploadingImage,
    imagePreview,
    handleImageChange,
    handleSubmit,
  } = useCreateAuction();

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categories = await auctionApi.getCategories();
        setCategories(categories);
      } catch (error) {
        console.error("Error cargando categorías:", error);
      } finally {
        setLoadingCategories(false);
      }
    };

    loadCategories();
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await handleSubmit();
    if (success) {
      router.push("/");
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Error general */}
      {errors.general && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4">
          <p className="text-red-400 text-sm">{errors.general}</p>
        </div>
      )}

      {/* Información básica */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 space-y-4">
        <h2 className="text-xl font-semibold text-white mb-4">Información Básica</h2>

        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
            Título <span className="text-red-500">*</span>
          </label>
          <input
            id="title"
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Ej: iPhone 15 Pro Max 256GB"
            className="w-full px-4 py-2 bg-gray-900/50 border border-gray-800 focus:border-primary/50 rounded-xl text-white placeholder:text-gray-500 outline-none transition-colors"
            disabled={isSubmitting}
          />
          {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
            Descripción <span className="text-red-500">*</span>
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe tu artículo en detalle..."
            rows={5}
            className="w-full px-4 py-2 bg-gray-900/50 border border-gray-800 focus:border-primary/50 rounded-xl text-white placeholder:text-gray-500 outline-none transition-colors resize-none"
            disabled={isSubmitting}
          />
          {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
        </div>

        <div>
          <label htmlFor="categoryId" className="block text-sm font-medium text-gray-300 mb-2">
            Categoría <span className="text-red-500">*</span>
          </label>
          <select
            id="categoryId"
            value={formData.categoryId}
            onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
            className="w-full px-4 py-2 bg-gray-900/50 border border-gray-800 focus:border-primary/50 rounded-xl text-white outline-none transition-colors"
            disabled={isSubmitting || loadingCategories}
          >
            <option value="">Selecciona una categoría</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {errors.categoryId && <p className="text-red-500 text-sm mt-1">{errors.categoryId}</p>}
        </div>
      </div>

      {/* Imagen */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 space-y-4">
        <h2 className="text-xl font-semibold text-white mb-4">Imagen del Producto</h2>

        <div>
          <label htmlFor="image" className="block text-sm font-medium text-gray-300 mb-2">
            Imagen <span className="text-red-500">*</span>
          </label>
          <input
            id="image"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full px-4 py-2 bg-gray-900/50 border border-gray-800 focus:border-primary/50 rounded-xl text-white outline-none transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-dark file:cursor-pointer"
            disabled={isSubmitting}
          />
          {errors.image && <p className="text-red-500 text-sm mt-1">{errors.image}</p>}
        </div>

        {imagePreview && (
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-300 mb-2">Vista previa:</p>
            <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-gray-800">
              <img
                src={imagePreview}
                alt="Vista previa"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}
      </div>

      {/* Precio y Duración */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 space-y-4">
        <h2 className="text-xl font-semibold text-white mb-4">Precio y Duración</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="startingPrice" className="block text-sm font-medium text-gray-300 mb-2">
              Precio Inicial (€) <span className="text-red-500">*</span>
            </label>
            <input
              id="startingPrice"
              type="number"
              step="0.01"
              min="0"
              value={formData.startingPrice}
              onChange={(e) => setFormData({ ...formData, startingPrice: e.target.value })}
              placeholder="0.00"
              className="w-full px-4 py-2 bg-gray-900/50 border border-gray-800 focus:border-primary/50 rounded-xl text-white placeholder:text-gray-500 outline-none transition-colors"
              disabled={isSubmitting}
            />
            {errors.startingPrice && <p className="text-red-500 text-sm mt-1">{errors.startingPrice}</p>}
          </div>

          <div>
            <label htmlFor="minBidIncrement" className="block text-sm font-medium text-gray-300 mb-2">
              Incremento Mínimo (€) <span className="text-red-500">*</span>
            </label>
            <input
              id="minBidIncrement"
              type="number"
              step="0.01"
              min="0"
              value={formData.minBidIncrement}
              onChange={(e) => setFormData({ ...formData, minBidIncrement: e.target.value })}
              placeholder="0.00"
              className="w-full px-4 py-2 bg-gray-900/50 border border-gray-800 focus:border-primary/50 rounded-xl text-white placeholder:text-gray-500 outline-none transition-colors"
              disabled={isSubmitting}
            />
            {errors.minBidIncrement && <p className="text-red-500 text-sm mt-1">{errors.minBidIncrement}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="startTime" className="block text-sm font-medium text-gray-300 mb-2">
              Fecha y Hora de Inicio <span className="text-red-500">*</span>
            </label>
            <input
              id="startTime"
              type="datetime-local"
              value={formData.startTime}
              onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              className="w-full px-4 py-2 bg-gray-900/50 border border-gray-800 focus:border-primary/50 rounded-xl text-white outline-none transition-colors"
              disabled={isSubmitting}
            />
            {errors.startTime && <p className="text-red-500 text-sm mt-1">{errors.startTime}</p>}
          </div>

          <div>
            <label htmlFor="endTime" className="block text-sm font-medium text-gray-300 mb-2">
              Fecha y Hora de Fin <span className="text-red-500">*</span>
            </label>
            <input
              id="endTime"
              type="datetime-local"
              value={formData.endTime}
              onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              className="w-full px-4 py-2 bg-gray-900/50 border border-gray-800 focus:border-primary/50 rounded-xl text-white outline-none transition-colors"
              disabled={isSubmitting}
            />
            {errors.endTime && <p className="text-red-500 text-sm mt-1">{errors.endTime}</p>}
          </div>
        </div>
      </div>

      {/* Botones */}
      <div className="flex gap-4">
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.push("/")}
          disabled={isSubmitting}
          className="flex-1"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="flex-1"
        >
          {isUploadingImage 
            ? "Subiendo imagen..." 
            : isSubmitting 
              ? "Publicando..." 
              : "Publicar Subasta"
          }
        </Button>
      </div>
    </form>
  );
}
