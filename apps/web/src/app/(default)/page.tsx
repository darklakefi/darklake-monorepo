import AddressMevLookup from "@/components/AddressMevLookup";
import WhatIsMevInlineButton from "@/components/Button/WhatIsMevInlineButton";
import MevExtractionsLiveDashboard from "@/components/MevExtractionsLiveDashboard";

export default function Home() {
  return (
    <div>
      <div className="pt-[64px]">
        <h1 className="font-primary text-3xl leading-7 text-brand-30 mb-8">
          Your wallet is bleeding. I can prove it.
          <br />
          <span className="text-brand-20">
            MEV <WhatIsMevInlineButton /> is robbing you on every trade.
          </span>
        </h1>

        <AddressMevLookup />
      </div>

      <div className="pt-[128px]">
        <MevExtractionsLiveDashboard />
      </div>
    </div>
  );
}
