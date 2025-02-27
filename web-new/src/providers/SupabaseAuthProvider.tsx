"use client";

import React, { createContext, useEffect, useState } from "react";
import { Session } from "@supabase/supabase-js";

import { supabase } from "@/services/supabase";

export const SupabaseAuthContext = createContext<{ session: Session | null } | null>(null);

export default function SupabaseAuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        setSession(null);
      } else if (session) {
        setSession(session);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return <SupabaseAuthContext.Provider value={{ session }}>{children}</SupabaseAuthContext.Provider>;
}
