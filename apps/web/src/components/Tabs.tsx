"use client";

import { cn } from "@/utils/common";
import { useState } from "react";

interface TabsProps {
  tabs: string[];
  onChange?: (tabIndex: number) => void;
  rounded?: boolean;
  fullWidth?: boolean;
  wrapperClassName?: string;
  tabClassName?: string;
  activeTab?: number;
}

export default function Tabs({ tabs, onChange, wrapperClassName, tabClassName, activeTab: fixedActiveTab }: TabsProps) {
  const [activeTab, setActiveTab] = useState(0);

  const onTabClick = (tabIndex: number) => {
    setActiveTab(tabIndex);
    if (onChange) {
      onChange(tabIndex);
    }
  };

  return (
    <div className={cn("flex flex-row items-center", wrapperClassName)}>
      {tabs.map((tabTitle, index) => {
        const isActiveTab = (fixedActiveTab ?? activeTab) === index;

        return (
          <button
            type="button"
            key={tabTitle}
            onClick={() => onTabClick(index)}
            className={cn(
              "text-body-2 p-[8px]",
              "cursor-pointer select-none",
              !isActiveTab && "text-brand-30",
              isActiveTab && "bg-brand-60 text-brand-20",
              tabClassName,
            )}
          >
            {tabTitle}
          </button>
        );
      })}
    </div>
  );
}
