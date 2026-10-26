import { browserTracingIntegration } from "@sentry/react";
import type { Integration } from "@sentry/core";
/**
 * Sentry's browserTracingIntegration, with pageload and navigation spans that follow the
 * HistoryRouter and are named after the matched Route.
 * Not exported by the components-care index, import it from components-care/dist/sentry: it
 * imports Sentry, which is an optional peer dependency.
 * @param options The options of browserTracingIntegration
 */
export declare function componentsCareBrowserTracingIntegration(options?: Parameters<typeof browserTracingIntegration>[0]): Integration;
