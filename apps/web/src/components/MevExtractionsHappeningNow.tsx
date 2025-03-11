import MevExtractionCard from "./MevExtractionCard";
interface MevExtractionsHappeningNowProps {
  drainToday: {
    amountSol: number;
    amountUsd: number;
  };
  weekTotal: {
    amountSol: number;
    amountUsd: number;
  };
  attacksToday: {
    attacksTodayCount: number;
    attacksWeekCount: number;
  };
}

export default function MevExtractionsHappeningNow(props: MevExtractionsHappeningNowProps) {
  const { drainToday, weekTotal, attacksToday } = props;
  return (
    <div>
      <h2 className="text-3xl uppercase text-brand-30 font-primary mb-4">
        Mev Extraction <span className="text-brand-20">Happening Now</span>
      </h2>
      <div className="flex gap-4 flex-col md:flex-row">
        <MevExtractionCard>
          <h3 className="mb-4 text-lg text-brand-30">Today&apos;s Drain</h3>
          <span className="text-3xl">{drainToday.amountSol} SOL</span>
          <span className="text-lg text-brand-30">
            {drainToday.amountUsd.toLocaleString("en-US", {
              style: "currency",
              currency: "USD",
            })}{" "}
            extracted
          </span>
        </MevExtractionCard>
        <MevExtractionCard>
          <h3 className="mb-4 text-lg text-brand-30">7D Total MEV</h3>
          <span className="text-3xl">{weekTotal.amountSol} SOL</span>
          <span className="text-lg text-brand-30">
            {weekTotal.amountUsd.toLocaleString("en-US", {
              style: "currency",
              currency: "USD",
            })}{" "}
            extracted
          </span>
        </MevExtractionCard>
        <MevExtractionCard>
          <h3 className="mb-4 text-lg text-brand-30">Attacks Today</h3>
          <span className="text-3xl">{attacksToday.attacksTodayCount}</span>
          <span className="text-lg text-brand-30">{attacksToday.attacksWeekCount} this week</span>
        </MevExtractionCard>
      </div>
    </div>
  );
}
