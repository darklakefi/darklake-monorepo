import iconGithub from "../../public/images/icon-github.png";
import iconTelegram from "../../public/images/icon-telegram.png";
import iconTwitter from "../../public/images/icon-x-twitter.png";

interface SocialLink {
  iconUrl: string;
  title: string;
  url: string;
}

export const socials: SocialLink[] = [
  {
    iconUrl: iconTwitter.src,
    title: "Follow Darklake on X",
    url: "https://x.com/darklakefi",
  },
  {
    iconUrl: iconGithub.src,
    title: "Check Darklake GitHub",
    url: "https://github.com/darklakefi",
  },
  {
    iconUrl: iconTelegram.src,
    title: "Join Darklake on Telegram",
    // TODO: add right link
    url: "https://tg.me",
  },
];
