"use client";

import Image from "next/image";
import { cn } from "@/utils/common";

export default function NoTransactionWaddle() {
  const className = {
    wrapper: "flex flex-row justify-center gap-x-10 items-center max-sm:mb-20",
    message: "text-brand-30 uppercase font-primary text-2xl text-right max-sm:text-center [&>strong]:text-brand-20",
    image: "max-sm:hidden",
  };

  return (
    <div className={cn(className.wrapper)}>
      <p className={cn(className.message, "sm:w-[274px]")}>
        Try another one chief
        <br />
        <br />
        You <strong>haven&apos;t made any transactions</strong> on Solana with this wallet.
      </p>
      <Image
        className={cn(className.image)}
        src="/images/image-waddles-4.png"
        alt="Waddles"
        width={349.18}
        height={341}
      />
    </div>
  );
}
