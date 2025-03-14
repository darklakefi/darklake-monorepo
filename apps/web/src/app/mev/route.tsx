import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { notFound } from "next/navigation";
import { formatMoney } from "@/utils/number";
import { cn } from "@/utils/common";

const loadFont = async (filename: string) => {
  const loaded = await fetch(new URL(`${process.env.NEXT_PUBLIC_HOSTNAME}/fonts/${filename}`));
  return loaded.arrayBuffer();
};

const WaddlesMessageText = ({ solAmount }: { solAmount: number }) => {
  const wrapperClassName = "m-0 mt-[80px] text-right text-[38px] leading-[42px] w-[400px] flex flex-col items-end";
  const textClassName = "m-0 text-[#1A9A56]";

  if (solAmount < 1) {
    return (
      <div tw={cn(wrapperClassName, "mt-[60px]")}>
        <p tw={cn(textClassName, "mb-6")}>Well Played!</p>
        <p tw={cn(textClassName, "mb-6")}>Your wallet has managed to dodge most MEV attacks.</p>
        <p tw={textClassName}>
          You&#39;re <span tw="text-[#35D688] ml-6">trading</span>
        </p>
        <p tw={cn(textClassName, "text-[#35D688]")}>smarter than most.</p>
      </div>
    );
  }

  if (solAmount < 10) {
    return (
      <div tw={wrapperClassName}>
        <p tw={cn(textClassName, "mb-10")}>Ouch!</p>
        <p tw={textClassName}>Your wallet was</p>
        <p tw={cn(textClassName, "text-[#35D688]")}>heavily impacted</p>
        <p tw={textClassName}>by MEV attacks</p>
      </div>
    );
  }

  return (
    <div tw={wrapperClassName}>
      <p tw={cn(textClassName, "mb-10")}>You&#39;ve lost some value to MEV -</p>
      <p tw={textClassName}>not getting rekt,</p>
      <p tw={textClassName}>
        but still <span tw="text-[#35D688] ml-6">leaving</span>
      </p>
      <p tw={cn(textClassName, "text-[#35D688]")}> money on the table.</p>
    </div>
  );
};

// note: this does not load custom tailwind styles
export async function GET(request: NextRequest) {
  const address = request.nextUrl.searchParams.get("share");
  if (!address) {
    notFound();
  }

  const fontBitsumishi = await loadFont("bitsumishi.ttf");
  const fontClassicConsoleNeue = await loadFont("classic-console-neue.ttf");

  // TODO: this to be replaced with actual data from API
  const data = {
    solAmount: 17.69,
    usdAmount: 2774.32,
  };

  const solAmountFormatted = formatMoney(data.solAmount);
  const solAmountParts = solAmountFormatted.split(".");
  return new ImageResponse(
    (
      <div tw="flex flex-col w-full h-full items-center justify-center" style={{ fontFamily: "Bitsumishi" }}>
        <div
          tw="rounded-[41px] bg-[#062916] p-30 w-full h-full flex flex-col relative overflow-hidden"
          style={{
            backgroundImage: `url(${process.env.NEXT_PUBLIC_HOSTNAME}/images/bg-twitter-share-card.jpg)`,
          }}
        >
          <img
            src={`${process.env.NEXT_PUBLIC_HOSTNAME}/images/logo-h-darklake.png`}
            alt="logo"
            width={293.96}
            height={48}
            tw="mb-30"
          />
          <div
            tw={cn(
              "bg-[#2CFF8E] flex flex-col p-[30px] w-[400px]",
              "text-[#1A9A56] text-[35px] leading-[37.5px] uppercase",
            )}
          >
            <p tw="m-0">Total extracted</p>
            <p tw="text-[#041C0F] h-[110px] flex flex-row items-end m-0">
              <span tw="text-[125px] leading-[93px]">{solAmountParts[0]}</span>
              {!!solAmountParts[1] && `.${solAmountParts[1]}`} SOL
            </p>
            <p tw="m-0">{formatMoney(data.usdAmount)} USD</p>
          </div>
          <p
            tw="bg-[#35D688] absolute bottom-0 w-[1080px] text-[32px] p-[18.5px] m-0 flex flex-row justify-center"
            style={{ fontFamily: "ClassicConsoleNeue" }}
          >
            Check how much you got MEV’d at darklake.fi/mev
          </p>
          <div tw="flex flex-col" style={{ fontFamily: "Bitsumishi" }}>
            <WaddlesMessageText solAmount={data.solAmount} />
          </div>
          <img
            src={`${process.env.NEXT_PUBLIC_HOSTNAME}/images/image-twitter-share-waddles-shadow.png`}
            alt="waddles shadow"
            width={597}
            height={84}
            tw="absolute -right-[100px] bottom-[230px]"
          />
          <img
            src={`${process.env.NEXT_PUBLIC_HOSTNAME}/images/image-waddles-2.png`}
            alt="waddles"
            width={464.625}
            height={543.951}
            tw="absolute right-0 top-[290px]"
          />
        </div>
      </div>
    ),
    {
      width: 1080,
      height: 1080,
      fonts: [
        { name: "Bitsumishi", data: fontBitsumishi },
        { name: "ClassicConsoleNeue", data: fontClassicConsoleNeue },
      ],
    },
  );
}
