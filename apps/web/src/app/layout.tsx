import type { Metadata } from "next";
import localFont from "next/font/local";
import { Bounce, ToastContainer } from "react-toastify";

import "./globals.css";

import GlobalModalProvider from "@/providers/GlobalModalProvider";
import SupabaseAuthProvider from "@/providers/SupabaseAuthProvider";
import { AnalyticsProvider } from "@/providers/AnalyticsProvider";
import ToastIcon from "@/components/Toast/ToastIcon";
import ToastCloseButton from "@/components/Toast/ToastCloseButton";
import { cn } from "@/utils/common";
import QueryProvider from "@/providers/QueryProvider";

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
      <body
        className={clsx(
          fontBitsumishi.variable,
          fontClassicConsoleNeue.variable,
          // eslint-disable-next-line max-len
          "bg-no-repeat bg-fixed bg-cover box-border bg-[url(/images/bg-body.png)] bg-brand-80 text-brand-20 font-secondary text-3xl leading-8",
        )}
      >
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
        <AnalyticsProvider>
          <SupabaseAuthProvider>
            <GlobalModalProvider>{children}</GlobalModalProvider>
          </SupabaseAuthProvider>
        </AnalyticsProvider>
      </body>
    </html>
  );
}
