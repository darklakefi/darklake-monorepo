import Link from "next/link";
import Image from "next/image";
import ConnectedWalletDropdown from "./ConnectedWalletDropdown";

const Header = () => {
  // TODO: wire with added/connected wallet
  const currentWalletAddress = null;
  return (
    <header className="flex flex-row justify-between items-center pb-[64px]">
      <Link href="/" title="Darklake.fi" className="active:opacity-80">
        <Image src="/images/logo-h-darklake.png" alt="darklage logo" height={24} width={147} />
      </Link>
      {currentWalletAddress ? <ConnectedWalletDropdown currentWalletAddress={currentWalletAddress} /> : null}
    </header>
  );
};

export default Header;
