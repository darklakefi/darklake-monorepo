import { PrismaService } from "./PrismaService";
import { Module } from "@nestjs/common";

@Module({
  controllers: [],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
