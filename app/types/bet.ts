export enum BetStatus {
  ACTIVE = 'active',
  WON = 'won',
  LOST = 'lost',
  CANCELLED = 'cancelled',
  PENDING = 'pending'
}

export enum BetType {
  AUCTION = 'auction',
  INSTANT_BUY = 'instant_buy',
  RESERVE = 'reserve'
}

export interface Bet {
  id: string;
  userId: string;
  productId: string;
  productName: string;
  productImage: string;
  amount: number;
  type: BetType;
  status: BetStatus;
  placedAt: number; // timestamp
  resolvedAt?: number; // timestamp
  isWinning?: boolean;
  maxBid?: number; // для аукционов
  currentBid?: number; // для аукционов
  endTime?: number; // timestamp для аукционов
}

export interface BetFilters {
  status?: BetStatus;
  type?: BetType;
  dateFrom?: string;
  dateTo?: string;
}

export interface BetsResponse {
  bets: Bet[];
  total: number;
  page: number;
  limit: number;
} 