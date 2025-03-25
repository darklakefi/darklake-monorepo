import { useState } from "react";
import Tabs from "@/components/Tabs";
import SummaryTab from "./SummaryTab";
import AttackDetailsTab from "./AttackDetailsTab";

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
        <SummaryTab />
      </div>
      <div className={activeTab === 1 ? "block" : "hidden"}>
        <AttackDetailsTab />
      </div>
    </div>
  );
}
