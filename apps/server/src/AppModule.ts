import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import config, { AppConfig } from "./config";
import { CacheModule } from "@nestjs/cache-manager";
import { createKeyv } from "@keyv/redis";
import { PrismaModule } from "./prisma/PrismaModule";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
    }),
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService<AppConfig>) => {
        const keyvRedis = createKeyv({
          url: `redis://${configService.getOrThrow("redisHost")}:${configService.getOrThrow("redisPort")}`,
          password: configService.getOrThrow("redisPassword"),
        });
        return {
          stores: [keyvRedis],
        };
      },
      isGlobal: true,
    }),
    PrismaModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
