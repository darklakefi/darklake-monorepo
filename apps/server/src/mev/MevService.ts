import { Inject, Injectable, Logger } from "@nestjs/common";
import { BlockQueueStatus, Prisma } from "@prisma/client";

import { Cache, CACHE_MANAGER } from "@nestjs/cache-manager";
import {
  GetMevAttacksQuery,
  GetMevTotalExtractedQuery,
  GetMevTotalExtractedResponse,
  MevAttack,
  MevAttacksOrderBy,
  MevTotalExtracted,
} from "./model/Mev";
import { CacheTime, getCacheKeyWithParams } from "../utils/cache";
import { SolanaService } from "../solana/SolanaService";
import { PrismaService } from "../prisma/PrismaService";
import { formatSolAmount } from "../utils/blockchain";
import { PaginatedResponse, PaginatedResponseDataLimit } from "../types/Pagination";
import { PriceService } from "../price/PriceService";
import { TokenPriceId } from "../price/model/Price";

enum CacheKey {
  MEV_EVENTS_TOTAL_EXTRACTED = "MEV_EVENTS_TOTAL_EXTRACTED",
  MEV_EVENTS_PROCESSED_BLOCKS = "MEV_EVENTS_PROCESSED_BLOCKS",
  MEV_EVENTS_LOOKUP_BLOCKS = "MEV_EVENTS_LOOKUP_BLOCKS",
}

@Injectable()
export class MevService {
  private readonly logger = new Logger(MevService.name);

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly solanaService: SolanaService,
    private readonly prismaService: PrismaService,
    private readonly priceService: PriceService,
  ) {}

  async getTotalExtracted(query: GetMevTotalExtractedQuery): Promise<GetMevTotalExtractedResponse> {
    const lookupBlocks = await this.getLookupBlocks(query.address);
    const processedBlocks = await this.getProcessedBlocks(query.address, lookupBlocks);
    if (processedBlocks.length === 0) {
      return {
        processingBlocks: {
          completed: 0,
          total: lookupBlocks.length,
        },
      };
    }

    const processingBlocks = {
      completed: processedBlocks.length,
      total: lookupBlocks.length,
    };

    const cacheKey = getCacheKeyWithParams(CacheKey.MEV_EVENTS_TOTAL_EXTRACTED, [query.address]);
    const cached = await this.cacheManager.get<MevTotalExtracted>(cacheKey);
    if (cached) {
      return { data: cached, processingBlocks };
    }

    const totalSolExtracted = await this.prismaService.sandwichEvent.aggregate({
      _sum: {
        sol_amount_drained: true,
      },
      where: {
        victim_address: query.address,
        slot: { in: processedBlocks },
      },
    });

    let data: MevTotalExtracted = {
      totalSolExtracted: totalSolExtracted._sum.sol_amount_drained
        ? formatSolAmount(totalSolExtracted._sum.sol_amount_drained)
        : 0,
    };

    if (data.totalSolExtracted > 0) {
      const solUsdPrice = await this.priceService.getTokenPriceUsd(TokenPriceId.SOLANA);
      data = {
        ...data,
        totalUsdExtracted: solUsdPrice ? data.totalSolExtracted * solUsdPrice : undefined,
      };
    }

    await this.cacheManager.set(cacheKey, data, CacheTime.ONE_SECOND);

    return {
      data,
      processingBlocks,
    };
  }

  private async getLookupBlocks(address: string): Promise<number[]> {
    const cacheKey = getCacheKeyWithParams(CacheKey.MEV_EVENTS_LOOKUP_BLOCKS, [address]);
    const cached = await this.cacheManager.get<number[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const slots = await this.solanaService.getLast1000ConfirmedSlotsByAddress(address);

    // cache if empty regardless to prevent requesting RPC in case fresh address
    await this.cacheManager.set(cacheKey, slots, CacheTime.TWO_MINUTES);

    if (!slots?.length) {
      return [];
    }

    await this.prismaService.blockQueue.createMany({
      data: slots.map((slot) => ({
        slot,
        status: BlockQueueStatus.QUEUED,
      })),
      skipDuplicates: true,
    });

    return slots;
  }

  private async getProcessedBlocks(address: string, lookupBlocks: number[]): Promise<number[]> {
    const cacheKey = getCacheKeyWithParams(CacheKey.MEV_EVENTS_PROCESSED_BLOCKS, [address]);
    const cached = await this.cacheManager.get<number[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const processedBlocks = await this.prismaService.blockQueue.findMany({
      where: {
        slot: {
          in: lookupBlocks,
        },
        status: {
          in: [BlockQueueStatus.COMPLETED, BlockQueueStatus.FAILED],
        },
      },
    });

    const slots = processedBlocks.map((block) => Number(block.slot));

    await this.cacheManager.set(cacheKey, slots, CacheTime.ONE_SECOND);

    return slots;
  }

  async getMevAttacks(query: GetMevAttacksQuery): Promise<PaginatedResponse<MevAttack[]>> {
    const limit = Math.min(
      query.limit || PaginatedResponseDataLimit.MEV_EVENTS_LIST,
      PaginatedResponseDataLimit.MEV_EVENTS_LIST,
    );
    const offset = query.offset || 0;

    const whereQuery: Prisma.SandwichEventWhereInput = {
      victim_address: query.address,
    };

    let orderByQuery: Prisma.SandwichEventOrderByWithRelationInput;

    const orderByMap = {
      [MevAttacksOrderBy.DATE]: "occurred_at",
      [MevAttacksOrderBy.AMOUNT_DRAINED]: "sol_amount_drained",
    };

    if (query?.orderBy && orderByMap[query.orderBy]) {
      orderByQuery = { [orderByMap[query?.orderBy]]: query?.direction ?? "desc" };
    }

    const mevAttacks = await this.prismaService.sandwichEvent.findMany({
      where: whereQuery,
      orderBy: orderByQuery ?? { occurred_at: "desc" },
      take: limit,
      skip: offset,
    });

    const total = await this.prismaService.sandwichEvent.count({
      where: whereQuery,
    });

    const data = mevAttacks.map((event) => new MevAttack(event));

    return {
      limit,
      offset,
      total,
      result: data,
    };
  }
}
