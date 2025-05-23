import { ShareMevImage } from "@/components/ShareMev/ShareMevImage";
import { getSiteUrl } from "@/utils/env";
import { ImageResponse } from "@vercel/og";

export const alt = "Check how much you got MEV'd at darklake.fi";
export const size = {
  width: 1080,
  height: 1080,
};
export const contentType = "image/png";

export default async function Image({ params }: { params: { address: string } }) {
  const { address } = params;
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
