import BrutalMevExtractionsLiveEvidence from "@/components/BrutalMevExtractionsLiveEvidence";
import MevExtractionsHappeningNow from "@/components/MevExtractionsHappeningNow";

export default function Home() {
  return (
    <div className="bg-brand-70 p-6 max-w-5xl w-full mx-auto flex flex-col gap-20">
      <MevExtractionsHappeningNow
        drainToday={{ amountSol: 127.6, amountUsd: 24371 }}
        weekTotal={{ amountSol: 670.71, amountUsd: 128055 }}
        attacksToday={{ attacksTodayCount: 1813, attacksWeekCount: 9213 }}
      />
      <BrutalMevExtractionsLiveEvidence  
      extractionCases={[
        {
          caseNumber: 1,
          tokenName: "Libra",
          date: new Date(),
          amountSolLost: 9.04,
          percentageExtracted: 64,
          totalSolTransactionAmount: 14.13,
          attackBreakdownLink: "https://example.com"
        },
        {
          caseNumber: 1,
          tokenName: "Libra",
          date: new Date(),
          amountSolLost: 9.04,
          percentageExtracted: 64,
          totalSolTransactionAmount: 14.13,
          attackBreakdownLink: "https://example.com"
        },
        {
          caseNumber: 1,
          tokenName: "Libra",
          date: new Date(),
          amountSolLost: 9.04,
          percentageExtracted: 64,
          totalSolTransactionAmount: 14.13,
          attackBreakdownLink: "https://example.com"
        }
      ]}
      />
    </div>
  );
}
