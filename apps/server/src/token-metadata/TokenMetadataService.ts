import { Injectable } from "@nestjs/common";

import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject } from "@nestjs/common";
import { Cache } from "cache-manager";
import { TokenMetadataDto } from "./model/TokenMetadata";
import { PrismaService } from "../prisma/PrismaService";
import { SolanaService } from "../solana/SolanaService";
import { CacheTime, getCacheKeyWithParams } from "../utils/cache";

export const TOKEN_METADATA_CACHE_KEY = "TOKEN_METADATA_CACHE_KEY";

@Injectable()
export class TokenMetadataService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly solanaService: SolanaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async getTokenMetadataFromChain(mintAddresses: string[]): Promise<Record<string, TokenMetadataDto>> {
    const uniqueMintAddresses = [...new Set(mintAddresses)];
    if (uniqueMintAddresses.length === 0) {
      return {};
    }
    const notFoundInCache = [];
    const tokenMetadata: Record<string, TokenMetadataDto> = {};
    for (const mintAddress of uniqueMintAddresses) {
      const cacheKey = getCacheKeyWithParams(TOKEN_METADATA_CACHE_KEY, [mintAddress]);
      const cachedMetadata = await this.cacheManager.get<TokenMetadataDto>(cacheKey);
      if (cachedMetadata) {
        tokenMetadata[mintAddress] = cachedMetadata;
      } else {
        notFoundInCache.push(mintAddress);
      }
    }

    if (notFoundInCache.length > 0) {
      const newTokenMetadata = await this.solanaService.fetchTokenMetadataFromChain(notFoundInCache);
      await this.prisma.tokenMetadata.createMany({
        data: newTokenMetadata.map((metadata) => ({
          token_address: metadata.tokenAddress,
          name: metadata.name,
          symbol: metadata.symbol,
          decimals: metadata.decimals,
          uri: metadata.uri,
        })),
        skipDuplicates: true,
      });

      for (const metadata of newTokenMetadata) {
        tokenMetadata[metadata.tokenAddress] = metadata;
        await this.cacheManager.set(
          getCacheKeyWithParams(TOKEN_METADATA_CACHE_KEY, [metadata.tokenAddress]),
          metadata,
          CacheTime.ONE_HOUR,
        );
      }
    }

    return tokenMetadata;
  }
}
