"use client";

import { socials } from "@/constants/links";
import Image from "next/image";
import useGlobalModal from "@/hooks/useGlobalModal";
import { GlobalModalType } from "@/providers/GlobalModalProvider";

const Footer = () => {
  const { openModal } = useGlobalModal();

  return (
    <footer className="flex flex-row justify-between items-center pb-[80px]">
      <button className="uppercase text-brand-30 text-link-1" onClick={() => openModal(GlobalModalType.WHAT_IS_MEV)}>
        What is MEV?
      </button>
      <div className="flex flex-row items-center gap-x-[40px]">
        {socials.map((social) => (
          <a href={social.url} key={social.title} target="_blank" rel="noreferrer" className="hover:opacity-70 active:opacity-50">
            <Image src={social.iconUrl} alt={social.title} height={24} width={24} />
          </a>
        ))}
      </div>
    </footer>
  );
};

export default Footer;
