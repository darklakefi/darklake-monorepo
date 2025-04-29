import { MevAttack, MevTotalExtracted } from "@/types/Mev";
import { useState } from "react";
import AttackBreakdownModal from "@/components/Modal/AttackBreakdownModal";
import { formatMoney } from "@/utils/number";
import SummaryCard from "@/components/SummaryCard";
import AttackDetailCard from "@/components/AttackDetailCard";

type SummaryTabProps = {
  mevAttacks: MevAttack[];
  totalAttacks: number;
  totalExtracted?: MevTotalExtracted;
};

const SummaryTab = ({ mevAttacks, totalAttacks, totalExtracted }: SummaryTabProps) => {
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

  const solAmountFormatted = formatMoney(totalExtracted?.totalSolExtracted ?? 0, 5);
  const solAmountParts = solAmountFormatted.split(".");

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-row gap-4">
        <div className="flex-1">
          <SummaryCard
            title="Total Extracted"
            content={
              <div className="flex flex-col gap-1 py-0.5">
                <div className="text-body text-brand-20">
                  {solAmountParts[0]}
                  {!!solAmountParts[1] && `.${solAmountParts[1]}`} SOL
                </div>
                {totalExtracted?.totalUsdExtracted && (
                  <div className="text-body-2 text-brand-30">{formatMoney(totalExtracted?.totalUsdExtracted)} USDC</div>
                )}
              </div>
            }
          />
        </div>
        <div className="flex-1">
          <SummaryCard
            title="Confirmed Attack"
            content={
              <div className="flex flex-col gap-1 py-0.5">
                <div className="text-body text-brand-20">{totalAttacks}</div>
              </div>
            }
          />
        </div>
      </div>
      <div className="flex flex-col md:flex-row gap-4">
        {mevAttacks.slice(0, 3).map((attack, index) => (
          <div className="flex-1 overflow-hidden" key={index}>
            <AttackDetailCard
              cardTitle={`#${index + 1} LARGEST EXTRACTION EVENT`}
              mevAttack={attack}
              onOpenModal={() => openModal(attack)}
            />
          </div>
        ))}
      </div>
      <AttackBreakdownModal mevAttack={selectedMevAttack} isOpen={isOpenBreakdownModal} onClose={closeModal} />
    </div>
  );
};

const BlurredMode = () => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-row gap-4">
        <div className="flex-1">
          <SummaryCard
            title="Total Extracted"
            content={
              <div className="flex flex-col gap-1 py-0.5">
                <div className="text-body text-brand-20">██.██ SOL</div>
                <div className="text-body-2 text-brand-30">████.██ USDC</div>
              </div>
            }
          />
        </div>
        <div className="flex-1 max-md:hidden">
          <SummaryCard
            title="Confirmed Attack"
            content={
              <div className="flex flex-col gap-1 py-0.5">
                <div className="text-body text-brand-20">██</div>
              </div>
            }
          />
        </div>
      </div>
      <div className="flex flex-row flex-wrap gap-4">
        <div className="flex-1">
          <AttackDetailCard.Blurred index={1} />
        </div>
        <div className="flex-1 max-md:hidden">
          <AttackDetailCard.Blurred index={2} />
        </div>
        <div className="flex-1 max-md:hidden">
          <AttackDetailCard.Blurred index={3} />
        </div>
      </div>
    </div>
  );
};

SummaryTab.Blurred = BlurredMode;

export default SummaryTab;
