import { MevTransaction, MevAttack, MevAttackSwapType } from "@/types/Mev";
import BrutalMevExtractionsLiveEvidence from "../BrutalMevExtractionsLiveEvidence";
import MevExtractionsHappeningNow from "../MevExtractionsHappeningNow";
import MevExtractionsWrapper from "../MevExtractionsWrapper";

const mockMevAttackTransaction: MevTransaction = {
  address: "someAddress",
  signature: "someSignature",
};

const mockMevAttack: MevAttack = {
  swapType: MevAttackSwapType.BUY,
  timestamp: +new Date("2024-03-26"),
  tokenName: "TRUMP",
  solAmount: {
    sent: 100,
    lost: 30,
  },
  transactions: {
    frontRun: mockMevAttackTransaction,
    victim: mockMevAttackTransaction,
    backRun: mockMevAttackTransaction,
  },
};

export default function MevExtractionsLiveDashboard() {
  return (
    <div className="">
      <MevExtractionsWrapper>
        <div className="flex flex-col gap-[80px]">
          <MevExtractionsHappeningNow
            drainToday={{
              amountSol: 1,
              amountUsd: 11,
            }}
            weekTotal={{
              amountSol: 1,
              amountUsd: 1,
            }}
            attacksToday={{
              attacksTodayCount: 1,
              attacksWeekCount: 1,
            }}
          />

          <BrutalMevExtractionsLiveEvidence attacks={[mockMevAttack, mockMevAttack, mockMevAttack]} />
        </div>
      </MevExtractionsWrapper>
    </div>
  );
}
