export const getSiteUrl = () => {
  if (process.env.VERCEL && !process.env.NEXT_PUBLIC_SITE_URL) {
    const hostname = process.env.VERCEL_ENV === "production" ? process.env.VERCEL_URL : process.env.VERCEL_BRANCH_URL;
    return `https://${hostname}`;
  }

  return process.env.NEXT_PUBLIC_SITE_URL;
};
