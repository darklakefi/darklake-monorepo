import CheckMevAttackWrapper from "@/components/MevAttackResults/CheckMevAttackWrapper";
import Image from "next/image";
export function MevAttackLoadingScreen() {
  return (
    <CheckMevAttackWrapper>
      <div className="flex items-center justify-between select-none">
        <div className="flex-1">
          <h1 className="font-primary text-3xl leading-7 text-brand-30 mb-8">
            Analyzing The Blocks
            <br />
            <span className="text-brand-20">
              This might take a few seconds
              <span className="animate-dots"></span>
            </span>
          </h1>
        </div>
        <div className="flex items-center justify-end flex-1">
          <Image src="/images/waddles/pose6.png" alt="Waddles" width={350} height={477} />
        </div>
      </div>
    </CheckMevAttackWrapper>
  );
}
