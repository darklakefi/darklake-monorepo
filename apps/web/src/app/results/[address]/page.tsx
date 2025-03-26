"use client";

import { notFound, useParams } from "next/navigation";
import MevAttackResults from "@/components/MevAttackResults";
import { isValidSolanaAddress } from "@/utils/blockchain";

export default function Page() {
  const params = useParams<{ address: string }>();

  if (!params.address || !isValidSolanaAddress(params.address)) {
    notFound();
  }

  return <MevAttackResults address={params.address} />;
}
