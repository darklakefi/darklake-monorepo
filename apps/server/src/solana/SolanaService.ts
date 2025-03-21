import { Inject, Injectable, Logger } from "@nestjs/common";

import { Cache, CACHE_MANAGER } from "@nestjs/cache-manager";
import { ConfigService } from "@nestjs/config";
import { AppConfig } from "../config";
import { Connection, PublicKey } from "@solana/web3.js";

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
    this.logger.log("getLast1000ConfirmedSlotsByAddress()", address);
    this.logger.log(
      "getLast1000ConfirmedSlotsByAddress() solanaRpcHttpUrl",
      this.configService.get("solanaRpcHttpUrl"),
    );

    let signatures = [];

    try {
      signatures = await this.rpc.getSignaturesForAddress(new PublicKey(address), { limit: 1000 }, "confirmed");
    } catch (e) {
      this.logger.error("getSignaturesForAddress() failed:", e);
    }

    return signatures.map((signature) => signature.slot);
  };
}
