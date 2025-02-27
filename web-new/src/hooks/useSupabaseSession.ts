import { useContext } from "react";
import { SupabaseAuthContext } from "@/providers/SupabaseAuthProvider";

const useSupabaseSession = () => {
  const context = useContext(SupabaseAuthContext);

  if (context === null) {
    throw new Error("No parent <SupabaseAuthProvider />");
  }

  return context?.session;
};

export default useSupabaseSession;
