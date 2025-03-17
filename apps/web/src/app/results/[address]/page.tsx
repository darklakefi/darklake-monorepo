"use client";

import { useParams } from "next/navigation";
import MevAttackResults from "@/components/MevAttackResults";

export default function Page() {
  const params = useParams<{ address: string }>();

  return <MevAttackResults address={params.address} />;
}
