import { useState } from "react";
import Tabs from "@/components/Tabs";
import SummaryTab from "./SummaryTab";
import AttackDetailsTab from "./AttackDetailsTab";
import { MevAttack, MevAttackSwapType, MevTransaction } from "@/types/Mev";

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

const TAB_NAMES = [
  {
    text: "[SUMMARY]",
  },
  {
    text: "[ATTACKS]",
  },
];

export default function DetailResultContent() {
  const [activeTab, setActiveTab] = useState(0);

  const [attacks, setAttacks] = useState<MevAttack[]>([
    mockMevAttack,
    mockMevAttack,
    mockMevAttack,
    mockMevAttack,
    mockMevAttack,
    mockMevAttack,
  ]);
  const [isHasMore] = useState(true);
  const handleLoadMore = () => {
    setAttacks([...attacks, mockMevAttack, mockMevAttack, mockMevAttack]);
  };

  return (
    <div className="">
      <div className="flex flex-row flex-wrap justify-between items-center">
        <Tabs
          tabs={TAB_NAMES.map((tab) => tab.text)}
          onChange={setActiveTab}
          wrapperClassName="py-[16px] gap-[24px]"
          activeTab={activeTab}
        />
        {activeTab === 1 && (
          <div className="flex flex-row items-center gap-[8px] text-[#1A9A56] p-[8px]">
            <button className="text-[18px] uppercase">sort by: Date</button>
            <i className="hn hn-angle-down text-[16px]"></i>
          </div>
        )}
      </div>

      <div className={activeTab === 0 ? "block" : "hidden"}>
        <SummaryTab mevAttacks={[mockMevAttack, mockMevAttack, mockMevAttack]} />
      </div>
      <div className={activeTab === 1 ? "block" : "hidden"}>
        <AttackDetailsTab mevAttacks={attacks} hasMore={isHasMore} onLoadMore={handleLoadMore} />
      </div>
    </div>
  );
}
