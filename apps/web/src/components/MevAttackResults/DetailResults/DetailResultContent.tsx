import Tabs from "@/components/Tabs";
import useGetAttackList from "@/hooks/api/useGetAttackList";
import useGetTopAttacks from "@/hooks/api/useGetTopAttacks";
import useGetTotalExtracted from "@/hooks/api/useGetTotalExtracted";
import { MevAttacksOrderBy } from "@/types/Mev";
import { SortDirection } from "@/types/Pagination";
import { cn } from "@/utils/common";
import { Popover, PopoverButton, PopoverPanel } from "@headlessui/react";
import { useMemo, useState } from "react";
import AttackDetailsTab from "./AttackDetailsTab";
import SummaryTab from "./SummaryTab";

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
    title: "NEWEST FIRST",
    orderBy: MevAttacksOrderBy.DATE,
    direction: SortDirection.DESC,
  },
  {
    title: "OLDEST FIRST",
    orderBy: MevAttacksOrderBy.DATE,
    direction: SortDirection.ASC,
  },
  {
    title: "LARGEST FIRST",
    orderBy: MevAttacksOrderBy.AMOUNT_DRAINED,
    direction: SortDirection.DESC,
  },
  {
    title: "SMALLEST FIRST",
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
                <PopoverButton as="div" className={cn(open && "bg-brand-80", "cursor-pointer hover:opacity-70")}>
                  <div className="flex flex-row items-center gap-2 text-[#1A9A56] p-2">
                    <button className="text-lg uppercase">sort by: {activeSortOption?.title}</button>
                    {open ? <i className="hn hn-angle-up text-lg"></i> : <i className="hn hn-angle-down text-lg"></i>}
                  </div>
                </PopoverButton>
                <PopoverPanel anchor="bottom" className="z-[1] bg-brand-80 shadow-md shadow-[#010F06] mt-1">
                  {({ close }) => (
                    <div className="flex flex-col cursor-pointer">
                      {sortOptions.map((option) => {
                        const isActive =
                          option.orderBy === activeSortOption?.orderBy &&
                          option.direction === activeSortOption?.direction;
                        return (
                          <div
                            key={`list-sort-${option.direction}-${option.orderBy}`}
                            onClick={() => {
                              setSort(option.orderBy, option.direction);
                              close();
                            }}
                            className={cn(
                              "flex justify-between items-center px-3 py-2 w-52",
                              "text-lg uppercase",
                              "hover:bg-brand-50",
                              isActive ? "text-brand-20" : "text-brand-30",
                            )}
                          >
                            <p>{option.title}</p>
                            {isActive && <i className="hn hn-check text-lg"></i>}
                          </div>
                        );
                      })}
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
