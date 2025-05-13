"use client";

import { cn, truncate } from "@/utils/common";
import { Popover, PopoverButton, PopoverPanel } from "@headlessui/react";

interface ConnectedWalletDropdownProps {
  currentWalletAddress: string;
  onOpenCheckOtherAddressModal?: () => void;
}

export default function ConnectedWalletDropdown(props: ConnectedWalletDropdownProps) {
  const { currentWalletAddress, onOpenCheckOtherAddressModal } = props;

  return (
    <Popover className="">
      {({ open }) => (
        <>
          <PopoverButton
            as="div"
            className={cn(
              "flex items-center justify-center gap-4 relative text-lg text-brand-30 cursor-pointer",
              open ? "opacity-70" : "opacity-100",
            )}
          >
            <i className="hn hn-wallet text-2xl leading-none"></i>
            <div className="flex flex-row items-center gap-2">
              {truncate(currentWalletAddress, 6)}
              {open ? <i className="hn hn-angle-up text-4"></i> : <i className="hn hn-angle-down text-4"></i>}
            </div>
          </PopoverButton>
          <PopoverPanel anchor="bottom" className="z-30 mt-3 bg-brand-60 p-2 shadow-md shadow-brand-80">
            {({ close }) => (
              <div
                className="uppercase text-lg leading-6 tracking-normal text-brand-30 cursor-pointer"
                onClick={() => {
                  close();
                  onOpenCheckOtherAddressModal?.();
                }}
              >
                Check other address
              </div>
            )}
          </PopoverPanel>
        </>
      )}
    </Popover>
  );
}
