"use client";

import React, { createContext, useEffect, useState } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/services/supabase";
import { LocalStorage } from "@/constants/storage";

export const SupabaseAuthContext = createContext<{ session: Session | null } | null>(null);

export default function SupabaseAuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT") {
        setSession(null);
        return;
      }

      if (!session) {
        return;
      }

      setSession(session);

      const walletAddress = localStorage.getItem(LocalStorage.LOOKUP_ADDRESS);
      if (!walletAddress?.length) {
        return;
      }

      try {
        await supabase!.auth.updateUser({ data: { walletAddress } });
        localStorage.removeItem(LocalStorage.LOOKUP_ADDRESS);
      } catch (e) {
        //
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return <SupabaseAuthContext.Provider value={{ session }}>{children}</SupabaseAuthContext.Provider>;
}
