"use client";

import MevAttackResults from "@/components/MevAttackResults";
import { LocalStorage } from "@/constants/storage";
import useLocalStorage from "@/hooks/useLocalStorage";
import { isValidSolanaAddress } from "@/utils/blockchain";
import { notFound, useParams } from "next/navigation";

export default function Page() {
  const params = useParams<{ address: string }>();
  const [lookupAddress, setLookupAddress] = useLocalStorage<string | null>(LocalStorage.LOOKUP_ADDRESS, null);

  if (!params.address || !isValidSolanaAddress(params.address)) {
    notFound();
  }

  if (lookupAddress !== params.address) {
    setLookupAddress(params.address);
  }

  return <MevAttackResults address={params.address} />;
}
