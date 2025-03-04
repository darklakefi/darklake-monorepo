import Link from "next/link";
import Image from "next/image";
import logoDarklake from "../../public/images/logo-h-darklake.png";

const Header = () => {
  return (
    <header className="flex flex-row justify-between items-center pb-[64px]">
      <Link href="/" title="Darklake.fi" className="active:opacity-80">
        <Image src={logoDarklake} alt="darklage logo" height={24} />
      </Link>
    </header>
  );
};

export default Header;
