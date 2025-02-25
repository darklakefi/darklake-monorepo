import { socials } from "@/constants/links";
import Image from "next/image";

const Footer = () => {
  return (
    <footer className="flex flex-row justify-between items-center pb-[80px]">
      <button className="uppercase text-brand-30 underline active-hover-opacity">What is MEV?</button>
      <div className="flex flex-row gap-x-[40px]">
        {socials.map((social) => (
          <a href={social.url} key={social.title} target="_blank" rel="noreferrer" className="active-hover-opacity">
            <Image src={social.iconUrl} alt={social.title} height={24} width={24} />
          </a>
        ))}
      </div>
    </footer>
  );
};

export default Footer;
