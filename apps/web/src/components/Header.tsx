"use client";

import Link from "next/link";
import Image from "next/image";
import ConnectedWalletDropdown from "./ConnectedWalletDropdown";
import useLocalStorage from "@/hooks/useLocalStorage";
import { LocalStorage } from "@/constants/storage";
import { usePathname } from "next/navigation";
import { useState } from "react";
import CheckOtherAddressModal from "./Modal/CheckOtherAddressModal";

const Header = () => {
  const [lookupAddress] = useLocalStorage<string | null>(LocalStorage.LOOKUP_ADDRESS, null);

  const pathname = usePathname();
  const isResultsPage = pathname.includes("/results/");

  const [isOpenCheckOtherAddressModal, setIsOpenCheckOtherAddressModal] = useState(false);

  return (
    <header className="flex flex-row justify-between items-center z-20">
      <div className="flex items-center justify-between gap-x-[11px]">
        <Link href="/" title="Darklake.fi" className="active:opacity-80">
          <Image src="/images/logo-h-darklake.png" alt="darklake logo" height={24} width={147} />
        </Link>
        <p className="font-primary text-lg text-brand-30 select-none">BETA</p>
      </div>
      {isResultsPage && lookupAddress ? (
        <ConnectedWalletDropdown
          currentWalletAddress={lookupAddress}
          onOpenCheckOtherAddressModal={() => setIsOpenCheckOtherAddressModal(true)}
        />
      ) : null}

      <CheckOtherAddressModal
        isOpen={isOpenCheckOtherAddressModal}
        onClose={() => setIsOpenCheckOtherAddressModal(false)}
      />
    </header>
  );
};

export default Header;
