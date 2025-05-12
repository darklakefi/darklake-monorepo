"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";

import useSupabaseSession from "@/hooks/useSupabaseSession";
import { signInWithTwitter } from "@/services/supabase";
import DetailResultContent from "./DetailResultContent";
import DetailResultHeader from "./DetailResultHeader";
import LookedDetailResultContent from "./LookedDetailResultContent";

export default function DetailResults({ address }: { address: string }) {
  const [isConnectingTwitter, setIsConnectingTwitter] = useState(false);
  const supabaseSession = useSupabaseSession();
  const pathname = usePathname();
  const onConnectTwitterCLick = async () => {
    if (isConnectingTwitter) return;
    setIsConnectingTwitter(true);

    await signInWithTwitter(pathname);

    setIsConnectingTwitter(false);
  };

  const connectWithTwitterDisabled = isConnectingTwitter || !!supabaseSession;

  return (
    <div>
      <DetailResultHeader address={address} processedTime={new Date()} isSignedWithTwitter={!!supabaseSession} />
      {!supabaseSession && (
        <LookedDetailResultContent
          onConnect={onConnectTwitterCLick}
          connectWithTwitterDisabled={connectWithTwitterDisabled}
        />
      )}
      {!!supabaseSession && <DetailResultContent address={address} />}
    </div>
  );
}
