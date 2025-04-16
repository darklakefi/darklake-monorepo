import { Inject, Injectable, Logger } from "@nestjs/common";

import { Cache, CACHE_MANAGER } from "@nestjs/cache-manager";
import { ConfigService } from "@nestjs/config";
import { AppConfig } from "../config";
import { Connection, PublicKey } from "@solana/web3.js";
import { uniq } from "lodash";
import { TokenMetadataDto } from "src/token-metadata/model/TokenMetadata";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { fetchAllDigitalAsset, mplTokenMetadata } from "@metaplex-foundation/mpl-token-metadata";
import { Umi, publicKey } from "@metaplex-foundation/umi";

@Injectable()
export class SolanaService {
  private readonly logger = new Logger(SolanaService.name);

  private readonly rpc: Connection;

  private readonly umi: Umi;

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly configService: ConfigService<AppConfig>,
  ) {
    this.rpc = new Connection(this.configService.get("solanaRpcHttpUrl"));
    this.umi = createUmi(this.configService.get("solanaRpcHttpUrl"));
    this.umi.use(mplTokenMetadata());
  }

  getLast1000ConfirmedSlotsByAddress = async (address: string): Promise<number[]> => {
    let signatures = [];

    try {
      signatures = await this.rpc.getSignaturesForAddress(new PublicKey(address), { limit: 1000 }, "confirmed");
    } catch (e) {
      this.logger.error(`getLast1000ConfirmedSlotsByAddress() failed: ${e}`);
    }

    return uniq(signatures.map((signature) => signature.slot));
  };

  async fetchTokenMetadataFromChain(tokenAddress: string[]): Promise<TokenMetadataDto[]> {
    try {
      const digitalAsset = await fetchAllDigitalAsset(
        this.umi,
        tokenAddress.map((address) => publicKey(address)),
      );
      return digitalAsset.map((asset) => ({
        tokenAddress: asset.mint.publicKey,
        name: asset.metadata.name,
        symbol: asset.metadata.symbol,
        decimals: asset.mint.decimals,
        uri: asset.metadata.uri,
      }));
    } catch (error) {
      this.logger.error(`fetchTokenMetadataFromChain() failed: ${error.message}`);
      return [];
    }
  }
}
