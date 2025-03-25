"use client";

import { formatMoney } from "@/utils/number";
import { cn } from "@/utils/common";
import Button from "@/components/Button";
import { shareOnTwitter } from "@/utils/browser";
import { getSiteUrl } from "@/utils/env";

export default function TotalExtracted({
  solAmount,
  usdAmount,
  address,
  processedBlocks,
}: {
  solAmount: number;
  usdAmount: number;
  address: string;
  processedBlocks?: { total: number; completed: number };
}) {
  const solAmountFormatted = formatMoney(solAmount);
  const solAmountParts = solAmountFormatted.split(".");

  const siteUrl = (getSiteUrl() || "darklake.fi").replaceAll("http://", "").replaceAll("https://", "");

  const progress = processedBlocks ? (processedBlocks.completed / processedBlocks.total) * 100 : 0;

  return (
    <div
      className={cn(
        "bg-brand-10 p-6 shadow-[12px_12px_0px_0px] shadow-brand-80",
        "text-brand-30 uppercase font-primary text-3xl",
      )}
    >
      <p>Total Extracted</p>
      <div className="text-brand-70 h-[88px] flex flex-col justify-end">
        <p>
          <span className="text-[100px]">{solAmountParts[0]}</span>
          {!!solAmountParts[1] && `.${solAmountParts[1]}`} SOL
        </p>
      </div>
      <p>{formatMoney(usdAmount)} USD</p>
      {progress > 50 && solAmount > 0 && (
        <Button
          className="w-full mt-8"
          onClick={() =>
            shareOnTwitter(
              `I lost ${solAmountFormatted} SOL to MEV` +
                `\n\nCheck how much you got MEV'd at ${siteUrl}/mev?share${address}`,
            )
          }
        >
          Expose the truth on <i className="hn hn-x text-xl" />
        </Button>
      )}
      {!processedBlocks && (
        <Button className="w-full mt-8" disabled>
          / Analyzing blockchain evidence
        </Button>
      )}
    </div>
  );
}
