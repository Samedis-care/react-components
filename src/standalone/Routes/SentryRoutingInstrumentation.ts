import type {
	browserTracingIntegration,
	startBrowserTracingNavigationSpan,
	startBrowserTracingPageLoadSpan,
	WINDOW,
} from "@sentry/browser";
import type {
	getActiveSpan,
	getClient,
	getCurrentScope,
	getRootSpan,
	hasSpanStreamingEnabled,
	Integration,
	Client,
	NAVIGATION_SPAN_NAME_FALLBACK,
	PAGELOAD_SPAN_NAME_FALLBACK,
	Span,
	spanToJSON,
} from "@sentry/core";
import type {
	SENTRY_OP,
	SENTRY_ORIGIN,
	SENTRY_SEGMENT_NAME_SOURCE,
	URL_TEMPLATE,
} from "@sentry/conventions/attributes";
import { Action, Location, Update } from "history";

let _browserTracingIntegration: typeof browserTracingIntegration | undefined =
	undefined;
let _startBrowserTracingNavigationSpan:
	typeof startBrowserTracingNavigationSpan | undefined = undefined;
let _startBrowserTracingPageLoadSpan:
	typeof startBrowserTracingPageLoadSpan | undefined = undefined;
let _WINDOW: typeof WINDOW | undefined = undefined;
await import("@sentry/browser")
	.then((Sentry) => {
		_browserTracingIntegration = Sentry.browserTracingIntegration;
		_startBrowserTracingNavigationSpan =
			Sentry.startBrowserTracingNavigationSpan;
		_startBrowserTracingPageLoadSpan = Sentry.startBrowserTracingPageLoadSpan;
		_WINDOW = Sentry.WINDOW;
	})
	.catch(() => {});

let _getActiveSpan: typeof getActiveSpan | undefined = undefined;
let _getClient: typeof getClient | undefined = undefined;
let _getCurrentScope: typeof getCurrentScope | undefined = undefined;
let _getRootSpan: typeof getRootSpan | undefined = undefined;
let _hasSpanStreamingEnabled: typeof hasSpanStreamingEnabled | undefined =
	undefined;
let _NAVIGATION_SPAN_NAME_FALLBACK:
	typeof NAVIGATION_SPAN_NAME_FALLBACK | undefined = undefined;
let _PAGELOAD_SPAN_NAME_FALLBACK:
	typeof PAGELOAD_SPAN_NAME_FALLBACK | undefined = undefined;
let _spanToJSON: typeof spanToJSON | undefined = undefined;
await import("@sentry/core")
	.then((Sentry) => {
		_getActiveSpan = Sentry.getActiveSpan;
		_getClient = Sentry.getClient;
		_getCurrentScope = Sentry.getCurrentScope;
		_getRootSpan = Sentry.getRootSpan;
		_hasSpanStreamingEnabled = Sentry.hasSpanStreamingEnabled;
		_NAVIGATION_SPAN_NAME_FALLBACK = Sentry.NAVIGATION_SPAN_NAME_FALLBACK;
		_PAGELOAD_SPAN_NAME_FALLBACK = Sentry.PAGELOAD_SPAN_NAME_FALLBACK;
		_spanToJSON = Sentry.spanToJSON;
	})
	.catch(() => {});

let _SENTRY_OP: typeof SENTRY_OP | undefined = undefined;
let _SENTRY_ORIGIN: typeof SENTRY_ORIGIN | undefined = undefined;
let _SENTRY_SEGMENT_NAME_SOURCE: typeof SENTRY_SEGMENT_NAME_SOURCE | undefined =
	undefined;
let _URL_TEMPLATE: typeof URL_TEMPLATE | undefined = undefined;
await import("@sentry/conventions/attributes")
	.then((Conventions) => {
		_SENTRY_OP = Conventions.SENTRY_OP;
		_SENTRY_ORIGIN = Conventions.SENTRY_ORIGIN;
		_SENTRY_SEGMENT_NAME_SOURCE = Conventions.SENTRY_SEGMENT_NAME_SOURCE;
		_URL_TEMPLATE = Conventions.URL_TEMPLATE;
	})
	.catch(() => {});

