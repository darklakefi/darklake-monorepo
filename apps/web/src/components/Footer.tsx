"use client";

import { socials, SocialType } from "@/constants/links";
import useGlobalModal from "@/hooks/useGlobalModal";
import { GlobalModalType } from "@/providers/GlobalModalProvider";
import { cn } from "@/utils/common";

const Footer = () => {
  const { openModal } = useGlobalModal();

  return (
    <footer className="flex flex-row justify-between items-center pb-[80px]">
      <button
        className="uppercase underline text-brand-30 text-lg leading-6 hover-with-active"
        onClick={() => openModal(GlobalModalType.WHAT_IS_MEV)}
      >
        What is MEV?
      </button>
      <div className="flex flex-row items-center gap-x-[40px]">
        {socials.map((social) => (
          <a href={social.url} key={social.title} target="_blank" rel="noreferrer" className="hover-with-active">
            <i
              className={cn(
                social.iconClassName,
                social.type !== SocialType.TELEGRAM && "text-brand-30 text-xl",
                social.type === SocialType.TELEGRAM && "size-5",
              )}
            />
          </a>
        ))}
      </div>
    </footer>
  );
};

export default Footer;
