import * as fs from "node:fs";
import * as csv from "csv-parser";
import * as path from "node:path";
import * as readlineSync from "readline-sync";
import * as chalk from "chalk";
import { PrismaClient } from "@prisma/client";

const parseCsv = async (csvPath: string) => {
  const results = [];

  await new Promise((resolve, reject) => {
    fs.createReadStream(path.join(__dirname, csvPath))
      .pipe(csv())
      .on("data", (data) => results.push(data))
      .on("end", resolve)
      .on("error", reject);
  });

  return results;
};

(async () => {
  const databaseUrl = process.env.DATABASE_URL;

  if (!readlineSync.keyInYN(`Are you sure you want to seed the database located at ${chalk.bgYellow(databaseUrl)}?`)) {
    process.exit();
  }

  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
  });

  const sandwichEvents = await parseCsv("dump/sandwich_events_last_100.csv");
  await prisma.sandwichEvent.createMany({
    data: sandwichEvents.map((event) => ({
      slot: event.slot,
      sol_amount_drained: event.sol_drained,
      sol_amount_swap: event.victim_amount_in,
      tx_hash_victim_swap: event.victim_tx_hash,
      tx_hash_attacker_buy: event.tx_hash_buy,
      tx_hash_attacker_sell: event.tx_hash_sell,
      token_address: event.token_address,
      attacker_address: event.wallet_address,
      victim_address: event.victim_wallet_address,
      lp_address: event.lp,
      dex_name: event.source,
      occurred_at: new Date(event.timestamp),
    })),
    skipDuplicates: true,
  });
})();
