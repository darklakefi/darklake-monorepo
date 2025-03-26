import { Inject, Injectable, Logger } from "@nestjs/common";

import { Cache, CACHE_MANAGER } from "@nestjs/cache-manager";
import { ConfigService } from "@nestjs/config";
import { AppConfig } from "../config";
import { Connection, PublicKey } from "@solana/web3.js";
import { uniq } from "lodash";

@Injectable()
export class SolanaService {
  private readonly logger = new Logger(SolanaService.name);

  private readonly rpc: Connection;

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly configService: ConfigService<AppConfig>,
  ) {
    this.rpc = new Connection(this.configService.get("solanaRpcHttpUrl"));
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
}
