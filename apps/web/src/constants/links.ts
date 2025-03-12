export enum SocialType {
  TWITTER = "TWITTER",
  GITHUB = "GITHUB",
  TELEGRAM = "TELEGRAM",
}

interface SocialLink {
  iconClassName: string;
  title: string;
  url: string;
  type: SocialType;
}
export const socials: SocialLink[] = [
  {
    type: SocialType.TWITTER,
    iconClassName: "hn hn-x",
    title: "Follow Darklake on X",
    url: "https://x.com/darklakefi",
  },
  {
    type: SocialType.GITHUB,
    iconClassName: "hn hn-github",
    title: "Check Darklake GitHub",
    url: "https://github.com/darklakefi",
  },
  {
    type: SocialType.TELEGRAM,
    iconClassName: "hn hn-telegram",
    title: "Join Darklake on Telegram",
    url: "https://t.me/darklakeficonvo",
  },
];
