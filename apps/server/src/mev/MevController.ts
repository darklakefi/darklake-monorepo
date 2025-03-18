import { Controller, Get, Query, UseGuards, UsePipes, ValidationPipe } from "@nestjs/common";

import { GetMevAttacksQuery, GetMevTotalExtractedQuery } from "./model/Mev";
import { MevService } from "./MevService";
import { SupabaseAuthGuard } from "../guard/SupabaseAuthGuard";

@Controller("v1/mev")
export class MevController {
  constructor(private mevService: MevService) {}

  @Get("/attacks")
  @UsePipes(new ValidationPipe({ transform: true }))
  @UseGuards(SupabaseAuthGuard)
  getMevAttacks(@Query() query: GetMevAttacksQuery) {
    return this.mevService.getMevAttacks(query);
  }

  @Get("/total-extracted")
  getTotalExtracted(@Query() query: GetMevTotalExtractedQuery) {
    return this.mevService.getTotalExtracted(query);
  }
}
