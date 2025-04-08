import Image from "next/image";

interface MevExtractionsWrapperProps {
  children: React.ReactNode;
}

export default function MevExtractionsWrapper(props: MevExtractionsWrapperProps) {
  const { children } = props;
  return (
    <div className="bg-brand-70 p-6 app-box-shadow relative">
      <Image
        src="/images/waddles-mev-today.png"
        alt="Waddles"
        width={400}
        height={585.84}
        className="absolute -top-[520px] -right-[40px] hidden xl:block"
      />
      {children}
    </div>
  );
}
