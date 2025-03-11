import { twMerge } from "tailwind-merge";
import { Wallet } from "./Icons";
interface ConnectedWalletDropdownProps {
  currentWalletAddress: string;
}

export default function ConnectedWalletDropdown(props: ConnectedWalletDropdownProps) {
  const { currentWalletAddress } = props;

  const displayedCurrentWalletAddress = `${currentWalletAddress.slice(0, 5)}...${currentWalletAddress.slice(-6)}`;

  const wrapperPseudoElementClassName = "after:content-['▼'] after:absolute after:right-0 after:pointer-events-none";

  return (
    <div
      className={twMerge(
        "flex items-center justify-center gap-4 relative text-lg text-brand-30",
        wrapperPseudoElementClassName,
      )}
    >
      <Wallet className="size-6" />
      <select value={currentWalletAddress} className="bg-transparent uppercase appearance-none pr-4 h-6 leading-6">
        <option value={currentWalletAddress} className="p-0">
          {displayedCurrentWalletAddress}
        </option>
      </select>
    </div>
  );
}
