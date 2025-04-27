"use client";

import { formatMoney } from "@/utils/number";
import { cn } from "@/utils/common";
import Button from "@/components/Button";
import { shareOnTwitter } from "@/utils/browser";
import { getSiteUrl } from "@/utils/env";
import ProgressBar from "@/components/ProgressBar";

export default function TotalExtracted({
  solAmount,
  usdAmount,
  address,
  processingBlocks,
}: {
  solAmount: number;
  usdAmount?: number;
  address: string;
  processingBlocks?: { total: number; completed: number };
}) {
  const solAmountFormatted = formatMoney(solAmount, 5);
  const solAmountParts = solAmountFormatted.split(".");

  const siteUrl = (getSiteUrl() || "darklake.fi").replaceAll("http://", "").replaceAll("https://", "");

  const progress = processingBlocks ? (processingBlocks.completed / processingBlocks.total) * 100 : 0;

  return (
    <div className={cn("bg-brand-10 p-6 shadow-3xl shadow-brand-80", "text-brand-30 uppercase font-primary text-3xl")}>
      <p>Total Extracted</p>
      <div className="text-brand-70 h-[88px] flex flex-col justify-end">
        <p>
          <span className="text-[100px]">{solAmountParts[0]}</span>
          {!!solAmountParts[1] && `.${solAmountParts[1]}`} SOL
        </p>
      </div>
      {usdAmount && <p>{formatMoney(usdAmount)} USDC</p>}
      {!processingBlocks && (
        <Button className="w-full mt-8" disabled>
          / Analyzing blockchain evidence
        </Button>
      )}
      {!!processingBlocks && progress !== 100 && processingBlocks.total > 0 && (
        <div className="mt-8">
          <ProgressBar progress={progress} />
          <div className="mt-1 font-secondary text-lg flex flex-row justify-between">
            <span>&gt; Analyzing blocks:</span>
            <span>
              {processingBlocks.completed}/{processingBlocks.total} ({Math.floor(progress)}%)
            </span>
          </div>
        </div>
      )}
      {progress > 50 && solAmount > 0 && (
        <Button
          className="w-full mt-8"
          onClick={() =>
            shareOnTwitter(
              `I lost ${solAmountFormatted} SOL to MEV` +
                `\n\nCheck how much you got MEV'd at ${siteUrl}/mev?address=${address}`,
            )
          }
        >
          Expose the truth on <i className="hn hn-x text-xl" />
        </Button>
      )}
    </div>
  );
}
