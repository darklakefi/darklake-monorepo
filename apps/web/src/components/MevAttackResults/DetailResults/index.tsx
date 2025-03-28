"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";

import DetailResultContent from "./DetailResultContent";
import DetailResultHeader from "./DetailResultHeader";
import LookedDetailResultContent from "./LookedDetailResultContent";
import { signInWithTwitter } from "@/services/supabase";
import { LocalStorage } from "@/constants/storage";
import useSupabaseSession from "@/hooks/useSupabaseSession";

export default function DetailResults({ address }: { address: string }) {
  const [isConnectingTwitter, setIsConnectingTwitter] = useState(false);
  const supabaseSession = useSupabaseSession();
  const pathname = usePathname();

  const onConnectTwitterCLick = async () => {
    if (isConnectingTwitter) return;
    setIsConnectingTwitter(true);

    await signInWithTwitter(pathname);
    localStorage.setItem(LocalStorage.LOOKUP_ADDRESS, address);

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
