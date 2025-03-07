import type { Metadata } from "next";
import localFont from "next/font/local";
import clsx from "clsx";
import { Bounce, ToastContainer } from "react-toastify";

import "./globals.css";

import Footer from "@/components/Footer";
import MainWrapper from "@/components/MainWrapper";
import Header from "@/components/Header";
import GlobalModalProvider from "@/providers/GlobalModalProvider";
import SupabaseAuthProvider from "@/providers/SupabaseAuthProvider";
import { AnalyticsProvider } from "@/providers/AnalyticsProvider";
import ToastIcon from "@/components/Toast/ToastIcon";
import ToastCloseButton from "@/components/Toast/ToastCloseButton";

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
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar
          newestOnTop
          closeOnClick={false}
          rtl={false}
          pauseOnFocusLoss
          draggable={false}
          pauseOnHover
          theme="dark"
          transition={Bounce}
          closeButton={ToastCloseButton}
          icon={ToastIcon}
        />
        <div className="xl:container w-full mx-auto min-h-screen flex flex-col justify-between pt-[64px] px-[25px]">
          <AnalyticsProvider>
            <SupabaseAuthProvider>
              <GlobalModalProvider>
                <Header />
                <MainWrapper>{children}</MainWrapper>
                <Footer />
              </GlobalModalProvider>
            </SupabaseAuthProvider>
          </AnalyticsProvider>
        </div>
      </body>
    </html>
  );
}
