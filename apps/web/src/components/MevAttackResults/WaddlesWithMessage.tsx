"use client";

import { cn } from "@/utils/common";
import Image from "next/image";

type WaddlesWithMessageProps = {
  solAmount: number;
};

export default function WaddlesWithMessage({ solAmount }: WaddlesWithMessageProps) {
  const className = {
    wrapper: "flex-1 sm:flex flex-row items-center lg:justify-end max-lg:items-center max-lg:gap-x-10 gap-6",
    message: "flex-1 text-brand-30 uppercase font-primary text-2xl text-right max-sm:text-center max-w-80 mx-auto",
    image: "max-sm:hidden self-end",
  };

  if (solAmount < 1) {
    return (
      <div className={cn(className.wrapper, "")}>
        <p className={cn(className.message, "")}>
          Well Played!
          <br />
          <br />
          Your wallet has managed to dodge most MEV attacks.
          <br />
          <br />
          You&#39;re <span className="text-brand-20">trading smarter than most.</span>
        </p>
        <Image
          className={className.image}
          src="/images/image-waddles-4.png"
          alt="Waddles"
          width={349.18}
          height={341}
        />
      </div>
    );
  }

  if (solAmount < 10) {
    return (
      <div className={className.wrapper}>
        <p className={className.message}>
          Ouch!
          <br />
          <br />
          Your wallet was <span className="text-brand-20">heavily impacted</span> by MEV attacks
        </p>
        <Image
          className={cn(className.image, "translate-y-6")}
          src="/images/image-waddles-2.png"
          alt="Waddles"
          width={318}
          height={372.29}
        />
      </div>
    );
  }

  return (
    <div className={className.wrapper}>
      <p className={className.message}>
        You&#39;ve lost some value to MEV -
        <br />
        <br />
        not getting rekt, but still <span className="text-brand-20">leaving money on the table.</span>
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
