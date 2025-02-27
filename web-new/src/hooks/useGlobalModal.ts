import { useContext } from "react";
import { GlobalModalContext } from "@/providers/GlobalModalProvider";

const useGlobalModal = () => {
  const context = useContext(GlobalModalContext);

  if (context === null) {
    throw new Error("No parent <GlobalModalProvider />");
  }

  return context;
};

export default useGlobalModal;
