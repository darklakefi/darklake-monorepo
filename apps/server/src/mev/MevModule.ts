import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/PrismaModule";
import { MevService } from "./MevService";
import { MevController } from "./MevController";
import { SolanaModule } from "../solana/SolanaModule";
import { PriceModule } from "../price/PriceModule";

@Module({
  imports: [PrismaModule, SolanaModule, PriceModule],
  providers: [MevService],
  controllers: [MevController],
  exports: [MevService],
})
export class MevModule {}
