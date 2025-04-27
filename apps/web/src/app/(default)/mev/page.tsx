import type { Metadata } from "next";
import { redirect } from "next/navigation";

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata(
  { searchParams }: Props,
): Promise<Metadata> {
  const address = (await searchParams).address;

  return {
    title: "Check how much you got MEV'd at darklake.fi",
    description: "Check how much you got MEV'd at darklake.fi",
    openGraph: {
      title: "Check how much you got MEV'd at darklake.fi",
      description: "Check how much you got MEV'd at darklake.fi",
      siteName: "darklake.fi",
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/mev?address=${address}`,
      images: [
        { url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/mev/image?address=${address}` },
      ],
    },
    twitter: {
      card: "summary_large_image",
      site: "@darklakefi",
      creator: "@darklakefi",
      images: `${process.env.NEXT_PUBLIC_SITE_URL}/api/mev/image?address=${address}`,
    },
  };
}

export default function Page({ }: Props) {
  return redirect("/");
}
