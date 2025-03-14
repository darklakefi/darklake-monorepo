export const getSiteUrl = () => {
  if (process.env.NEXT_PUBLIC_VERCEL && !process.env.NEXT_PUBLIC_SITE_URL) {
    const hostname =
      process.env.NEXT_PUBLIC_VERCEL_ENV === "production"
        ? process.env.NEXT_PUBLIC_VERCEL_URL
        : process.env.NEXT_PUBLIC_VERCEL_BRANCH_URL;
    return `https://${hostname}`;
  }

  return process.env.NEXT_PUBLIC_SITE_URL;
};
