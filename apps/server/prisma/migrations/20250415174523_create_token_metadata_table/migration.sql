-- CreateTable
CREATE TABLE "token_metadata" (
    "token_address" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "decimals" INTEGER NOT NULL,
    "uri" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "token_metadata_pkey" PRIMARY KEY ("token_address")
);

-- CreateIndex
CREATE INDEX "sandwich_events_token_address_idx" ON "sandwich_events"("token_address");

-- CreateIndex
CREATE INDEX "sandwich_events_occurred_at_idx" ON "sandwich_events"("occurred_at");

-- CreateIndex
CREATE INDEX "sandwich_events_victim_address_occurred_at_idx" ON "sandwich_events"("victim_address", "occurred_at");
