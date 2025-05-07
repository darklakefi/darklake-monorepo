import { Inject, Injectable, Logger } from "@nestjs/common";
import { BlockQueueStatus, Prisma } from "@prisma/client";

import { Cache, CACHE_MANAGER } from "@nestjs/cache-manager";
import * as dayjs from "dayjs";
import { TokenMetadataService } from "src/token-metadata/TokenMetadataService";
import { PriceService } from "../price/PriceService";
import { TokenPriceId } from "../price/model/Price";
import { PrismaService } from "../prisma/PrismaService";
import { SolanaService } from "../solana/SolanaService";
import { PaginatedResponse, PaginatedResponseDataLimit } from "../types/Pagination";
import { formatSolAmount } from "../utils/blockchain";
import { CacheTime, getCacheKeyWithParams } from "../utils/cache";
import {
  CheckAddressExistQuery,
  CheckAddressExistResponse,
  GetMevAttacksQuery,
  GetMevSummaryResponse,
  GetMevTotalExtractedQuery,
  GetMevTotalExtractedResponse,
  MevAttack,
  MevAttacksOrderBy,
  MevAttacksSummary,
  MevTotalExtracted,
  SandwichEventExtended,
} from "./model/Mev";

enum CacheKey {
  MEV_EVENTS_TOTAL_EXTRACTED = "MEV_EVENTS_TOTAL_EXTRACTED",
  MEV_EVENTS_PROCESSED_BLOCKS = "MEV_EVENTS_PROCESSED_BLOCKS",
  MEV_EVENTS_LOOKUP_BLOCKS = "MEV_EVENTS_LOOKUP_BLOCKS",
  MEV_EVENTS_SUMMARY = "MEV_EVENTS_SUMMARY",
  ADDRESS_EXIST = "ADDRESS_EXIST",
}

