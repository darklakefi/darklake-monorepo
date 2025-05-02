"use client";

import CheckMevAttackWrapper from "@/components/MevAttackResults/CheckMevAttackWrapper";
import TotalExtracted from "@/components/MevAttackResults/TotalExtracted";
import WaddlesWithMessage from "@/components/MevAttackResults/WaddlesWithMessage";
import useGetTotalExtracted from "@/hooks/api/useGetTotalExtracted";
import Image from "next/image";
import DetailResults from "./DetailResults";
import NoTransactionWaddle from "./NoTransactionWaddle";

import { useState } from "react";
export default function MevAttackResults({ address }: { address: string }) {
  const { data } = useGetTotalExtracted(address);
  const [showLoadingScreen, setShowLoadingScreen] = useState(true);

  const accountHasNoTransactions = data?.processingBlocks.total === 0;

  if (accountHasNoTransactions) {
    return <NoTransactionWaddle />;
  }

  setTimeout(() => {
    setShowLoadingScreen(false);
  }, 5000);

  return showLoadingScreen ? (
    <CheckMevAttackWrapper>
      <div className="flex items-center justify-between select-none">
        <div className="flex-1">
          <h1 className="font-primary text-3xl leading-7 text-brand-30 mb-8">
            Analyzing The Blocks
            <br />
            <span className="text-brand-20">This might take a few seconds.</span>
          </h1>
        </div>
        <div className="flex items-center justify-end flex-1">
          <Image src="/images/waddles/pose6.png" alt="Waddles" width={350} height={477} />
        </div>
      </div>
    </CheckMevAttackWrapper>
  ) : (
    <div>
      <div className="lg:flex flex-row gap-12 items-end">
        <div className="lg:w-96 mb-20">
          <TotalExtracted
            solAmount={data?.data?.totalSolExtracted ?? 0}
            usdAmount={data?.data?.totalUsdExtracted}
            address={address}
            processingBlocks={data?.processingBlocks}
          />
        </div>
        <WaddlesWithMessage solAmount={data?.data?.totalSolExtracted ?? 0} />
      </div>
      <div className="bg-brand-70 p-6 shadow-3xl shadow-brand-80 mb-20">
        <DetailResults address={address} />
      </div>
    </div>
  );
}
