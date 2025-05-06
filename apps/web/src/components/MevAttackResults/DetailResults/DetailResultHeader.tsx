import { cn, truncate } from "@/utils/common";
import { format } from "date-fns";
import Image from "next/image";

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
        "border-b border-brand-50 pb-4",
      )}
    >
      <div className="flex flex-col">
        <div className="text-lg leading-6 text-brand-20 max-sm:text-4">== CONFIDENTIAL: MEV INCIDENT REPORT ==</div>
        <div className="flex flex-row flex-wrap gap-3 text-lg leading-6 text-brand-30">
          <div>VICTIM WALLET:&nbsp;</div>
          <div className="uppercase">{truncate(address)}</div>
        </div>
        <div className="flex flex-row flex-wrap gap-3 text-lg leading-6 text-brand-30">
          <div>CASE PROCESSED:&nbsp;</div>
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