@Injectable()
export class MevService {
  private readonly logger = new Logger(MevService.name);

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly solanaService: SolanaService,
    private readonly prismaService: PrismaService,
    private readonly priceService: PriceService,
    private readonly tokenMetadataService: TokenMetadataService,
  ) {}

  async getMevSummary(): Promise<GetMevSummaryResponse> {
    const cacheKey = getCacheKeyWithParams(CacheKey.MEV_EVENTS_SUMMARY, []);
    const cached = await this.cacheManager.get<GetMevSummaryResponse>(cacheKey);
    if (cached) {
      return cached;
    }

    const now = dayjs();
    const start24h = now.subtract(24, "hour").toDate();
    const start7days = now.subtract(7, "day").toDate();

    const solUsdPrice = await this.priceService.getTokenPriceUsd(TokenPriceId.SOLANA);

    const extracted24h = await this.getMevAttacksSummary(start24h, solUsdPrice);
    const extracted7days = await this.getMevAttacksSummary(start7days, solUsdPrice);
    const mevAttacks = await this.getMevAttacks({ limit: 3, offset: 0 });

    const data: GetMevSummaryResponse = {
      extracted24h,
      extracted7days,
      mevAttacks: mevAttacks.result,
    };

    await this.cacheManager.set(cacheKey, data, CacheTime.TEN_SECONDS);

    return data;
  }

  private async getMevAttacksSummary(timestampLimit: Date, solUsdPrice?: number): Promise<MevAttacksSummary> {
    const totalAttacks = await this.prismaService.sandwichEvent.count({
      where: {
        occurred_at: {
          gte: timestampLimit,
        },
      },
    });

    const totalSolExtracted = await this.prismaService.sandwichEvent.aggregate({
      _sum: {
        sol_amount_drained: true,
      },
      where: {
        occurred_at: {
          gte: timestampLimit,
        },
      },
    });

    const totalSol = totalSolExtracted._sum.sol_amount_drained
      ? formatSolAmount(totalSolExtracted._sum.sol_amount_drained)
      : 0;

    return {
      totalAttacks,
      totalSolExtracted: totalSol,
      totalUsdExtracted: solUsdPrice ? totalSol * solUsdPrice : undefined,
    };
  }

  async getTotalExtracted(query: GetMevTotalExtractedQuery): Promise<GetMevTotalExtractedResponse> {
    const lookupBlocks = await this.getLookupBlocks(query.address);
    // account has no transactions on solana
    if (lookupBlocks.length === 0) {
      return {
        processingBlocks: {
          completed: 0,
          total: 0,
        },
      };
    }

    // no blocks processed yet
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
      ...(query.address && { victim_address: query.address }),
    };

    let orderByQuery: Prisma.SandwichEventOrderByWithRelationInput;

    const orderByMap = {
      [MevAttacksOrderBy.DATE]: "occurred_at",
      [MevAttacksOrderBy.AMOUNT_DRAINED]: "sol_amount_drained",
    };

    if (query?.orderBy && orderByMap[query.orderBy]) {
      orderByQuery = { [orderByMap[query?.orderBy]]: query?.direction ?? "desc" };
    }

    const mevAttacks: SandwichEventExtended[] = await this.prismaService.$queryRawUnsafe(
      this.getSqlSandwichEventsWithTokenMetadata({
        where: whereQuery,
        orderBy: orderByQuery,
        take: limit,
        skip: offset,
      }),
    );

    const total = await this.prismaService.$queryRawUnsafe<{ total_count: number }[]>(
      this.getSqlSandwichEventsWithTokenMetadata({ where: whereQuery, onlyCount: true }),
    );

    const tokenMetadata = await this.tokenMetadataService.getTokenMetadataFromChain(
      mevAttacks.filter((event) => !event.token_symbol).map((event) => event.token_address),
    );

    const data = mevAttacks.map((event) => new MevAttack(event, tokenMetadata[event.token_address]));

    return {
      limit,
      offset,
      total: total[0].total_count,
      result: data,
    };
  }

  getSqlSandwichEventsWithTokenMetadata(options?: {
    where?: Prisma.SandwichEventWhereInput;
    orderBy?: Prisma.SandwichEventOrderByWithRelationInput;
    take?: number;
    skip?: number;
    onlyCount?: boolean;
  }): string {
    const { where, orderBy, take, skip, onlyCount } = options || {};

    let whereClause = "";
    if (where && Object.keys(where).length > 0) {
      whereClause =
        "WHERE " +
        Object.entries(where)
          .map(([key, value]) => `${key} = ${typeof value === "string" ? `'${value}'` : value}`)
          .join(" AND ");
    }

    let orderByClause = "";
    if (orderBy) {
      orderByClause =
        "ORDER BY " +
        Object.entries(orderBy)
          .map(([key, value]) => `${key} ${value}`)
          .join(", ");
    }

    const limitClause = take && !onlyCount ? `LIMIT ${take}` : "";
    const offsetClause = skip && !onlyCount ? `OFFSET ${skip}` : "";

    const sqlQuery = `
      SELECT
        se.*,
        tm.symbol as token_symbol
      FROM
        sandwich_events se
      LEFT JOIN
        token_metadata tm ON se.token_address = tm.token_address
      ${whereClause}
      ${orderByClause ? orderByClause : "ORDER BY occurred_at DESC"}
      ${limitClause}
      ${offsetClause}
    `;

    if (onlyCount) {
      return `SELECT CAST(COUNT(*) AS INTEGER) AS total_count FROM (${sqlQuery}) AS subquery`;
    }

    return sqlQuery;
  }

  async checkAddressExist(query: CheckAddressExistQuery): Promise<CheckAddressExistResponse> {
    const cacheKey = getCacheKeyWithParams(CacheKey.ADDRESS_EXIST, [query.address]);
    const cached = await this.cacheManager.get<boolean>(cacheKey);
    
    if (cached !== undefined) {
      return { addressExist: cached };
    }

    const address = query.address;
    const addressExist = await this.prismaService.sandwichEvent.findFirst({
      where: { victim_address: address },
    });
    const exists = !!addressExist;

    await this.cacheManager.set(cacheKey, exists, CacheTime.ONE_DAY);

    return { addressExist: exists };
  }
}
