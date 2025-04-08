import { cn } from "@/utils/common";
import Image from "next/image";

interface AddressMevLookupWrapperProps {
  children: React.ReactNode;
}

export default function AddressMevLookupWrapper(props: AddressMevLookupWrapperProps) {
  const { children } = props;
  return (
    <div className="pt-16 md:pt-64 max-md:pt-32">
      <div className={cn("max-xl:bg-brand-70", "max-xl:app-box-shadow", "max-xl:p-6 relative")}>
        <Image
          src="/images/waddles-mev-today.png"
          alt="Waddles"
          width={267}
          height={391}
          className="absolute -top-[344px] -right-[10px] hidden md:block xl:hidden"
        />
        <Image
          src="/images/waddles-mev-today.png"
          alt="Waddles"
          width={200}
          height={292.92}
          className="absolute -top-[256px] -right-[20px] block md:hidden"
        />

        {children}
      </div>
    </div>
  );
}
