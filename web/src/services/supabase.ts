import { createClient } from "@supabase/supabase-js";
import { LocalStorage } from "@/constants/storage";
import invariant from "tiny-invariant";

const { NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY } = process.env;
export const supabase =
  NEXT_PUBLIC_SUPABASE_URL && NEXT_PUBLIC_SUPABASE_ANON_KEY
    ? createClient(NEXT_PUBLIC_SUPABASE_URL as string, NEXT_PUBLIC_SUPABASE_ANON_KEY as string)
    : undefined;

export const signInWithTwitter = async () => {
  localStorage.removeItem(LocalStorage.SIGN_IN_INITIATED);

  invariant(NEXT_PUBLIC_SUPABASE_URL, "NEXT_PUBLIC_SUPABASE_URL not provided");
  invariant(NEXT_PUBLIC_SUPABASE_ANON_KEY, "NEXT_PUBLIC_SUPABASE_ANON_KEY not provided");
  invariant(supabase, "Supabase is undefined");

  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "twitter",
    });

    if (error) {
      return;
    }

    localStorage.setItem(LocalStorage.SIGN_IN_INITIATED, "1");
  } catch (e) {
    //
  }
};
