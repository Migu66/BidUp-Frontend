import type { BidDto, ApiResponse } from "@/app/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5240";

class BidError extends Error {
  constructor(
    message: string,
    public errors?: string[],
    public statusCode?: number
  ) {
    super(message);
    this.name = "BidError";
  }
}

interface PlaceBidRequest {
  amount: number;
}

/**
 * Realiza una puja en una subasta
 * Endpoint: POST /api/auctions/{id}/bids
 * Requiere autenticación
 */
export async function placeBid(
  auctionId: string,
  amount: number,
  accessToken: string
): Promise<BidDto> {
  const url = `${API_BASE_URL}/api/Auctions/${auctionId}/bids`;
  
  console.log("[placeBid] Enviando puja:", { url, amount, hasToken: !!accessToken });
  
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ amount } as PlaceBidRequest),
    });

    console.log("[placeBid] Response status:", response.status);

    // Manejar 401 Unauthorized antes de intentar parsear JSON
    if (response.status === 401) {
      throw new BidError(
        "Tu sesión ha expirado. Por favor, vuelve a iniciar sesión.",
        undefined,
        401
      );
    }

    // Verificar si hay contenido para parsear
    const text = await response.text();
    if (!text) {
      throw new BidError(
        "El servidor no devolvió una respuesta válida",
        undefined,
        response.status
      );
    }

    const data: ApiResponse<BidDto> = JSON.parse(text);
    
    console.log("[placeBid] Response data:", data);

    if (!response.ok || !data.success) {
      throw new BidError(
        data.message || "Error al realizar la puja",
        data.errors,
        response.status
      );
    }

    return data.data;
  } catch (error) {
    console.error("[placeBid] Error:", error);
    
    if (error instanceof BidError) {
      throw error;
    }
    
    // Mostrar más detalles del error
    const errorMessage = error instanceof Error ? error.message : "Error desconocido";
    throw new BidError(
      `Error de conexión: ${errorMessage}`,
      undefined,
      0
    );
  }
}

/**
 * Obtiene el historial de pujas de una subasta
 * Endpoint: GET /api/auctions/{id}/bids
 */
export async function getAuctionBids(
  auctionId: string,
  page: number = 1,
  pageSize: number = 50
): Promise<BidDto[]> {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
    });

    const response = await fetch(
      `${API_BASE_URL}/api/Auctions/${auctionId}/bids?${params}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const data: ApiResponse<BidDto[]> = await response.json();

    if (!response.ok || !data.success) {
      throw new BidError(
        data.message || "Error al obtener las pujas",
        data.errors,
        response.status
      );
    }

    return data.data ?? [];
  } catch (error) {
    if (error instanceof BidError) {
      throw error;
    }
    throw new BidError(
      "No se pudo conectar con el servidor. Verifica tu conexión.",
      undefined,
      0
    );
  }
}

export { BidError };
