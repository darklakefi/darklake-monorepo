import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/PrismaModule";
import { MevService } from "./MevService";
import { MevController } from "./MevController";
import { SolanaModule } from "../solana/SolanaModule";
import { PriceModule } from "../price/PriceModule";
import { TokenMetadataModule } from "../token-metadata/TokenMetadataModule";

@Module({
  imports: [PrismaModule, SolanaModule, PriceModule, TokenMetadataModule],
  providers: [MevService],
  controllers: [MevController],
  exports: [MevService],
})
export class MevModule {}
