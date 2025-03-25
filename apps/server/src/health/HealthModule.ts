import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { TerminusModule } from "@nestjs/terminus";

import { HealthController } from "./HealthController";
import { ConfigModule } from "@nestjs/config";
import { PrismaModule } from "../prisma/PrismaModule";

@Module({
  imports: [TerminusModule, HttpModule, ConfigModule, PrismaModule],
  controllers: [HealthController],
  providers: [],
})
export class HealthModule {}
