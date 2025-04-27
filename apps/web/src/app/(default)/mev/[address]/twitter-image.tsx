import { getSiteUrl } from "@/utils/env";
import { NextResponse } from "next/server";
import { ShareMevImage } from "@/components/ShareMev/ShareMevImage";
export const alt = "Check how much you got MEV'd at darklake.fi";
export const size = {
  width: 1080,
  height: 1080,
};
export const contentType = "image/png";
export default async function Image({ params }: { params: { address: string } }) {
  const address = params.address;
  const siteUrl = getSiteUrl();

  if (!address || !siteUrl) {
    return NextResponse.redirect(new URL("/"));
  }

  const response = await ShareMevImage({ address });
  return response;
}
