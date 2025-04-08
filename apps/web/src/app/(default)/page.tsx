import AddressMevLookup from "@/components/AddressMevLookup";
import AddressMevLookupWrapper from "@/components/AddressMevLookupWrapper";
import WhatIsMevInlineButton from "@/components/Button/WhatIsMevInlineButton";
import MevExtractionsLiveDashboard from "@/components/MevExtractionsLiveDashboard";

export default function Home() {
  return (
    <div>
      <AddressMevLookupWrapper>
        <h1 className="font-primary text-3xl leading-7 text-brand-30 mb-8">
          Your wallet is bleeding. I can prove it.
          <br />
          <span className="text-brand-20">
            MEV <WhatIsMevInlineButton /> is robbing you on every trade.
          </span>
        </h1>

        <AddressMevLookup />
      </AddressMevLookupWrapper>

      <div className="pt-32 md:pt-20 max-md:pt-10">
        <MevExtractionsLiveDashboard />
      </div>
    </div>
  );
}
