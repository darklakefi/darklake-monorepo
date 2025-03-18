import { IsEnum, IsIn, IsInt, IsOptional, Max, Min, Validate } from "class-validator";
import { IsValidSolanaAddress } from "../../validator/IsValidSolanaAddress";
import { Type } from "class-transformer";

export class GetMevTotalExtractedQuery {
  @Validate(IsValidSolanaAddress)
  address: string;
}

export interface MevTotalExtracted {
  totalSolExtracted: number;
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
