import Image from "next/image";
export default function MEVCheckerAnalyzingPage() {
  return (
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <h1 className="font-primary text-3xl leading-7 text-brand-30 mb-8">
          Analyzing The Blocks
          <br />
          <span className="text-brand-20">This might take a few seconds.</span>
        </h1>
      </div>
      <div className="flex items-center justify-end flex-1">
        <Image src="/images/waddles/pose6.png" alt="Waddles" width={350} height={477} />
      </div>
    </div>
  );
}
