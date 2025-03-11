import { twMerge } from "tailwind-merge";
interface ConnectedWalletDropdownProps {
  currentWalletAddress: string;
}

export default function ConnectedWalletDropdown(props: ConnectedWalletDropdownProps) {
  const { currentWalletAddress } = props;

  const displayedCurrentWalletAddress = `${currentWalletAddress.slice(0, 5)}...${currentWalletAddress.slice(-6)}`;

  const wrapperPseudoElementClassName = "after:content-['▼'] after:absolute after:right-0 after:pointer-events-none";

  return (
    <div className={twMerge("flex items-center gap-2 relative text-lg", wrapperPseudoElementClassName)}>
      <select value={currentWalletAddress} className="bg-transparent uppercase appearance-none pr-4">
        <option value={currentWalletAddress}>{displayedCurrentWalletAddress}</option>
      </select>
    </div>
  );
}
