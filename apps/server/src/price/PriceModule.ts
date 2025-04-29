import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";

import { PriceService } from "./PriceService";

@Module({
  imports: [HttpModule],
  providers: [PriceService],
  controllers: [],
  exports: [PriceService],
})
export class PriceModule {}
