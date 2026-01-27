import { useState } from "react";
import { auctionApi } from "@/app/lib/api";
import { useAuth } from "@/app/context";
import { uploadImageToCloudinary, validateImageFile } from "@/app/lib/utils/cloudinary";

interface CreateAuctionFormData {
  title: string;
  description: string;
  categoryId: string;
  startingPrice: string;
  minBidIncrement: string;
  startTime: string;
  endTime: string;
  image: File | null;
}

interface FormErrors {
  title?: string;
  description?: string;
  categoryId?: string;
  startingPrice?: string;
  minBidIncrement?: string;
  startTime?: string;
  endTime?: string;
  image?: string;
  general?: string;
}

export function useCreateAuction() {
  const { user } = useAuth();
  const [formData, setFormData] = useState<CreateAuctionFormData>({
    title: "",
    description: "",
    categoryId: "",
    startingPrice: "",
    minBidIncrement: "",
    startTime: "",
    endTime: "",
    image: null,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar archivo
      const validation = validateImageFile(file);
      if (!validation.valid) {
        setErrors((prev) => ({
          ...prev,
          image: validation.error,
        }));
        return;
      }

      setFormData({ ...formData, image: file });
      setErrors((prev) => ({ ...prev, image: undefined }));

      // Crear preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "El título es obligatorio";
    } else if (formData.title.length < 3) {
      newErrors.title = "El título debe tener al menos 3 caracteres";
    } else if (formData.title.length > 200) {
      newErrors.title = "El título no puede exceder 200 caracteres";
    }

    if (!formData.description.trim()) {
      newErrors.description = "La descripción es obligatoria";
    } else if (formData.description.length < 10) {
      newErrors.description = "La descripción debe tener al menos 10 caracteres";
    }

    if (!formData.categoryId) {
      newErrors.categoryId = "Debes seleccionar una categoría";
    }

    const startingPrice = parseFloat(formData.startingPrice);
    if (!formData.startingPrice || isNaN(startingPrice)) {
      newErrors.startingPrice = "El precio inicial es obligatorio";
    } else if (startingPrice <= 0) {
      newErrors.startingPrice = "El precio inicial debe ser mayor que 0";
    }

    const minBidIncrement = parseFloat(formData.minBidIncrement);
    if (!formData.minBidIncrement || isNaN(minBidIncrement)) {
      newErrors.minBidIncrement = "El incremento mínimo es obligatorio";
    } else if (minBidIncrement <= 0) {
      newErrors.minBidIncrement = "El incremento mínimo debe ser mayor que 0";
    }

    if (!formData.startTime) {
      newErrors.startTime = "La fecha de inicio es obligatoria";
    } else {
      const startTime = new Date(formData.startTime);
      const now = new Date();
      if (startTime < now) {
        newErrors.startTime = "La fecha de inicio debe ser en el futuro";
      }
    }

    if (!formData.endTime) {
      newErrors.endTime = "La fecha de fin es obligatoria";
    } else if (formData.startTime) {
      const startTime = new Date(formData.startTime);
      const endTime = new Date(formData.endTime);
      if (endTime <= startTime) {
        newErrors.endTime = "La fecha de fin debe ser posterior a la de inicio";
      }
    }

    if (!formData.image) {
      newErrors.image = "Debes subir una imagen del producto";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (): Promise<boolean> => {
    if (!validateForm()) {
      return false;
    }

    setIsSubmitting(true);
    setIsUploadingImage(true);
    setErrors({});

    try {
      // Subir imagen a Cloudinary primero
      const imageUrl = await uploadImageToCloudinary(formData.image!);
      setIsUploadingImage(false);

      // Crear subasta con la URL de Cloudinary
      const result = await auctionApi.createAuction({
        title: formData.title.trim(),
        description: formData.description.trim(),
        categoryId: formData.categoryId,
        startingPrice: parseFloat(formData.startingPrice),
        minBidIncrement: parseFloat(formData.minBidIncrement),
        startTime: new Date(formData.startTime).toISOString(),
        endTime: new Date(formData.endTime).toISOString(),
        imageUrl: imageUrl,
      });

      if (result.success) {
        return true;
      } else {
        setErrors({
          general: result.message || "Error al crear la subasta",
        });
        return false;
      }
    } catch (error: any) {
      setErrors({
        general: error.message || "Error al crear la subasta",
      });
      return false;
      setIsUploadingImage(false);
    }
  };

  return {
    formData,
    setFormData,
    errors,
    isSubmitting,
    isUploadingImage,
    imagePreview,
    handleImageChange,
    handleSubmit,
  };
}
