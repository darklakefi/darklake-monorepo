"use client";

import { socials, SocialType } from "@/constants/links";
import useGlobalModal from "@/hooks/useGlobalModal";
import { GlobalModalType } from "@/providers/GlobalModalProvider";
import { cn } from "@/utils/common";

const Footer = () => {
  const { openModal } = useGlobalModal();

  return (
    <footer className="flex flex-col sm:flex-row justify-between items-center z-20 py-20">
      <div className="flex items-center justify-between gap-x-10 max-sm:mb-10">
        <button
          className="uppercase underline text-brand-30 text-lg leading-6 hover-with-active"
          onClick={() => openModal(GlobalModalType.WHAT_IS_MEV)}
        >
          What is MEV?
        </button>
        <a
          href={process.env.NEXT_PUBLIC_REPORT_BUG_URL}
          title="Report a bug"
          target="_blank"
          className="uppercase underline text-brand-30 text-lg leading-6 hover-with-active"
        >
          Report a bug
        </a>
      </div>
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
