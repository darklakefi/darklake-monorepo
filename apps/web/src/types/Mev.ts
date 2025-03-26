export enum MevAttackSwapType {
  BUY = "BUY",
  SELL = "SELL",
}

export interface MevTransaction {
  address: string;
  signature: string;
}

export interface MevAttack {
  swapType: MevAttackSwapType;
  tokenName: string;
  timestamp: number;
  solAmount: {
    sent: number;
    lost: number;
  };
  transactions: {
    frontRun: MevTransaction;
    victim: MevTransaction;
    backRun: MevTransaction;
  };
}

export interface MevTotalExtracted {
  totalSolExtracted: number;
  totalUsdExtracted?: number;
}

export interface GetMevTotalExtractedResponse {
  data?: MevTotalExtracted;
  processingBlocks: {
    completed: number;
    total: number;
  };
}
