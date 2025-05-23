import Footer from "@/components/Footer";
import Header from "@/components/Header";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="xl:container min-h-screen w-full mx-auto flex flex-col justify-between px-6">
      <Header />
      {children}
      <Footer />
    </div>
  );
}
