"use client";

import AttackDetailCard from "@/components/AttackDetailCard";
import AttackBreakdownModal from "@/components/Modal/AttackBreakdownModal";
import { MevAttack } from "@/types/Mev";
import { useState } from "react";

type AttackDetailsTabProps = {
  mevAttacks: MevAttack[];
  hasMore: boolean;
  onLoadMore: () => void;
  isLoadingMore: boolean;
};

const AttackDetailsTab = ({ mevAttacks, hasMore, onLoadMore, isLoadingMore }: AttackDetailsTabProps) => {
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
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mevAttacks?.map((attack, index) => (
          <AttackDetailCard key={index} mevAttack={attack} onOpenModal={() => openModal(attack)} />
        ))}
      </div>

      {hasMore && !isLoadingMore && (
        <button className="w-fit text-center bg-brand-60 px-3 py-1 hover-with-active mx-auto" onClick={onLoadMore}>
          <div className="text-lg leading-6 tracking-normal text-brand-20">Load More</div>
        </button>
      )}

      {isLoadingMore && (
        <div className="text-brand-20 w-fit text-center mx-auto">
          <div className="animate-spin p-0 w-5 h-5 text-[20px]">
            <i className="hn hn-spinner-solid" />
          </div>
        </div>
      )}

      <AttackBreakdownModal mevAttack={selectedMevAttack} isOpen={isOpenBreakdownModal} onClose={closeModal} />
    </div>
  );
};

export default AttackDetailsTab;
