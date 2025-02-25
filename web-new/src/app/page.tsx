import AddressMevLookup from "@/components/AddressMevLookup";

export default function Home() {
  return (
    <div>
      <h1 className="text-heading-1 text-brand-30 mb-[32px]">
        Your wallet is bleeding. I can prove it.
        <br />
        <span className="text-brand-20">
          MEV<span>?</span> is robbing you on every trade.
        </span>
      </h1>
      <AddressMevLookup />
    </div>
  );
}
