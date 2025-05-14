"use client";

import { LocalStorage } from "@/constants/storage";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import ConnectedWalletDropdown from "./ConnectedWalletDropdown";
import CheckOtherAddressModal from "./Modal/CheckOtherAddressModal";
import useLocalStorage from "use-local-storage";

const Header = () => {
  const [lookupAddress] = useLocalStorage(LocalStorage.LOOKUP_ADDRESS, null);

  const pathname = usePathname();
  const isResultsPage = pathname.includes("/results/");

  const [isOpenCheckOtherAddressModal, setIsOpenCheckOtherAddressModal] = useState(false);

  return (
    <header className="flex flex-row justify-between items-center z-20 py-16">
      <div className="flex items-center justify-between gap-x-[11px]">
        <Link href="/" title="Darklake.fi" className="active:opacity-80">
          <Image src="/images/logo-h-darklake-beta.svg" alt="darklake logo" height={24} width={213} />
        </Link>
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
