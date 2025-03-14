-- CreateEnum
CREATE TYPE "BlockQueueStatus" AS ENUM ('QUEUED', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "block_queue" (
    "slot" BIGINT NOT NULL,
    "status" "BlockQueueStatus" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "block_queue_pkey" PRIMARY KEY ("slot")
);

-- CreateTable
CREATE TABLE "sandwich_events" (
    "slot" BIGINT NOT NULL,
    "sol_amount_drained" BIGINT NOT NULL,
    "sol_amount_swap" BIGINT NOT NULL,
    "tx_hash_victim_swap" TEXT NOT NULL,
    "tx_hash_attacker_buy" TEXT NOT NULL,
    "tx_hash_attacker_sell" TEXT NOT NULL,
    "token_address" TEXT NOT NULL,
    "attacker_address" TEXT NOT NULL,
    "victim_address" TEXT NOT NULL,
    "lp_address" TEXT NOT NULL,
    "dex_name" TEXT NOT NULL,
    "ocurred_at" TIMESTAMP(3) NOT NULL,
    "added_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sandwich_events_pkey" PRIMARY KEY ("tx_hash_victim_swap","token_address","attacker_address","victim_address")
);

-- CreateIndex
CREATE UNIQUE INDEX "block_queue_slot_key" ON "block_queue"("slot");

-- CreateIndex
CREATE INDEX "sandwich_events_victim_address_idx" ON "sandwich_events"("victim_address");
