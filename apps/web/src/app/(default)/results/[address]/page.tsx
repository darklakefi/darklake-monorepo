"use client";

import { notFound, useParams } from "next/navigation";
import MevAttackResults from "@/components/MevAttackResults";
import { isValidSolanaAddress } from "@/utils/blockchain";
import useLocalStorage from "@/hooks/useLocalStorage";
import { LocalStorage } from "@/constants/storage";
import { useEffect } from "react";

export default function Page() {
  const params = useParams<{ address: string }>();
  const [, setLookupAddress] = useLocalStorage<string | null>(LocalStorage.LOOKUP_ADDRESS, null);

  useEffect(() => {
    if (params.address && isValidSolanaAddress(params.address)) {
      setLookupAddress(params.address);
    }
  }, [params.address, setLookupAddress]);

  if (!params.address || !isValidSolanaAddress(params.address)) {
    notFound();
  }

  return <MevAttackResults address={params.address} />;
}
