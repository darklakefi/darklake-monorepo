import { formatMoney } from "@/utils/number";
import { useMemo } from "react";
import SummaryCard from "../SummaryCard";

interface MevExtractionsHappeningNowProps {
  drainToday: {
    amountSol: number;
    amountUsd: number;
  };
  weekTotal: {
    amountSol: number;
    amountUsd: number;
  };
  attacksToday: {
    attacksTodayCount: number;
    attacksWeekCount: number;
  };
}

export default function MevExtractionsHappeningNow(props: MevExtractionsHappeningNowProps) {
  const { drainToday, weekTotal, attacksToday } = props;

  const formattedDrainToday = useMemo(() => {
    const solAmountFormatted = formatMoney(drainToday?.amountSol ?? 0, 5);
    const solAmountParts = solAmountFormatted.split(".");

    return {
      solAmount: {
        wholePart: solAmountParts[0],
        fractionalPart: solAmountParts[1] ? solAmountParts[1] : "",
      },
      usdAmount: formatMoney(drainToday?.amountUsd ?? 0),
    };
  }, [drainToday]);

  const formattedWeekTotal = useMemo(() => {
    const solAmountFormatted = formatMoney(weekTotal?.amountSol ?? 0, 5);
    const solAmountParts = solAmountFormatted.split(".");

    return {
      solAmount: {
        wholePart: solAmountParts[0],
        fractionalPart: solAmountParts[1] ? solAmountParts[1] : "",
      },
      usdAmount: formatMoney(weekTotal?.amountUsd ?? 0),
    };
  }, [weekTotal]);

  return (
    <div>
      <h2 className="text-3xl uppercase text-brand-30 font-primary mb-4">
        Mev Extraction <span className="text-brand-20">Happening Now</span>
      </h2>
      <div className="flex gap-4 flex-col md:flex-row">
        <div className="flex-1">
          <SummaryCard
            title="Today's Drain"
            content={
              <div className="flex flex-col gap-1 py-0.5">
                <div className="text-body text-brand-20">
                  {formattedDrainToday.solAmount.wholePart}
                  {!!formattedDrainToday.solAmount.fractionalPart &&
                    `.${formattedDrainToday.solAmount.fractionalPart}`}{" "}
                  SOL
                </div>
                <div className="text-body-2 text-brand-30">{formattedDrainToday.usdAmount} USDC</div>
              </div>
            }
          />
        </div>

        <div className="flex-1">
          <SummaryCard
            title="7D Total MEV"
            content={
              <div className="flex flex-col gap-1 py-0.5">
                <div className="text-body text-brand-20">
                  {formattedWeekTotal.solAmount.wholePart}
                  {!!formattedWeekTotal.solAmount.fractionalPart &&
                    `.${formattedWeekTotal.solAmount.fractionalPart}`}{" "}
                  SOL
                </div>
                <div className="text-body-2 text-brand-30">{formattedWeekTotal.usdAmount} USDC</div>
              </div>
            }
          />
        </div>

        <div className="flex-1">
          <SummaryCard
            title="Attacks Today"
            content={
              <div className="flex flex-col gap-1 py-0.5">
                <div className="text-body text-brand-20">{attacksToday.attacksTodayCount}</div>
                <div className="text-body-2 text-brand-30">{attacksToday.attacksWeekCount} this week</div>
              </div>
            }
          />
        </div>
      </div>
    </div>
  );
}
