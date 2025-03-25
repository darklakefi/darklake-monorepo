import { format } from "date-fns";

const AttackDetailCard = ({ index }: { index?: number }) => {
  return (
    <div className="flex flex-col bg-brand-60 gap-[16px] p-[16px] h-full">
      <div className="flex flex-col">
        {index && <div className="text-body-2 text-brand-20">#{index} LARGEST EXTRACTION EVENT</div>}
        <div className="text-body-2 text-brand-30">TOKEN: LIBRA</div>
        <div className="text-body-2 text-brand-30">{format(new Date(), "yyyy-MM-dd HH:mm 'UTC'")}</div>
      </div>
      <div className="flex flex-col gap-[12px] py-[16px] border-t border-b border-brand-40">
        <div className="text-body">9.04 SOL LOST</div>
        <div className="text-body-2">██████████████████░░░░░░░░░░░░░</div>
        <div className="flex flex-col">
          <div className="text-body-2 text-brand-20">64% EXTRACTED</div>
          <div className="text-body-2 text-brand-30">FROM A 14.13 SOL TRANSACTION</div>
        </div>
      </div>
      <button
        className="text-link text-brand-30 w-fit"
        onClick={() => {}}
      >
        View attack breakdown
      </button>
    </div>
  );
};

const BlurredMode = ({ index }: { index: number }) => {
  return (
    <div className="flex flex-col bg-brand-60 gap-[16px] p-[16px] h-full">
      <div className="flex flex-col">
        <div className="text-body-2 text-brand-20">#{index} LARGEST EXTRACTION EVENT</div>
        <div className="text-body-2 text-brand-30">TOKEN: █████</div>
        <div className="text-body-2 text-brand-30">████-██-██ ██:██ UTC</div>
      </div>
      <div className="flex flex-col gap-[12px] py-[16px] border-t border-b border-brand-40">
        <div className="text-body">██.██ SOL LOST</div>
        <div className="text-body-2">░░░░░░░░░░░░░░░░░░░░░░░░░░</div>
        <div className="flex flex-col">
          <div className="text-body-2 text-brand-20">██% EXTRACTED</div>
          <div className="text-body-2 text-brand-30">FROM A ██.██ SOL TRANSACTION</div>
        </div>
      </div>
      <button
        className="text-link text-brand-30 w-fit"
        onClick={() => {}}
      >
        View attack breakdown
      </button>
    </div>
  );
};

AttackDetailCard.Blurred = BlurredMode;

export default AttackDetailCard;
