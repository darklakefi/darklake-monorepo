import iconGithub from "../../../public/images/icon-github.png";
import iconTelegram from "../../public/images/icon-telegram.png";
import iconTwitter from "../../public/images/icon-x-twitter.png";

export enum SocialType {
  TWITTER = "TWITTER",
  GITHUB = "GITHUB",
  TELEGRAM = "TELEGRAM",
}

interface SocialLink {
  iconUrl: string;
  title: string;
  url: string;
  type: SocialType;
}
export const socials: SocialLink[] = [
  {
    type: SocialType.TWITTER,
    iconUrl: iconTwitter.src,
    title: "Follow Darklake on X",
    url: "https://x.com/darklakefi",
  },
  {
    type: SocialType.GITHUB,
    iconUrl: iconGithub.src,
    title: "Check Darklake GitHub",
    url: "https://github.com/darklakefi",
  },
  {
    type: SocialType.TELEGRAM,
    iconUrl: iconTelegram.src,
    title: "Join Darklake on Telegram",
    url: "https://t.me/darklakeficonvo",
  },
];
