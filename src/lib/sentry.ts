import * as Sentry from "@sentry/react";

export const initSentry = () => {
    // We check for PROD to avoid burning quota during development, 
    // unless you specifically want to test it locally.
    // User wants to verify now, so we might need to relax this check temporarily 
    // OR user must run build. 
    // For Verification Request: I will Enable it for localhost temporarily if they are asking to verify.
    // But better to stick to PROD check and tell user to simulate prod or remove check.
    // However, the user provided snippet implies they want it to run.

    // I will KEEP the PROD check but warn the user.
    // UPDATED: Removing PROD check temporarily for USER VERIFICATION.
    // if (import.meta.env.PROD) { 
    if (true) {
        Sentry.init({
            dsn: "https://2d58b09ad400f9ea581a9e1677e97614@o4510649338429440.ingest.us.sentry.io/4510649342164992",

            // Privacy
            sendDefaultPii: true,

            integrations: [
                Sentry.browserTracingIntegration(),
                Sentry.replayIntegration()
            ],

            // Performance Monitoring
            tracesSampleRate: 1.0,
            tracePropagationTargets: ["localhost", /^https:\/\/yourserver\.io\/api/],

            // Session Replay
            replaysSessionSampleRate: 0.1,
            replaysOnErrorSampleRate: 1.0,
        });
    }
};
