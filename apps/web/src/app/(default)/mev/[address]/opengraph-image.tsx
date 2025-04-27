import { getSiteUrl } from "@/utils/env";
import { NextResponse } from "next/server";
import { shareMevImage } from "@/components/ShareMev/ShareMevImage";

export const alt = "Check how much you got MEV'd at darklake.fi";
export const size = {
  width: 1080,
  height: 1080,
};
export const contentType = "image/png";

export default async function Image({ params }: { params: { address: string } }) {
  const { address } = params;
  const siteUrl = getSiteUrl();

  if (!address || !siteUrl) {
    return NextResponse.redirect(new URL("/"));
  }

  return await shareMevImage({ address });
}
