// Tipos basados en el backend de BidUp

export interface BidDto {
  id: string;
  amount: number;
  timestamp: string;
  isWinning: boolean;
  bidderId: string;
  bidderName: string;
  auctionId: string;
}

export interface AuctionDto {
  id: string;
  title: string;
  description: string;
  imageUrl: string | null;
  startingPrice: number;
  currentPrice: number;
  minBidIncrement: number;
  startTime: string;
  endTime: string;
  status: AuctionStatus;
  totalBids: number;
  timeRemaining: string; // TimeSpan serializado como string "HH:mm:ss" o "d.HH:mm:ss"
  sellerId: string;
  sellerName: string;
  categoryId: string;
  categoryName: string;
  latestBid: BidDto | null;
}

export type AuctionStatus = "Pending" | "Active" | "Completed" | "Cancelled" | "Expired";

export interface CategoryDto {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  auctionCount: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  errors?: string[];
}

// Tipos para notificaciones en tiempo real (SignalR)
export interface BidNotificationDto {
  auctionId: string;
  bid: BidDto;
  newCurrentPrice: number;
  totalBids: number;
  timeRemaining: string;
}

export interface AuctionStatusNotificationDto {
  auctionId: string;
  status: string;
  message: string;
  winnerBid: BidDto | null;
}

export interface AuctionTimerSyncDto {
  auctionId: string;
  endTime: string;
  timeRemaining: string;
  serverTime: string;
}
