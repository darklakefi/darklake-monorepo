import Link from "next/link";
import Image from "next/image";

const Header = () => {
  return (
    <header className="flex flex-row justify-between items-center pb-[64px]">
      <Link href="/" title="Darklake.fi" className="active:opacity-80">
        <Image src="/images/logo-h-darklake.png" alt="darklage logo" height={24} width={147} />
      </Link>
    </header>
  );
};

export default Header;
