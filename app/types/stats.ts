/**
 * Estadísticas en tiempo real del sistema
 */
export interface LiveStatsDto {
  activeAuctions: number;
  connectedUsers: number;
  timestamp?: string;
}
