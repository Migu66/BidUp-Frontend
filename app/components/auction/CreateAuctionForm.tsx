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
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-4">
          <p className="text-red-300 text-sm">{errors.general}</p>
        </div>
      )}

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Columna 1 - Imagen (ocupa 2 columnas) */}
        <div className="lg:col-span-2">
          <div className="bg-gray-800/40 rounded-2xl p-8 h-full border border-gray-700/50">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Imagen
            </h3>

            <div className="space-y-4">
              {imagePreview ? (
                <div className="relative group">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full aspect-square object-cover rounded-xl"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                    <label htmlFor="image" className="px-4 py-2 bg-white text-black rounded-lg font-medium cursor-pointer hover:bg-gray-100 transition-colors">
                      Cambiar
                    </label>
                  </div>
                </div>
              ) : (
                <label htmlFor="image" className="block cursor-pointer">
                  <div className="aspect-square border-2 border-dashed border-gray-600 rounded-xl hover:border-primary transition-colors flex flex-col items-center justify-center gap-3 p-4">
                    <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                    <div className="text-center">
                      <p className="text-white text-sm font-medium">Agregar imagen</p>
                      <p className="text-gray-500 text-xs mt-1">Haz clic para subir</p>
                    </div>
                  </div>
                </label>
              )}

              <input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                disabled={isSubmitting}
              />
              {errors.image && <p className="text-red-400 text-xs">{errors.image}</p>}
            </div>
          </div>
        </div>

        {/* Columna 2 y 3 - Formulario (ocupa 3 columnas) */}
        <div className="lg:col-span-3 space-y-6">
          {/* Información básica */}
          <div className="bg-gray-800/40 rounded-2xl p-6 border border-gray-700/50">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
              </svg>
              Detalles del producto
            </h3>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-1.5 block">Título</label>
                <input
                  id="title"
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Nombre del producto"
                  className="w-full bg-gray-900/50 border-0 border-b-2 border-gray-700 focus:border-primary text-white px-0 py-2 outline-none transition-colors placeholder:text-gray-600"
                  disabled={isSubmitting}
                />
                {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title}</p>}
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-1.5 block">Descripción</label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe tu producto..."
                  rows={3}
                  className="w-full bg-gray-900/50 border-0 border-b-2 border-gray-700 focus:border-primary text-white px-0 py-2 outline-none transition-colors resize-none placeholder:text-gray-600"
                  disabled={isSubmitting}
                />
                {errors.description && <p className="text-red-400 text-xs mt-1">{errors.description}</p>}
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-1.5 block">Categoría</label>
                <select
                  id="categoryId"
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="w-full bg-gray-900/50 border-0 border-b-2 border-gray-700 focus:border-primary text-white px-0 py-2 outline-none transition-colors cursor-pointer"
                  disabled={isSubmitting || loadingCategories}
                >
                  <option value="">Selecciona una opción</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {errors.categoryId && <p className="text-red-400 text-xs mt-1">{errors.categoryId}</p>}
              </div>
            </div>
          </div>

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Precios */}
            <div className="bg-gray-800/40 rounded-2xl p-6 border border-gray-700/50">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Precios
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400 mb-1.5 block">Precio inicial</label>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 text-lg">€</span>
                    <input
                      id="startingPrice"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.startingPrice}
                      onChange={(e) => setFormData({ ...formData, startingPrice: e.target.value })}
                      placeholder="0.00"
                      className=" w-20 flex-1 bg-gray-900/50 border-0 border-b-2 border-gray-700 focus:border-primary text-white text-lg px-0 py-2 outline-none transition-colors placeholder:text-gray-600"
                      disabled={isSubmitting}
                    />
                  </div>
                  {errors.startingPrice && <p className="text-red-400 text-xs mt-1">{errors.startingPrice}</p>}
                </div>

                <div>
                  <label className="text-sm text-gray-400 mb-1.5 block">Incremento mínimo</label>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500 text-lg">€</span>
                    <input
                      id="minBidIncrement"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.minBidIncrement}
                      onChange={(e) => setFormData({ ...formData, minBidIncrement: e.target.value })}
                      placeholder="0.00"
                      className="w-20 flex-1 bg-gray-900/50 border-0 border-b-2 border-gray-700 focus:border-primary text-white text-lg px-0 py-2 outline-none transition-colors placeholder:text-gray-600"
                      disabled={isSubmitting}
                    />
                  </div>
                  {errors.minBidIncrement && <p className="text-red-400 text-xs mt-1">{errors.minBidIncrement}</p>}
                </div>
              </div>
            </div>

            {/* Duración */}
            <div className="bg-gray-800/40 rounded-2xl p-6 border border-gray-700/50">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Duración
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400 mb-1.5 block">Inicio</label>
                  <input
                    id="startTime"
                    type="datetime-local"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full bg-gray-900/50 border-0 border-b-2 border-gray-700 focus:border-primary text-white px-0 py-2 outline-none transition-colors"
                    disabled={isSubmitting}
                  />
                  {errors.startTime && <p className="text-red-400 text-xs mt-1">{errors.startTime}</p>}
                </div>

                <div>
                  <label className="text-sm text-gray-400 mb-1.5 block">Fin</label>
                  <input
                    id="endTime"
                    type="datetime-local"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full bg-gray-900/50 border-0 border-b-2 border-gray-700 focus:border-primary text-white px-0 py-2 outline-none transition-colors"
                    disabled={isSubmitting}
                  />
                  {errors.endTime && <p className="text-red-400 text-xs mt-1">{errors.endTime}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-4 pt-2">
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
        </div>
      </div>
    </form>
  );
}
