import type { browserTracingIntegration } from "@sentry/browser";
import type { Integration } from "@sentry/core";
import { Update } from "history";
export declare function componentsCareBrowserTracingIntegration(options?: Parameters<typeof browserTracingIntegration>[0]): Integration;
export declare function sentrySetRoutePath(pathname: string): void;
export declare function sentryHandleNavigation(update: Update): void;
