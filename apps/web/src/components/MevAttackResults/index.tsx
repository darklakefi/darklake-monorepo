import TotalExtracted from "@/components/MevAttackResults/TotalExtracted";
import WaddlesWithMessage from "@/components/MevAttackResults/WaddlesWithMessage";
import DetailResults from "./DetailResults";

export default function MevAttackResults({ address }: { address: string }) {
  return (
    <div className="relative">
      <div className="lg:flex flex-row space-between items-center relative lg:pb-20 max-sm:mb-20">
        <div className="lg:w-[400px] max-lg:mb-20">
          <TotalExtracted solAmount={177.12} usdAmount={2700.69} address={address} />
        </div>
        <WaddlesWithMessage solAmount={17.12} />
      </div>
      <div className="bg-brand-70 p-6 shadow-[12px_12px_0px_0px] shadow-brand-80">
        <DetailResults address={address} />
      </div>
    </div>
  );
}
