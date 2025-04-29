import { TokenMetadata } from "@prisma/client";

export class TokenMetadataDto {
  tokenAddress: string;
  name: string;
  symbol: string;
  decimals: number;
  uri?: string;

  constructor(metadata: TokenMetadata) {
    this.tokenAddress = metadata.token_address;
    this.name = metadata.name;
    this.symbol = metadata.symbol;
    this.decimals = metadata.decimals;
    this.uri = metadata.uri;
  }
}
