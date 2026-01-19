import type { AuctionDto, CategoryDto, ApiResponse } from '@/app/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5240';

class AuctionError extends Error {
  constructor(
    message: string,
    public errors?: string[],
    public statusCode?: number
  ) {
    super(message);
    this.name = 'AuctionError';
  }
}

async function handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
  const contentType = response.headers.get('content-type');

  try {
    const data: ApiResponse<T> = await response.json();

    if (!response.ok || !data.success) {
      throw new AuctionError(
        data.message || 'Error en la solicitud',
        data.errors,
        response.status
      );
    }

    return data;
  } catch (error) {
    if (error instanceof AuctionError) {
      throw error;
    }

    // Error al parsear JSON
    throw new AuctionError(
      `El servidor respondió con estado ${response.status} pero no devolvió JSON válido.`,
      [
        `Status: ${response.status} ${response.statusText}`,
        `Content-Type: ${contentType || 'no especificado'}`,
      ],
      response.status
    );
  }
}

/**
 * Obtiene las subastas activas del backend
 * Endpoint: GET /api/Auctions
 */
export async function getActiveAuctions(
  page: number = 1,
  pageSize: number = 20
): Promise<AuctionDto[]> {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
    });

    const response = await fetch(`${API_BASE_URL}/api/Auctions?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result = await handleResponse<AuctionDto[]>(response);

    return result.data ?? [];
  } catch (error) {
    if (error instanceof AuctionError) {
      throw error;
    }
    throw new AuctionError(
      'No se pudo conectar con el servidor. Verifica que el backend esté ejecutándose.',
      [`Servidor: ${API_BASE_URL}`, 'Asegúrate de que el backend esté en ejecución']
    );
  }
}

/**
 * Obtiene una subasta por su ID
 * Endpoint: GET /api/Auctions/{id}
 */
export async function getAuctionById(id: string): Promise<AuctionDto> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/Auctions/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result = await handleResponse<AuctionDto>(response);

    if (!result.data) {
      throw new AuctionError('Subasta no encontrada', undefined, 404);
    }

    return result.data;
  } catch (error) {
    if (error instanceof AuctionError) {
      throw error;
    }
    throw new AuctionError(
      'No se pudo conectar con el servidor. Verifica que el backend esté ejecutándose.',
      [`Servidor: ${API_BASE_URL}`, 'Asegúrate de que el backend esté en ejecución']
    );
  }
}

/**
 * Obtiene subastas por categoría
 * Endpoint: GET /api/Auctions/category/{categoryId}
 */
export async function getAuctionsByCategory(
  categoryId: string,
  page: number = 1,
  pageSize: number = 20
): Promise<AuctionDto[]> {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
    });

    const response = await fetch(
      `${API_BASE_URL}/api/Auctions/category/${categoryId}?${params}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    const result = await handleResponse<AuctionDto[]>(response);

    return result.data ?? [];
  } catch (error) {
    if (error instanceof AuctionError) {
      throw error;
    }
    throw new AuctionError(
      'No se pudo conectar con el servidor. Verifica que el backend esté ejecutándose.',
      [`Servidor: ${API_BASE_URL}`, 'Asegúrate de que el backend esté en ejecución']
    );
  }
}

/**
 * Obtiene todas las categorías
 * Endpoint: GET /api/Categories
 */
export async function getCategories(): Promise<CategoryDto[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/Categories`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result = await handleResponse<CategoryDto[]>(response);

    return result.data ?? [];
  } catch (error) {
    if (error instanceof AuctionError) {
      throw error;
    }
    throw new AuctionError(
      'No se pudo conectar con el servidor. Verifica que el backend esté ejecutándose.',
      [`Servidor: ${API_BASE_URL}`, 'Asegúrate de que el backend esté en ejecución']
    );
  }
}

export { AuctionError };
