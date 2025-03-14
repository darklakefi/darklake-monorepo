import { truncate } from "@/utils/common";
import { twMerge } from "tailwind-merge";
interface ConnectedWalletDropdownProps {
  currentWalletAddress: string;
}

export default function ConnectedWalletDropdown(props: ConnectedWalletDropdownProps) {
  const { currentWalletAddress } = props;

  return (
    <div
      className={twMerge(
        "flex items-center justify-center gap-4 relative text-lg text-brand-30",
        "after:content-['▼'] after:absolute after:right-0 after:pointer-events-none",
      )}
    >
      <i className="hn hn-wallet text-2xl leading-none"></i>
      <select value={currentWalletAddress} className="bg-transparent uppercase appearance-none pr-4 h-6 leading-6">
        <option value={currentWalletAddress} className="p-0">
          {truncate(currentWalletAddress)}
        </option>
      </select>
    </div>
  );
}
