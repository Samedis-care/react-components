import { browserTracingIntegration } from "@sentry/react";
import type { Integration } from "@sentry/core";
/**
 * Sentry's browserTracingIntegration, with pageload and navigation spans that follow the
 * outermost HistoryRouter (Framework's) and are named after its deepest matched Route. A
 * HistoryRouter inside another one, e.g. a wizard on a memory history, starts no span and names
 * none.
 * Not exported by the components-care index, import it from components-care/dist/sentry: it
 * imports Sentry, which is an optional peer dependency. It needs `@sentry/react` and the
 * `@sentry/core` and `@sentry/conventions` that `@sentry/react` depends on; with a node_modules
 * layout that doesn't hoist (e.g. Yarn PnP), the app has to install those two as well.
 * @param options The options of browserTracingIntegration
 */
export declare function componentsCareBrowserTracingIntegration(options?: Parameters<typeof browserTracingIntegration>[0]): Integration;
