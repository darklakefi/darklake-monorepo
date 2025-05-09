"use client";

import TotalExtracted from "@/components/MevAttackResults/TotalExtracted";
import WaddlesWithMessage from "@/components/MevAttackResults/WaddlesWithMessage";
import useGetTotalExtracted from "@/hooks/api/useGetTotalExtracted";
import { GetMevTotalExtractedResponse } from "@/types/Mev";
import { useState } from "react";
import DetailResults from "./DetailResults";
import { MevAttackLoadingScreen } from "./MevAttackLoadingScreen";

interface MevAttackResultsProps {
  address: string;
  mevAttackResults: GetMevTotalExtractedResponse;
}
export default function MevAttackResults({ address, mevAttackResults }: MevAttackResultsProps) {
  const blockProcessingComplete =
    mevAttackResults.processingBlocks.completed === mevAttackResults.processingBlocks.total;
  const [showLoadingScreen, setShowLoadingScreen] = useState(!blockProcessingComplete);
  const { data: dynamicData } = useGetTotalExtracted(address, mevAttackResults);

  if (!blockProcessingComplete) {
    setTimeout(() => {
      setShowLoadingScreen(false);
    }, 5000);
  }

  if (showLoadingScreen) {
    return <MevAttackLoadingScreen />;
  }

  const currentData = dynamicData || mevAttackResults;

  return (
    <div>
      <div className="lg:flex flex-row gap-12 items-end">
        <div className="lg:w-96 mb-20">
          <TotalExtracted mevAttackResults={currentData} address={address} />
        </div>
        <WaddlesWithMessage solAmount={currentData.data?.totalSolExtracted ?? 0} />
      </div>
      <div className="bg-brand-70 p-6 shadow-3xl shadow-brand-80 mb-20">
        <DetailResults address={address} />
      </div>
    </div>
  );
}
