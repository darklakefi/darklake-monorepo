import { createClient } from "@supabase/supabase-js";
import { LocalStorage } from "@/constants/storage";
import { getSiteUrl } from "@/utils/env";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
);

export const signInWithTwitter = async (redirectPath: string = "/") => {
  localStorage.removeItem(LocalStorage.SIGN_IN_INITIATED);

  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "twitter",
      options: {
        redirectTo: `${getSiteUrl()}${redirectPath}`,
      },
    });

    if (error) {
      return;
    }

    localStorage.setItem(LocalStorage.SIGN_IN_INITIATED, "1");
  } catch (e) {
    console.error(e);
  }
};

export const signOut = async () => {
  try {
    await supabase.auth.signOut();
  } catch (e) {
    console.error(e);
  }

  localStorage.removeItem(LocalStorage.SIGN_IN_INITIATED);
  localStorage.removeItem(LocalStorage.LOOKUP_ADDRESS);
};
