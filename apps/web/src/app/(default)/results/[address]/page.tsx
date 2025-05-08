import MevAttackResults from "@/components/MevAttackResults";
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

  return <MevAttackResults address={address} />;
}
