import { Module } from "@nestjs/common";
import { TokenMetadataService } from "./TokenMetadataService";
import { PrismaModule } from "../prisma/PrismaModule";
import { SolanaModule } from "../solana/SolanaModule";

@Module({
  imports: [PrismaModule, SolanaModule],
  controllers: [],
  providers: [TokenMetadataService],
  exports: [TokenMetadataService],
})
export class TokenMetadataModule {}
