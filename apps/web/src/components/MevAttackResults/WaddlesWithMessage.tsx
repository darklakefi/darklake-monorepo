"use client";

import Image from "next/image";
import { cn } from "@/utils/common";

type WaddlesWithMessageProps = {
  solAmount: number;
  noTransactions?: boolean;
};

export default function WaddlesWithMessage({ solAmount, noTransactions }: WaddlesWithMessageProps) {
  const className = {
    wrapper: "flex-1 sm:flex flex-row justify-center lg:justify-end max-lg:items-center max-lg:gap-x-10",
    message: "text-brand-30 uppercase font-primary text-2xl text-right max-sm:text-center [&>strong]:text-brand-20",
    image: "lg:absolute right-0 bottom-0 max-sm:hidden",
  };

  if (noTransactions) {
    return (
      <div className={cn(className.wrapper, "lg:pr-[382px]")}>
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

  if (solAmount < 1) {
    return (
      <div className={cn(className.wrapper, "lg:pr-[382px]")}>
        <p className={cn(className.message, "sm:w-[274px]")}>
          Well Played!
          <br />
          <br />
          Your wallet has managed to dodge most MEV attacks.
          <br />
          <br />
          You&#39;re <strong>trading smarter than most.</strong>
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

  if (solAmount > 10) {
    return (
      <div className={cn(className.wrapper, "lg:pr-[350px]")}>
        <p className={cn(className.message, "sm:w-[210px]")}>
          Ouch!
          <br />
          <br />
          Your wallet was <strong>heavily impacted</strong> by MEV attacks
        </p>
        <Image
          className={cn(className.image, "max-lg:relative -bottom-5")}
          src="/images/image-waddles-2.png"
          alt="Waddles"
          width={318}
          height={372.29}
        />
      </div>
    );
  }

  return (
    <div className={cn(className.wrapper, "lg:pr-[234px]")}>
      <p className={cn(className.message, "sm:w-[307px]")}>
        You&#39;ve lost some value to MEV -
        <br />
        <br />
        not getting rekt, but still <strong>leaving money on the table.</strong>
      </p>
      <Image
        className={cn(className.image)}
        src="/images/image-waddles-3.png"
        alt="Waddles"
        width={200}
        height={420.64}
      />
    </div>
  );
}
