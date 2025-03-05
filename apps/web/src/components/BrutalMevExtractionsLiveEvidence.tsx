import Link from "next/link";
import MevExtractionCard from "./MevExtractionCard";
import { format } from "date-fns";
import { useId } from "react";

interface MevExtractionCase {
  caseNumber: number;
  tokenName: string;
  date: Date;
  amountSolLost: number;
  percentageExtracted: number;
  totalSolTransactionAmount: number;
  attackBreakdownLink: string;
}

interface BrutalMevExtractionsLiveEvidenceProps {
  extractionCases: [MevExtractionCase, MevExtractionCase, MevExtractionCase];
}

interface MevExtractionProgressBarProps {
  percentageExtracted: number;
}

function MevExtractionProgressBar(props: MevExtractionProgressBarProps) {
  const { percentageExtracted } = props;
  const totalBarCount = 30;

  return (
    <div className="text-lg flex min-w-0 flex-grow-0 overflow-hidden mb-2">
      <div
        className="overflow-hidden"
        style={{
          width: `${percentageExtracted}%`,
        }}
      >
        {"█".repeat(totalBarCount)}
      </div>
      <div
        className="overflow-hidden"
        style={{
          width: `${100 - percentageExtracted}%`,
        }}
      >
        {"░".repeat(totalBarCount)}
      </div>
    </div>
  );
}

export default function BrutalMevExtractionsLiveEvidence(props: BrutalMevExtractionsLiveEvidenceProps) {
  const { extractionCases } = props;
  const key = useId();

  return (
    <div>
      <h2 className="text-3xl uppercase text-brand-30 font-primary mb-4">
        Brutal MEV Extractions <span className="text-brand-20">Live Evidence</span>
      </h2>
      <div className="flex flex-col md:flex-row gap-4">
        {extractionCases.map((extractionCase, index) => {
          const {
            caseNumber,
            tokenName,
            date,
            amountSolLost,
            percentageExtracted,
            totalSolTransactionAmount,
            attackBreakdownLink,
          } = extractionCase;

          const formattedDate = format(date, "yyyy-MM-dd hh:mm OOO");

          return (
            <MevExtractionCard key={`${key}-${index}`}>
              <h3 className="text-lg text-brand-30">Case {caseNumber}</h3>
              <span className="text-lg text-brand-30">Token: {tokenName}</span>
              <span className="text-lg text-brand-30 mb-4">Date: {formattedDate}</span>
              <hr className="border-brand-40 mb-4" />
              <span className="text-3xl mb-2">{amountSolLost} Sol Lost</span>
              <MevExtractionProgressBar percentageExtracted={percentageExtracted} />
              <span className="text-lg text-brand-20">{percentageExtracted}% Extracted</span>
              <span className="text-lg text-brand-30 mb-4">From a {totalSolTransactionAmount} SOL Transaction</span>
              <hr className="border-brand-40 mb-4" />
              <Link href={attackBreakdownLink} className="text-lg text-brand-30 underline">
                View Attack Breakdown
              </Link>
            </MevExtractionCard>
          );
        })}
      </div>
    </div>
  );
}
