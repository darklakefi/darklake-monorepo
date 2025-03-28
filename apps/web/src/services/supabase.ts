import { createClient } from "@supabase/supabase-js";
import { LocalStorage } from "@/constants/storage";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
);

export const signInWithTwitter = async () => {
  localStorage.removeItem(LocalStorage.SIGN_IN_INITIATED);

  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "twitter",
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
