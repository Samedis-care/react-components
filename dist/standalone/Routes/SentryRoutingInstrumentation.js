import { Action } from "history";
let _browserTracingIntegration = undefined;
let _startBrowserTracingNavigationSpan = undefined;
let _startBrowserTracingPageLoadSpan = undefined;
let _WINDOW = undefined;
await import("@sentry/browser")
    .then((Sentry) => {
    _browserTracingIntegration = Sentry.browserTracingIntegration;
    _startBrowserTracingNavigationSpan =
        Sentry.startBrowserTracingNavigationSpan;
    _startBrowserTracingPageLoadSpan = Sentry.startBrowserTracingPageLoadSpan;
    _WINDOW = Sentry.WINDOW;
})
    .catch(() => { });
let _getActiveSpan = undefined;
let _getClient = undefined;
let _getCurrentScope = undefined;
let _getRootSpan = undefined;
let _SEMANTIC_ATTRIBUTE_SENTRY_OP = undefined;
let _SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN = undefined;
let _SEMANTIC_ATTRIBUTE_SENTRY_SOURCE = undefined;
let _spanToJSON = undefined;
await import("@sentry/core")
    .then((Sentry) => {
    _getActiveSpan = Sentry.getActiveSpan;
    _getClient = Sentry.getClient;
    _getCurrentScope = Sentry.getCurrentScope;
    _getRootSpan = Sentry.getRootSpan;
    _SEMANTIC_ATTRIBUTE_SENTRY_OP = Sentry.SEMANTIC_ATTRIBUTE_SENTRY_OP;
    _SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN = Sentry.SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN;
    _SEMANTIC_ATTRIBUTE_SENTRY_SOURCE = Sentry.SEMANTIC_ATTRIBUTE_SENTRY_SOURCE;
    _spanToJSON = Sentry.spanToJSON;
})
    .catch(() => { });
const CLIENTS_WITH_INSTRUMENT_NAVIGATION = [];
export function componentsCareBrowserTracingIntegration(options) {
    if (!_browserTracingIntegration)
        throw new Error("@sentry/browser import failed");
    if (!_getClient)
        throw new Error("@sentry/core import failed");
    const integration = _browserTracingIntegration({
        ...options,
        instrumentPageLoad: false,
        instrumentNavigation: false,
    });
    const { instrumentPageLoad = true, instrumentNavigation = true } = options ?? {};
    return {
        ...integration,
        afterAllSetup(client) {
            integration.afterAllSetup(client);
            const initPathName = _WINDOW && _WINDOW.location && _WINDOW.location.pathname;
            if (instrumentPageLoad && initPathName) {
                _startBrowserTracingPageLoadSpan(client, {
                    name: initPathName,
                    attributes: {
                        [_SEMANTIC_ATTRIBUTE_SENTRY_SOURCE]: "url",
                        [_SEMANTIC_ATTRIBUTE_SENTRY_OP]: "pageload",
                        [_SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: "auto.pageload.react.compoenents_care",
                    },
                });
            }
            if (instrumentNavigation) {
                CLIENTS_WITH_INSTRUMENT_NAVIGATION.push(client);
            }
        },
    };
}
export function sentrySetRoutePath(pathname) {
    const activeRootSpan = getActiveRootSpan();
    _getCurrentScope().setTransactionName(pathname);
    if (activeRootSpan) {
        activeRootSpan.updateName(pathname);
        activeRootSpan.setAttribute(_SEMANTIC_ATTRIBUTE_SENTRY_SOURCE, "route");
    }
}
export function sentryHandleNavigation(update) {
    const client = _getClient();
    if (!client || !CLIENTS_WITH_INSTRUMENT_NAVIGATION.includes(client)) {
        return;
    }
    if (update.action === Action.Push || update.action === Action.Pop) {
        _startBrowserTracingNavigationSpan(client, {
            name: update.location.pathname,
            attributes: {
                [_SEMANTIC_ATTRIBUTE_SENTRY_SOURCE]: "url",
                [_SEMANTIC_ATTRIBUTE_SENTRY_OP]: "navigation",
                [_SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: "auto.navigation.react.compoenents_care",
            },
        });
    }
}
function getActiveRootSpan() {
    const span = _getActiveSpan();
    const rootSpan = span ? _getRootSpan(span) : undefined;
    if (!rootSpan) {
        return undefined;
    }
    const op = _spanToJSON(rootSpan).op;
    // Only use this root span if it is a pageload or navigation span
    return op === "navigation" || op === "pageload" ? rootSpan : undefined;
}
