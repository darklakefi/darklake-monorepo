import Link from "next/link";
import Image from "next/image";
import ConnectedWalletDropdown from "./ConnectedWalletDropdown";

const Header = () => {
  return (
    <header className="flex flex-row justify-between items-center pb-[64px]">
      <Link href="/" title="Darklake.fi" className="active:opacity-80">
        <Image src="/images/logo-h-darklake.png" alt="darklage logo" height={24} width={147} />
      </Link>
      <ConnectedWalletDropdown currentWalletAddress="So11JSgBGXtPuLPjQiKy3u5CVuRXVMFnKuUELA2JRNu9x" />
    </header>
  );
};

export default Header;
