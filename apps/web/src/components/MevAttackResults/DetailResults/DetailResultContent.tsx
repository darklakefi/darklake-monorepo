import { useMemo, useState } from "react";
import Tabs from "@/components/Tabs";
import SummaryTab from "./SummaryTab";
import AttackDetailsTab from "./AttackDetailsTab";
import useGetTopAttacks from "@/hooks/api/useGetTopAttacks";
import useGetAttackList from "@/hooks/api/useGetAttackList";
import useGetTotalExtracted from "@/hooks/api/useGetTotalExtracted";
import { Popover, PopoverButton, PopoverPanel } from "@headlessui/react";
import { cn } from "@/utils/common";
import { MevAttacksOrderBy } from "@/types/Mev";
import { SortDirection } from "@/types/Pagination";

const TAB_NAMES = [
  {
    text: "[SUMMARY]",
  },
  {
    text: "[ATTACKS]",
  },
];

const sortOptions = [
  {
    title: "OLDEST FIRST",
    orderBy: MevAttacksOrderBy.DATE,
    direction: SortDirection.ASC,
  },
  {
    title: "NEWEST FIRST",
    orderBy: MevAttacksOrderBy.DATE,
    direction: SortDirection.DESC,
  },
  {
    title: "LARGEST LOSS",
    orderBy: MevAttacksOrderBy.AMOUNT_DRAINED,
    direction: SortDirection.DESC,
  },
  {
    title: "SMALLEST LOSS",
    orderBy: MevAttacksOrderBy.AMOUNT_DRAINED,
    direction: SortDirection.ASC,
  },
];

export default function DetailResultContent({ address }: { address: string }) {
  const [activeTab, setActiveTab] = useState(0);

  const { data: topAttackData } = useGetTopAttacks(address);
  const { data: mevAttacks, hasMore, loadMore, isLoadingMore, orderBy, direction, setSort } = useGetAttackList(address);
  const { data: totalExtracted } = useGetTotalExtracted(address);

  const activeSortOption = useMemo(() => {
    return sortOptions.find((option) => option.orderBy === orderBy && option.direction === direction);
  }, [direction, orderBy]);

  return (
    <div className="">
      <div className="flex flex-row flex-wrap justify-between items-center">
        <Tabs
          tabs={TAB_NAMES.map((tab) => tab.text)}
          onChange={setActiveTab}
          wrapperClassName="py-4 gap-6"
          activeTab={activeTab}
        />
        {activeTab === 1 && (
          <Popover className="">
            {({ open }) => (
              <>
                <PopoverButton as="div" className={cn(open ? "opacity-70" : "opacity-100", "cursor-pointer")}>
                  <div className="flex flex-row items-center gap-2 text-[#1A9A56] p-2">
                    <button className="text-[18px] uppercase">sort by: {activeSortOption?.title}</button>
                    {open ? <i className="hn hn-angle-up text-4"></i> : <i className="hn hn-angle-down text-4"></i>}
                  </div>
                </PopoverButton>
                <PopoverPanel anchor="bottom" className="z-[1] bg-brand-70 p-2 shadow-3xl shadow-brand-80">
                  {({ close }) => (
                    <div className="flex flex-col p-2 cursor-pointer">
                      {sortOptions.map((option) => (
                        <div
                          key={`list-sort-${option.direction}-${option.orderBy}`}
                          onClick={() => {
                            setSort(option.orderBy, option.direction);
                            close();
                          }}
                          className={cn(
                            "flex justify-center items-center",
                            "text-[18px] uppercase gap-2 px-2",
                            "hover:bg-brand-50",
                            option.orderBy === activeSortOption?.orderBy &&
                              option.direction === activeSortOption?.direction
                              ? "bg-brand-40"
                              : "",
                          )}
                        >
                          <p>{option.title}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </PopoverPanel>
              </>
            )}
          </Popover>
        )}
      </div>

      <div className={activeTab === 0 ? "block" : "hidden"}>
        <SummaryTab
          mevAttacks={topAttackData.result}
          totalAttacks={topAttackData.total}
          totalExtracted={totalExtracted?.data}
        />
      </div>
      <div className={activeTab === 1 ? "block" : "hidden"}>
        <AttackDetailsTab
          mevAttacks={mevAttacks}
          hasMore={hasMore}
          onLoadMore={loadMore}
          isLoadingMore={isLoadingMore}
        />
      </div>
    </div>
  );
}
