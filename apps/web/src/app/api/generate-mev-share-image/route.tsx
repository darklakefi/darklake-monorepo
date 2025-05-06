import { ShareMevImage } from "@/components/ShareMev/ShareMevImage";
import { getSiteUrl } from "@/utils/env";
import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const address = searchParams.get("address");
  const siteUrl = getSiteUrl();

  const bitsumishiFontData = await fetch(new URL(`${siteUrl}/fonts/bitsumishi.ttf`, import.meta.url)).then((res) =>
    res.arrayBuffer(),
  );
  const classicConsoleNeueFontData = await fetch(
    new URL(`${siteUrl}/fonts/classic-console-neue.ttf`, import.meta.url),
  ).then((res) => res.arrayBuffer());

  const apiUrl = new URL(`/v1/mev/total-extracted?address=${address}`, process.env.NEXT_PUBLIC_API_URL);
  const response = await fetch(apiUrl);
  const { data } = await response.json();

  return new ImageResponse(
    (
      <ShareMevImage
        totalSolExtracted={data?.totalSolExtracted}
        totalUsdExtracted={data?.totalUsdExtracted}
        solAmount={data?.solAmount}
      />
    ),
    {
      width: 1080,
      height: 1080,
      fonts: [
        { name: "Bitsumishi", data: bitsumishiFontData },
        { name: "ClassicConsoleNeue", data: classicConsoleNeueFontData },
      ],
    },
  );
}
