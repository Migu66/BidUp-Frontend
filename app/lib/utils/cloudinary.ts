interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
}

interface CloudinaryError {
  error: {
    message: string;
  };
}

/**
 * Sube una imagen a Cloudinary
 * @param file - Archivo de imagen a subir
 * @param folder - Carpeta opcional en Cloudinary donde se guardará la imagen
 * @returns URL segura de la imagen subida
 */
export async function uploadImageToCloudinary(
  file: File,
  folder: string = "bidup/auctions"
): Promise<string> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

  if (!cloudName) {
    throw new Error("Cloudinary no está configurado correctamente. Falta NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME");
  }

  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "bidup_unsigned");
    formData.append("folder", folder);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData: CloudinaryError = await response.json();
      const errorMessage = errorData.error?.message || "Error al subir la imagen";
      
      // Proporcionar mensaje más útil según el tipo de error
      if (errorMessage.includes("preset")) {
        throw new Error(
          `Error de configuración de Cloudinary: ${errorMessage}\n\n` +
          `Por favor, crea un upload preset llamado "bidup_unsigned":\n` +
          `1. Ve a https://console.cloudinary.com/settings/upload\n` +
          `2. Haz clic en "Add upload preset"\n` +
          `3. Preset name: bidup_unsigned\n` +
          `4. Signing mode: Unsigned\n` +
          `5. Guarda el preset`
        );
      }
      
      throw new Error(errorMessage);
    }

    const data: CloudinaryUploadResponse = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error("Error subiendo imagen a Cloudinary:", error);
    
    if (error instanceof Error) {
      throw error;
    }
    
    throw new Error("No se pudo subir la imagen. Intenta de nuevo.");
  }
}

/**
 * Valida que el archivo sea una imagen válida
 */
export function validateImageFile(file: File): {
  valid: boolean;
  error?: string;
} {
  // Validar tipo
  if (!file.type.startsWith("image/")) {
    return {
      valid: false,
      error: "Por favor selecciona un archivo de imagen válido",
    };
  }

  // Validar tamaño (máximo 10MB para Cloudinary)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return {
      valid: false,
      error: "La imagen debe pesar menos de 10MB",
    };
  }

  return { valid: true };
}
