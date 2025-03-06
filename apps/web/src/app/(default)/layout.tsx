import Footer from "@/components/Footer";
import MainWrapper from "@/components/MainWrapper";
import Header from "@/components/Header";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="xl:container w-full mx-auto min-h-screen flex flex-col justify-between pt-16 px-6">
      <Header />
      <MainWrapper>{children}</MainWrapper>
      <Footer />
    </div>
  );
}
