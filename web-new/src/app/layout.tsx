import type { Metadata } from "next";
import localFont from "next/font/local";
import clsx from "clsx";

import "./globals.css";

import Footer from "@/components/Footer";
import MainWrapper from "@/components/MainWrapper";
import Header from "@/components/Header";

const fontBitsumishi = localFont({
  src: "../../public/fonts/bitsumishi.ttf",
  variable: "--font-primary",
});

const fontClassicConsoleNeue = localFont({
  src: "../../public/fonts/classic-console-neue.ttf",
  variable: "--font-secondary",
});

export const metadata: Metadata = {
  title: "MEV Checker | Darklake.fi",
  description: "Solana's first DEX delivering real-time, MEV-resistant order execution.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={clsx(fontBitsumishi.variable, fontClassicConsoleNeue.variable)}>
        <div className="xl:container w-full mx-auto min-h-screen flex flex-col justify-between pt-[64px] px-[25px]">
          <Header />
          <MainWrapper>{children}</MainWrapper>
          <Footer />
        </div>
      </body>
    </html>
  );
}
