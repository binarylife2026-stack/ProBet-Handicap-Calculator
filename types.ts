
export enum HandicapType {
  EUROPEAN = 'European',
  ASIAN = 'Asian',
}

export enum BetSelection {
  HOME = 'Home',
  DRAW = 'Draw',
  AWAY = 'Away',
}

export enum ResultStatus {
  WIN = 'WIN',
  HALF_WIN = 'HALF WIN',
  PUSH = 'PUSH',
  HALF_LOSS = 'HALF LOSS',
  LOSS = 'LOSS',
}

export interface CalculationPart {
  line: number;
  status: 'WIN' | 'LOSS' | 'PUSH';
  payout: number;
}

export interface BetData {
  handicapType: HandicapType;
  scores: {
    home: number;
    away: number;
  };
  handicapLine: number;
  betSelection: BetSelection;
  odds: number;
  stake: number;
}

export interface CalculationResult {
  status: ResultStatus;
  payout: number;
  netProfit: number;
  parts?: [CalculationPart, CalculationPart];
}

export interface HistoryItem extends BetData {
  id: string;
  timestamp: number;
  result: CalculationResult;
}
