"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { MevAttack } from "@/types/Mev";

interface AttackBreakdownModalContextType {
  isOpenBreakdownModal: boolean;
  selectedMevAttack: MevAttack | undefined;
  openModal: (attack: MevAttack) => void;
  closeModal: () => void;
}

const AttackBreakdownModalContext = createContext<AttackBreakdownModalContextType | undefined>(undefined);

export const AttackBreakdownModalProvider = ({ children }: { children: ReactNode }) => {
  const [isOpenBreakdownModal, setIsOpenBreakdownModal] = useState(false);
  const [selectedMevAttack, setSelectedMevAttack] = useState<MevAttack | undefined>(undefined);

  const openModal = (attack: MevAttack) => {
    setSelectedMevAttack(attack);
    setIsOpenBreakdownModal(true);
  };

  const closeModal = () => {
    setSelectedMevAttack(undefined);
    setIsOpenBreakdownModal(false);
  };

  return (
    <AttackBreakdownModalContext.Provider value={{ isOpenBreakdownModal, selectedMevAttack, openModal, closeModal }}>
      {children}
    </AttackBreakdownModalContext.Provider>
  );
};

export const useAttackBreakdownModal = () => {
  const context = useContext(AttackBreakdownModalContext);
  if (!context) {
    throw new Error("useAttackBreakdownModal must be used within an AttackBreakdownModalProvider");
  }
  return context;
};
