import { IsEnum, IsIn, IsInt, IsOptional, Max, Min, Validate } from "class-validator";
import { IsValidSolanaAddress } from "../../validator/IsValidSolanaAddress";
import { Type } from "class-transformer";
import { SandwichEvent } from "@prisma/client";
import { formatSolAmount } from "src/utils/blockchain";

export class GetMevTotalExtractedQuery {
  @Validate(IsValidSolanaAddress)
  address: string;
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

export enum MevAttacksOrderBy {
  "DATE" = "date",
  "AMOUNT_DRAINED" = "amountDrained",
}

export class GetMevAttacksQuery {
  @Validate(IsValidSolanaAddress)
  address: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  offset?: number;

  @IsOptional()
  @IsEnum(MevAttacksOrderBy)
  orderBy?: MevAttacksOrderBy;

  @IsOptional()
  @IsIn(["asc", "desc"])
  direction?: "asc" | "desc";
}

export interface Mev {
  tokenName: string;
  timestamp: number;
  solAmountSent: number;
  solAmountDrained: number;
  transactionHash: string;
}

export enum MevAttackSwapType {
  BUY = "BUY",
  SELL = "SELL",
}

export interface MevTransaction {
  address: string;
  signature: string;
}

export class MevAttackResponse {
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

  constructor(props: SandwichEvent) {
    this.solAmount = {
      sent: formatSolAmount(props.sol_amount_swap),
      lost: formatSolAmount(props.sol_amount_drained),
    };

    this.tokenName = "UNKNOWN"; // TODO: add token metadata service & get token name
    this.timestamp = +props.occurred_at;
    this.transactions = {
      frontRun: {
        address: "0x0", // TODO: add address
        signature: "0x0",
      },
      victim: {
        address: "0x0",
        signature: props.tx_hash_victim_swap,
      },
      backRun: {
        address: "0x0",
        signature: "0x0",
      },
    };
  }
}
