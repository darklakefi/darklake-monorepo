"use client";

import { useId, useState } from "react";
import { MevAttack } from "@/types/Mev";
import AttackDetailCard from "@/components/AttackDetailCard";
import AttackBreakdownModal from "@/components/Modal/AttackBreakdownModal";

interface BrutalMevExtractionsLiveEvidenceProps {
  attacks: MevAttack[];
}

export default function BrutalMevExtractionsLiveEvidence(props: BrutalMevExtractionsLiveEvidenceProps) {
  const { attacks } = props;
  const key = useId();

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
    <div>
      <h2 className="text-3xl uppercase text-brand-30 font-primary mb-4">
        Brutal MEV Extractions <span className="text-brand-20">Live Evidence</span>
      </h2>
      <div className="flex flex-col md:flex-row gap-4">
        {attacks?.map((attack, index) => (
          <div className="flex-1 overflow-hidden" key={`${key}-${index}`}>
            <AttackDetailCard
              cardTitle={<span className="uppercase">Case #{index + 1}</span>}
              mevAttack={attack}
              onOpenModal={() => openModal(attack)}
            />
          </div>
        ))}
      </div>

      <AttackBreakdownModal mevAttack={selectedMevAttack} isOpen={isOpenBreakdownModal} onClose={closeModal} />
    </div>
  );
}
