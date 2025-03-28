import * as Sentry from "@sentry/nextjs";

export async function register() {
  if ((process.env.NEXT_RUNTIME === "nodejs" || process.env.NEXT_RUNTIME === "edge") && process.env.SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      tracesSampleRate: 1,
      debug: false,
    });
  }
}

export const onRequestError = Sentry.captureRequestError;
