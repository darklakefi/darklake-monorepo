import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
);

// TODO: wip
export const signInWithTwitter = async () => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "twitter",
    });
    console.log("data", data);
    console.log("error", error);
  } catch (e) {
    console.error("signInWithOAuth failed", e);
  }
};
