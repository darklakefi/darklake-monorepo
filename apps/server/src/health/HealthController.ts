import { Controller, Get } from "@nestjs/common";
import { HealthCheck, HealthCheckService, HttpHealthIndicator, PrismaHealthIndicator } from "@nestjs/terminus";
import { SkipThrottle } from "@nestjs/throttler";
import { ConfigService } from "@nestjs/config";
import { AppConfig } from "../config";
import { PrismaService } from "../prisma/PrismaService";

@Controller("health")
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private prismaService: PrismaService,
    private prismaHealth: PrismaHealthIndicator,
    private httpHealth: HttpHealthIndicator,
    private configService: ConfigService<AppConfig>,
  ) {}

  @SkipThrottle()
  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.prismaHealth.pingCheck("database", this.prismaService),
      () => this.httpHealth.pingCheck("solanaHttpRpc", this.configService.get("solanaRpcHttpUrl")),
    ]);
  }
}
