"use client";

import { formatMoney } from "@/utils/number";
import { cn } from "@/utils/common";
import Button from "@/components/Button";

export default function TotalExtracted({ solAmount, usdAmount }: { solAmount: number; usdAmount: number }) {
  const solAmountParts = formatMoney(solAmount).split(".");

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
      <Button className="w-full mt-8">
        Expose the truth on <i className="hn hn-x text-xl" />
      </Button>
    </div>
  );
}
