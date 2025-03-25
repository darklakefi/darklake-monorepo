import { truncate } from "@/utils/common";
import { format } from "date-fns";
import Image from "next/image";
import { cn } from "@/utils/common";

interface DetailResultHeaderProps {
  address: string;
  processedTime: Date;
  isSignedWithTwitter: boolean;
}

export default function DetailResultHeader({ address, processedTime, isSignedWithTwitter }: DetailResultHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-row max-sm:flex-col max-sm:items-center justify-between",
        "border-b border-brand-50 pb-[16px]",
      )}
    >
      <div className="flex flex-col">
        <div className="text-body-2 text-brand-20 max-sm:text-[16px]">== CONFIDENTIAL: MEV INCIDENT REPORT ==</div>
        <div className="flex flex-row flex-wrap gap-[12xp] text-body-2 text-brand-30">
          <div> VICTIM WALLET: </div>
          <div>{truncate(address)}</div>
        </div>
        <div className="flex flex-row flex-wrap gap-[12xp] text-body-2 text-brand-30">
          <div>CASE PROCESSED: </div>
          <div>{format(processedTime, "yyyy-MM-dd HH:mm 'UTC'")}</div>
        </div>
      </div>
      {!isSignedWithTwitter && <i className="relative hn hn-lock-alt-solid text-[64px] text-brand-50" />}
      {isSignedWithTwitter && (
        <Image
          src="/images/darklake-text.svg"
          alt="darklake-text"
          height={35}
          width={331}
          className="relative max-sm:hidden"
        />
      )}
    </div>
  );
}
