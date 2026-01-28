import type { AuctionDto, CategoryDto, ApiResponse, PaginatedResponse } from '@/app/types';

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

async function handlePaginatedResponse<T>(response: Response): Promise<PaginatedResponse<T>> {
  const contentType = response.headers.get('content-type');

  try {
    const data: PaginatedResponse<T> = await response.json();

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

/** Resultado de una consulta paginada */
export interface PaginatedResult<T> {
  data: T[];
  totalCount: number;
  hasMore: boolean;
}

/**
 * Obtiene las subastas activas del backend con paginación
 * Endpoint: GET /api/Auctions
 */
export async function getActiveAuctions(
  page: number = 1,
  pageSize: number = 20
): Promise<PaginatedResult<AuctionDto>> {
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

    const result = await handlePaginatedResponse<AuctionDto[]>(response);

    return {
      data: result.data ?? [],
      totalCount: result.totalCount,
      hasMore: result.hasMore,
    };
  } catch (error) {
    if (error instanceof AuctionError) {
      throw error;
    }
    // Error de red o conexión
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new AuctionError(
        'No se pudo conectar con el servidor. Verifica tu conexión.',
        [`Servidor: ${API_BASE_URL}`, 'Asegúrate de que el backend esté en ejecución']
      );
    }
    // Error desconocido
    throw new AuctionError(
      error instanceof Error ? error.message : 'Error al obtener las subastas'
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
    // Error de red o conexión
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new AuctionError(
        'No se pudo conectar con el servidor. Verifica tu conexión.',
        [`Servidor: ${API_BASE_URL}`, 'Asegúrate de que el backend esté en ejecución']
      );
    }
    // Error desconocido
    throw new AuctionError(
      error instanceof Error ? error.message : 'Error al obtener la subasta'
    );
  }
}

/**
 * Obtiene subastas por categoría con paginación
 * Endpoint: GET /api/Auctions/category/{categoryId}
 */
export async function getAuctionsByCategory(
  categoryId: string,
  page: number = 1,
  pageSize: number = 20
): Promise<PaginatedResult<AuctionDto>> {
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

    const result = await handlePaginatedResponse<AuctionDto[]>(response);

    return {
      data: result.data ?? [],
      totalCount: result.totalCount,
      hasMore: result.hasMore,
    };
  } catch (error) {
    if (error instanceof AuctionError) {
      throw error;
    }
    // Error de red o conexión
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new AuctionError(
        'No se pudo conectar con el servidor. Verifica tu conexión.',
        [`Servidor: ${API_BASE_URL}`, 'Asegúrate de que el backend esté en ejecución']
      );
    }
    // Error desconocido
    throw new AuctionError(
      error instanceof Error ? error.message : 'Error al obtener las subastas'
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
    // Error de red o conexión
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new AuctionError(
        'No se pudo conectar con el servidor. Verifica tu conexión.',
        [`Servidor: ${API_BASE_URL}`, 'Asegúrate de que el backend esté en ejecución']
      );
    }
    // Error desconocido
    throw new AuctionError(
      error instanceof Error ? error.message : 'Error al obtener las categorías'
    );
  }
}

/**
 * Crea una nueva subasta
 * Endpoint: POST /api/Auctions
 */
export async function createAuction(data: {
  title: string;
  description: string;
  categoryId: string;
  startingPrice: number;
  minBidIncrement: number;
  startTime: string;
  endTime: string;
  imageUrl: string;
}): Promise<ApiResponse<AuctionDto>> {
  try {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new AuctionError('Debes iniciar sesión para crear una subasta');
    }

    const response = await fetch(`${API_BASE_URL}/api/Auctions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    return await handleResponse<AuctionDto>(response);
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

export const auctionApi = {
  getActiveAuctions,
  getAuctionById,
  getAuctionsByCategory,
  getCategories,
  createAuction,
};

export { AuctionError };
