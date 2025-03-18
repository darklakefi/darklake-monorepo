import { SolanaService } from "./SolanaService";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

@Module({
  imports: [ConfigModule],
  controllers: [],
  providers: [SolanaService],
  exports: [SolanaService],
})
export class SolanaModule {}