// Sentry 11 is an optional peer dependency, Routes have to work without it. One export of each
// package that older versions don't have.
const SENTRY_INSTALLED =
	!!_browserTracingIntegration &&
	!!_PAGELOAD_SPAN_NAME_FALLBACK &&
	!!_SENTRY_SEGMENT_NAME_SOURCE;

const CLIENTS_WITH_INSTRUMENT_NAVIGATION: Client[] = [];

export function componentsCareBrowserTracingIntegration(
	options?: Parameters<typeof browserTracingIntegration>[0],
): Integration {
	if (!SENTRY_INSTALLED)
		throw new Error(
			"componentsCareBrowserTracingIntegration requires @sentry/react 11",
		);
	const integration = _browserTracingIntegration!({
		...options,
		instrumentPageLoad: false,
		instrumentNavigation: false,
	});

	const { instrumentPageLoad = true, instrumentNavigation = true } =
		options ?? {};
	return {
		...integration,
		afterAllSetup(client) {
			integration.afterAllSetup(client);

			const initPathName =
				_WINDOW && _WINDOW.location && _WINDOW.location.pathname;
			if (instrumentPageLoad && initPathName) {
				_startBrowserTracingPageLoadSpan!(client, {
					// The route is only known once a Route renders (sentrySetRoutePath). With span
					// streaming, span names have to be low cardinality, so the URL can't be the name.
					name: _hasSpanStreamingEnabled!(client)
						? _PAGELOAD_SPAN_NAME_FALLBACK!
						: initPathName,
					attributes: {
						[_SENTRY_SEGMENT_NAME_SOURCE!]: "url",
						[_SENTRY_OP!]: "pageload",
						[_SENTRY_ORIGIN!]: "auto.pageload.react.components_care",
					},
				});
			}
			if (instrumentNavigation) {
				CLIENTS_WITH_INSTRUMENT_NAVIGATION.push(client);
			}
		},
	};
}

// the route that named the current location, see sentrySetRoutePath
let namedBy: { location: Location; depth: number } | null = null;

/**
 * Names the active pageload or navigation span, and the transaction of the current scope, after a
 * matched route. Every matched Route reports itself for every location, and the deepest one wins,
 * so nested routes name the span after the full route (parent effects run after child effects).
 * @param routePath The full route path (including parent routes)
 * @param depth How many routes the route is nested in
 * @param location The location the route matched
 */
export function sentrySetRoutePath(
	routePath: string,
	depth: number,
	location: Location,
): void {
	if (!SENTRY_INSTALLED) return;
	if (namedBy && namedBy.location === location && namedBy.depth > depth) return;
	namedBy = { location, depth };

	const activeRootSpan = getActiveRootSpan();
	_getCurrentScope!().setTransactionName(routePath);

	if (activeRootSpan) {
		activeRootSpan.updateName(routePath);
		activeRootSpan.setAttributes({
			[_SENTRY_SEGMENT_NAME_SOURCE!]: "route",
			[_URL_TEMPLATE!]: routePath,
		});
	}
}

export function sentryHandleNavigation(update: Update): void {
	if (!SENTRY_INSTALLED) return;
	const client = _getClient!();
	if (!client || !CLIENTS_WITH_INSTRUMENT_NAVIGATION.includes(client)) {
		return;
	}

	if (update.action === Action.Push || update.action === Action.Pop) {
		_startBrowserTracingNavigationSpan!(client, {
			// see the pageload span
			name: _hasSpanStreamingEnabled!(client)
				? _NAVIGATION_SPAN_NAME_FALLBACK!
				: update.location.pathname,
			attributes: {
				[_SENTRY_SEGMENT_NAME_SOURCE!]: "url",
				[_SENTRY_OP!]: "navigation",
				[_SENTRY_ORIGIN!]: "auto.navigation.react.components_care",
			},
		});
	}
}

function getActiveRootSpan(): Span | undefined {
	const span = _getActiveSpan!();
	const rootSpan = span ? _getRootSpan!(span) : undefined;

	if (!rootSpan) {
		return undefined;
	}

	const op = _spanToJSON!(rootSpan).attributes[_SENTRY_OP!];

	// Only use this root span if it is a pageload or navigation span
	return op === "navigation" || op === "pageload" ? rootSpan : undefined;
}
