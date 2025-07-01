"use client";

import { LocalStorage } from "@/constants/storage";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import ConnectedWalletDropdown from "./ConnectedWalletDropdown";
import CheckOtherAddressModal from "./Modal/CheckOtherAddressModal";
import useLocalStorage from "use-local-storage";
import { cn } from "@/utils/common";

const Header = () => {
  const [lookupAddress] = useLocalStorage(LocalStorage.LOOKUP_ADDRESS, null);

  const pathname = usePathname();
  const isResultsPage = pathname.includes("/results/");

  const [isOpenCheckOtherAddressModal, setIsOpenCheckOtherAddressModal] = useState(false);

  return (
    <header className="flex flex-row justify-between items-center z-20 py-16">
      <div>
        <div className="flex items-center justify-between gap-x-[11px]">
          <Link href="/" title="Darklake.fi" className="active:opacity-80">
            <Image src="/images/logo-h-darklake-beta.svg" alt="darklake logo" height={24} width={213} />
          </Link>
        </div>
      </div>
      <div className="flex items-center justify-between gap-x-[11px]">
        <div className="flex items-center justify-between gap-x-[11px]">
          <Link
            className={cn(
              "font-secondary text-lg leading-6 tracking-normal uppercase",
              "bg-brand-10 text-brand-70 px-3 py-1 hover:bg-brand-20",
              "disabled:opacity-50 focus:outline-none active:ring-1 active:bg-brand-10 active:ring-brand-10",
              "active:ring-offset-2 active:ring-offset-black ml-3 flex-shrink-0",
              "max-md:hidden",
            )}
            href={process.env.NEXT_PUBLIC_BLOG_URL}
            title="Learn More"
            target="_blank"
          >
            Learn More
          </Link>
        </div>

        {isResultsPage && lookupAddress ? (
          <ConnectedWalletDropdown
            currentWalletAddress={lookupAddress}
            onOpenCheckOtherAddressModal={() => setIsOpenCheckOtherAddressModal(true)}
          />
        ) : null}
      </div>
      <CheckOtherAddressModal
        isOpen={isOpenCheckOtherAddressModal}
        onClose={() => setIsOpenCheckOtherAddressModal(false)}
      />
    </header>
  );
};

export default Header;
