"use client";

import BrutalMevExtractionsLiveEvidence from "./BrutalMevExtractionsLiveEvidence";
import MevExtractionsHappeningNow from "./MevExtractionsHappeningNow";
import MevExtractionsWrapper from "./MevExtractionsWrapper";
import useGetMevSummary from "@/hooks/api/useGetMevSummary";

export default function MevExtractionsLiveDashboard() {
  const { data } = useGetMevSummary();

  return (
    <div className="">
      <MevExtractionsWrapper>
        <div className="flex flex-col gap-20">
          <MevExtractionsHappeningNow
            drainToday={{
              amountSol: data?.extracted24h.totalSolExtracted || 0,
              amountUsd: data?.extracted24h.totalUsdExtracted || 0,
            }}
            weekTotal={{
              amountSol: data?.extracted7days.totalSolExtracted || 0,
              amountUsd: data?.extracted7days.totalUsdExtracted || 0,
            }}
            attacksToday={{
              attacksTodayCount: data?.extracted24h.totalAttacks || 0,
              attacksWeekCount: data?.extracted7days.totalAttacks || 0,
            }}
          />

          <BrutalMevExtractionsLiveEvidence attacks={data?.mevAttacks || []} />
        </div>
      </MevExtractionsWrapper>
    </div>
  );
}
