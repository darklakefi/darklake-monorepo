import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject, Injectable, Logger } from "@nestjs/common";
import { Cache } from "cache-manager";

import { HttpService } from "@nestjs/axios";
import { CacheTime, getCacheKeyWithParams } from "../utils/cache";

export const PRICE_CACHE_KEY = "PRICE_CACHE_KEY";

@Injectable()
export class PriceService {
  private readonly logger = new Logger(PriceService.name);

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly httpService: HttpService,
  ) {}

  async getTokenPriceUsd(tokenId: string): Promise<number | undefined> {
    const cacheKey = getCacheKeyWithParams(PRICE_CACHE_KEY, [tokenId]);
    const cached = await this.cacheManager.get<number>(cacheKey);
    if (cached) {
      return cached;
    }

    let priceInUsd;
    try {
      const result = await this.httpService.axiosRef.get(`https://api.coingecko.com/api/v3/simple/price`, {
        params: {
          vs_currencies: "usd",
          ids: tokenId,
        },
      });
      priceInUsd = result?.data?.[tokenId]?.usd;
    } catch (e) {
      this.logger.error(`getTokenPriceUsd() failed: ${e}`);
    }

    if (priceInUsd) {
      await this.cacheManager.set(cacheKey, priceInUsd, CacheTime.TWO_MINUTES);
    }

    return priceInUsd;
  }
}
