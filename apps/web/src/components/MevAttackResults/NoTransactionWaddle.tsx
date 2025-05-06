"use client";

import Image from "next/image";
import { cn } from "@/utils/common";
import AddressMevLookup from "../AddressMevLookup";

export default function NoTransactionWaddle() {
  const className = {
    wrapper: "flex flex-row gap-x-10 items-center max-sm:mb-20",
    image: "max-sm:hidden",
  };

  return (
    <div className={cn(className.wrapper)}>
      <div className="flex items-center justify-between select-none w-full">
        <div className="flex-1">
          <h1 className="font-primary text-3xl leading-7 text-brand-30 mb-8 md:min-w-2xl">
            <span className="text-brand-20">Try another one chief</span>
            <br />
            <div className="md:max-w-sm">You haven&apos;t made any transactions on Solana with this wallet.</div>
          </h1>
          <AddressMevLookup />
        </div>
        <div className={cn("flex items-center justify-end flex-1", className.image)}>
          <Image src="/images/waddles/pose6.png" alt="Waddles" width={350} height={477} />
        </div>
      </div>
    </div>
  );
}
