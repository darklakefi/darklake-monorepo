import type { Metadata } from "next";
// import { redirect } from "next/navigation";

type Props = {
  params: Promise<{ address: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const address = (await params).address;

  return {
    title: "Check how much you got MEV'd at darklake.fi",
    description: "Check how much you got MEV'd at darklake.fi",
    openGraph: {
      title: "Check how much you got MEV'd at darklake.fi",
      description: "Check how much you got MEV'd at darklake.fi",
      siteName: "darklake.fi",
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/mev/${address}`,
    },
    twitter: {
      card: "summary_large_image",
      site: "@darklakefi",
      creator: "@darklakefi",
    },
  };
}

export default function Page({}: Props) {
  // return redirect("/");
  return <div>Hello</div>;
}
