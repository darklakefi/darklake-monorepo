import AttackDetailCard from "./AttackDetailCard";
import SummaryCard from "./SummaryCard";

const SummaryTab = () => {
  return (
    <div className="flex flex-col gap-[16px]">
      <div className="flex flex-row gap-[16px]">
        <div className="flex-1">
          <SummaryCard
            title="Total Extracted"
            content={
              <div className="flex flex-col gap-[2px] py-[1px]">
                <div className="text-body text-brand-20">16.32 SOL</div>
                <div className="text-body-2 text-brand-30">2,774.32 USDC</div>
              </div>
            }
          />
        </div>
        <div className="flex-1">
          <SummaryCard
            title="Confirmed Attack"
            content={
              <div className="flex flex-col gap-[2px] py-[1px]">
                <div className="text-body text-brand-20">47</div>
              </div>
            }
          />
        </div>
      </div>
      <div className="flex flex-row flex-wrap gap-[16px]">
        <div className="flex-1">
          <AttackDetailCard index={1} />
        </div>
        <div className="flex-1">
          <AttackDetailCard index={2} />
        </div>
        <div className="flex-1">
          <AttackDetailCard index={3} />
        </div>
      </div>
    </div>
  );
};

const BlurredMode = () => {
  return (
    <div className="flex flex-col gap-[16px]">
      <div className="flex flex-row gap-[16px]">
        <div className="flex-1">
          <SummaryCard
            title="Total Extracted"
            content={
              <div className="flex flex-col gap-[2px] py-[1px]">
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
              <div className="flex flex-col gap-[2px] py-[1px]">
                <div className="text-body text-brand-20">██</div>
              </div>
            }
          />
        </div>
      </div>
      <div className="flex flex-row flex-wrap gap-[16px]">
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
