import * as signalR from "@microsoft/signalr";
import type {
  BidNotificationDto,
  AuctionStatusNotificationDto,
  AuctionTimerSyncDto,
  BidDto,
  LiveStatsDto,
} from "@/app/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5240";

export type AuctionHubEvents = {
  onNewBid: (data: BidNotificationDto) => void;
  onAuctionStatusChanged: (data: AuctionStatusNotificationDto) => void;
  onTimerSync: (data: AuctionTimerSyncDto) => void;
  onJoinedAuction: (data: {
    auctionId: string;
    message: string;
    timestamp: string;
  }) => void;
  onAuctionEnded: (data: AuctionStatusNotificationDto) => void;
  onBidAccepted: (data: BidDto) => void;
  onBidError: (error: string) => void;
  onLiveStatsUpdated: (data: LiveStatsDto) => void;
};

class AuctionHubConnection {
  private connection: signalR.HubConnection | null = null;
  private listeners: Partial<AuctionHubEvents> = {};
  private currentAuctionId: string | null = null;

  /**
   * Conecta al hub de SignalR.
   * Requiere un token de acceso válido.
   */
  async connect(accessToken: string): Promise<void> {
    // Si ya está conectado, no hacer nada
    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      return;
    }

    // Desconectar conexión anterior si existe
    if (this.connection) {
      await this.disconnect();
    }

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(`${API_BASE_URL}/hubs/auction`, {
        accessTokenFactory: () => accessToken,
      })
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: (retryContext) => {
          // Backoff exponencial: 1s, 2s, 4s, 8s, 16s
          const delay = Math.min(
            1000 * Math.pow(2, retryContext.previousRetryCount),
            16000
          );
          return delay;
        },
      })
      // Usar nivel None para no mostrar errores de auth en consola
      .configureLogging(signalR.LogLevel.None)
      .build();

    this.setupEventHandlers();
    this.setupConnectionEvents();

    // Intentar conectar - puede fallar si el token es inválido
    await this.connection.start();
  }

  /**
   * Configura los manejadores de eventos del hub
   */
  private setupEventHandlers(): void {
    if (!this.connection) return;

    // Evento: Nueva puja recibida
    this.connection.on("NewBid", (data: BidNotificationDto) => {
      console.log("[SignalR] NewBid recibido:", data);
      this.listeners.onNewBid?.(data);
    });

    // Evento: Estado de subasta actualizado
    this.connection.on("AuctionStatusChanged", (data: AuctionStatusNotificationDto) => {
      console.log("[SignalR] AuctionStatusChanged recibido:", data);
      this.listeners.onAuctionStatusChanged?.(data);
    });

    // Evento: Sincronización de timer
    this.connection.on("TimerSync", (data: AuctionTimerSyncDto) => {
      console.log("[SignalR] TimerSync recibido:", data);
      this.listeners.onTimerSync?.(data);
    });

    // Evento: Unido a la sala
    this.connection.on(
      "JoinedAuction",
      (data: { auctionId: string; message: string; timestamp: string }) => {
        this.listeners.onJoinedAuction?.(data);
      }
    );

    // Evento: Subasta terminada
    this.connection.on("AuctionEnded", (data: AuctionStatusNotificationDto) => {
      console.log("[SignalR] AuctionEnded recibido:", data);
      this.listeners.onAuctionEnded?.(data);
    });

    // Evento: Puja aceptada (respuesta a PlaceBid)
    this.connection.on("BidAccepted", (data: BidDto) => {
      console.log("[SignalR] BidAccepted recibido:", data);
      this.listeners.onBidAccepted?.(data);
    });

    // Evento: Error en puja (respuesta a PlaceBid)
    this.connection.on("BidError", (error: string) => {
      console.log("[SignalR] BidError recibido:", error);
      this.listeners.onBidError?.(error);
    });

    // Evento: Estadísticas en tiempo real actualizadas
    this.connection.on("LiveStatsUpdated", (data: LiveStatsDto) => {
      console.log("[SignalR] LiveStatsUpdated recibido:", data);
      this.listeners.onLiveStatsUpdated?.(data);
    });
  }

  /**
   * Configura eventos de conexión/desconexión
   */
  private setupConnectionEvents(): void {
    if (!this.connection) return;

    this.connection.onreconnected(async () => {
      // Volver a unirse a la subasta actual si existe
      if (this.currentAuctionId) {
        await this.joinAuction(this.currentAuctionId);
      }
    });

    this.connection.onclose(() => {
      // Conexión cerrada - no loguear para evitar ruido en consola
      this.currentAuctionId = null;
    });
  }

  /**
   * Unirse a una sala de subasta para recibir actualizaciones
   */
  async joinAuction(auctionId: string): Promise<void> {
    if (
      !this.connection ||
      this.connection.state !== signalR.HubConnectionState.Connected
    ) {
      return;
    }

    try {
      await this.connection.invoke("JoinAuction", auctionId);
      this.currentAuctionId = auctionId;
    } catch {
      // Error al unirse - ignorar silenciosamente
    }
  }

  /**
   * Salir de una sala de subasta
   */
  async leaveAuction(auctionId: string): Promise<void> {
    if (
      !this.connection ||
      this.connection.state !== signalR.HubConnectionState.Connected
    ) {
      return;
    }

    try {
      await this.connection.invoke("LeaveAuction", auctionId);
      if (this.currentAuctionId === auctionId) {
        this.currentAuctionId = null;
      }
    } catch {
      // Error al salir - ignorar silenciosamente
    }
  }

  /**
   * Solicitar sincronización del timer
   */
  async requestTimerSync(auctionId: string): Promise<void> {
    if (
      !this.connection ||
      this.connection.state !== signalR.HubConnectionState.Connected
    ) {
      return;
    }

    try {
      await this.connection.invoke("RequestTimerSync", auctionId);
    } catch {
      // Error al solicitar sync - ignorar silenciosamente
    }
  }

  /**
   * Coloca una puja a través de SignalR.
   * Usa la conexión WebSocket existente para mayor eficiencia.
   * Responde con BidAccepted o BidError vía eventos.
   */
  async placeBid(auctionId: string, amount: number): Promise<void> {
    if (
      !this.connection ||
      this.connection.state !== signalR.HubConnectionState.Connected
    ) {
      // Si no está conectado, disparar error directamente
      this.listeners.onBidError?.("No hay conexión con el servidor. Inténtalo de nuevo.");
      return;
    }

    try {
      // El backend espera (string auctionId, decimal amount)
      await this.connection.invoke("PlaceBid", auctionId, amount);
    } catch (err) {
      console.error("[SignalR] Error al invocar PlaceBid:", err);
      this.listeners.onBidError?.("Error al enviar la puja. Inténtalo de nuevo.");
    }
  }

  /**
   * Registra listeners para los eventos del hub
   */
  on<K extends keyof AuctionHubEvents>(event: K, callback: AuctionHubEvents[K]): void {
    this.listeners[event] = callback as AuctionHubEvents[K];
  }

  /**
   * Establece múltiples listeners a la vez (merge, no reemplaza)
   */
  setListeners(newListeners: Partial<AuctionHubEvents>): void {
    this.listeners = { ...this.listeners, ...newListeners };
  }

  /**
   * Elimina un listener
   */
  off<K extends keyof AuctionHubEvents>(event: K): void {
    delete this.listeners[event];
  }

  /**
   * Desconecta del hub
   */
  async disconnect(): Promise<void> {
    if (this.currentAuctionId) {
      await this.leaveAuction(this.currentAuctionId);
    }

    if (this.connection) {
      await this.connection.stop();
      this.connection = null;
    }

    this.listeners = {};
    this.currentAuctionId = null;
  }

  /**
   * Obtiene el estado de la conexión
   */
  getConnectionState(): signalR.HubConnectionState | null {
    return this.connection?.state ?? null;
  }

  /**
   * Verifica si está conectado
   */
  isConnected(): boolean {
    return this.connection?.state === signalR.HubConnectionState.Connected;
  }
}

// Singleton para la conexión
export const auctionHub = new AuctionHubConnection();
