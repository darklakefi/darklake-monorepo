import MevAttackResults from "@/components/MevAttackResults";
import NoTransactionWaddle from "@/components/MevAttackResults/NoTransactionWaddle";
import axiosClient from "@/services/axiosClient";
import { GetMevTotalExtractedResponse } from "@/types/Mev";
import { isValidSolanaAddress } from "@/utils/blockchain";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{
    address: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  const { address } = await params;
  if (!address || !isValidSolanaAddress(address)) {
    notFound();
  }

  const res = await axiosClient.get<GetMevTotalExtractedResponse>("v1/mev/total-extracted", {
    params: {
      address,
    },
  });

  const data = res.data;

  const accountHasNoTransactions = data?.processingBlocks.total === 0;

  if (accountHasNoTransactions) {
    return <NoTransactionWaddle />;
  }

  return <MevAttackResults address={address} mevAttackResults={data} />;
}
