"use client";

import React, { createContext, useMemo, useState } from "react";
import WhatIsMevModal from "@/components/Modal/WhatIsMevModal";

export enum GlobalModalType {
  WHAT_IS_MEV = "WHAT_IS_MEV",
}

interface IGlobalModalContext {
  openModal: (type: GlobalModalType) => void;
}

export const GlobalModalContext = createContext<IGlobalModalContext | null>(null);

export default function GlobalModalProvider({ children }: { children: React.ReactNode }) {
  const [visibleModalType, setVisibleModalType] = useState<GlobalModalType | undefined>(undefined);

  const context = useMemo(
    () => ({
      openModal: (type: GlobalModalType) => setVisibleModalType(type),
    }),
    [],
  );

  return (
    <GlobalModalContext.Provider value={context}>
      {children}
      <WhatIsMevModal
        isOpen={visibleModalType === GlobalModalType.WHAT_IS_MEV}
        onClose={() => setVisibleModalType(undefined)}
      />
    </GlobalModalContext.Provider>
  );
}
