import ProgressBar from "@/components/ProgressBar";
import { MevAttack } from "@/types/Mev";
import { format } from "date-fns";
import { ReactNode } from "react";

export interface AttackDetailCardProps {
  mevAttack: MevAttack;
  cardTitle?: string | ReactNode;
  onOpenModal?: () => void;
}

const AttackDetailCard = ({ mevAttack, cardTitle, onOpenModal }: AttackDetailCardProps) => {
  const handleOpenBreakdownModal = () => {
    if (onOpenModal) {
      onOpenModal();
    }
  };

  const extractedPercentageRounded = Number(((mevAttack.solAmount.lost / mevAttack.solAmount.sent) * 100).toFixed(2));
  return (
    <div className="flex flex-col bg-brand-60 gap-4 p-4 h-full">
      <div className="flex flex-col">
        {cardTitle && <div className="text-lg leading-6 tracking-normal text-brand-20">{cardTitle}</div>}
        <div className="text-lg leading-6 tracking-normal text-brand-30 uppercase">TOKEN: {mevAttack.tokenName}</div>
        <div className="text-lg leading-6 tracking-normal text-brand-30">
          {format(mevAttack.timestamp || new Date(), "yyyy-MM-dd HH:mm 'UTC'")}
        </div>
      </div>
      <div className="flex flex-col gap-3 py-4 border-t border-b border-brand-40">
        <div className="text-3xl leading-8 tracking-wide">{mevAttack.solAmount.lost} SOL LOST</div>
        <div className="text-lg leading-6 tracking-normal">
          <ProgressBar progress={extractedPercentageRounded} />
        </div>
        <div className="flex flex-col">
          <div className="text-lg leading-6 tracking-normal text-brand-20 uppercase">
            {`${extractedPercentageRounded}% EXTRACTED`}
          </div>
          <div className="text-lg leading-6 tracking-normal text-brand-30">
            FROM A {mevAttack.solAmount.sent} SOL TRANSACTION
          </div>
        </div>
      </div>
      <button
        className="uppercase underline text-lg leading-6 tracking-normal text-brand-30 w-fit"
        onClick={handleOpenBreakdownModal}
      >
        View attack breakdown
      </button>
    </div>
  );
};

const BlurredMode = ({ index }: { index: number }) => {
  return (
    <div className="flex flex-col bg-brand-60 gap-4 p-4 h-full">
      <div className="flex flex-col">
        <div className="text-lg leading-6 tracking-normal text-brand-20">#{index} LARGEST EXTRACTION EVENT</div>
        <div className="text-lg leading-6 tracking-normal text-brand-30">TOKEN: █████</div>
        <div className="text-lg leading-6 tracking-normal text-brand-30">████-██-██ ██:██ UTC</div>
      </div>
      <div className="flex flex-col gap-3 py-4 border-t border-b border-brand-40">
        <div className="text-3xl leading-8 tracking-wide">██.██ SOL LOST</div>
        <div className="text-lg leading-6 tracking-normal">░░░░░░░░░░░░░░░░░░░░░░░░░░</div>
        <div className="flex flex-col">
          <div className="text-lg leading-6 tracking-normal text-brand-20">██% EXTRACTED</div>
          <div className="text-lg leading-6 tracking-normal text-brand-30">FROM A ██.██ SOL TRANSACTION</div>
        </div>
      </div>
      <button className="uppercase underline text-lg leading-6 tracking-normal text-brand-30 w-fit">
        View attack breakdown
      </button>
    </div>
  );
};

AttackDetailCard.Blurred = BlurredMode;

export default AttackDetailCard;
