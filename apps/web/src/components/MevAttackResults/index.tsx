import TotalExtracted from "@/components/MevAttackResults/TotalExtracted";
import WaddlesWithMessage from "@/components/MevAttackResults/WaddlesWithMessage";
import DetailResults from "./DetailResults";
import useGetTotalExtracted from "@/hooks/api/useGetTotalExtracted";
import { useMemo } from "react";
import NoTransactionWaddle from "./NoTransactionWaddle";

export default function MevAttackResults({ address }: { address: string }) {
  const { data } = useGetTotalExtracted(address);

  const accountHasNoTransactions = useMemo(() => {
    return data?.processingBlocks.total === 0;
  }, [data]);

  if (accountHasNoTransactions) {
    return <NoTransactionWaddle />;
  }

  return (
    <div className="relative">
      <div className="lg:flex flex-row space-between items-center relative lg:pb-20 max-sm:mb-20">
        <div className="lg:w-[400px] max-lg:mb-20">
          <TotalExtracted
            solAmount={data?.data?.totalSolExtracted ?? 0}
            usdAmount={data?.data?.totalUsdExtracted}
            address={address}
            processingBlocks={data?.processingBlocks}
          />
        </div>
        <WaddlesWithMessage solAmount={data?.data?.totalSolExtracted ?? 0} />
      </div>
      <div className="bg-brand-70 p-6 shadow-[12px_12px_0px_0px] shadow-brand-80">
        <DetailResults address={address} />
      </div>
    </div>
  );
}
