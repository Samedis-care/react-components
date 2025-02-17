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
	Integration,
	Client,
	Span,
	SEMANTIC_ATTRIBUTE_SENTRY_OP,
	SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN,
	SEMANTIC_ATTRIBUTE_SENTRY_SOURCE,
	spanToJSON,
} from "@sentry/core";
import { Action, Update } from "history";

let _browserTracingIntegration: typeof browserTracingIntegration | undefined =
	undefined;
let _startBrowserTracingNavigationSpan:
	| typeof startBrowserTracingNavigationSpan
	| undefined = undefined;
let _startBrowserTracingPageLoadSpan:
	| typeof startBrowserTracingPageLoadSpan
	| undefined = undefined;
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
let _SEMANTIC_ATTRIBUTE_SENTRY_OP:
	| typeof SEMANTIC_ATTRIBUTE_SENTRY_OP
	| undefined = undefined;
let _SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN:
	| typeof SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN
	| undefined = undefined;
let _SEMANTIC_ATTRIBUTE_SENTRY_SOURCE:
	| typeof SEMANTIC_ATTRIBUTE_SENTRY_SOURCE
	| undefined = undefined;
let _spanToJSON: typeof spanToJSON | undefined = undefined;
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
	.catch(() => {});

const CLIENTS_WITH_INSTRUMENT_NAVIGATION: Client[] = [];

export function componentsCareBrowserTracingIntegration(
	options?: Parameters<typeof browserTracingIntegration>[0],
): Integration {
	if (!_browserTracingIntegration)
		throw new Error("@sentry/browser import failed");
	if (!_getClient) throw new Error("@sentry/core import failed");
	const integration = _browserTracingIntegration({
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
					name: initPathName,
					attributes: {
						[_SEMANTIC_ATTRIBUTE_SENTRY_SOURCE!]: "url",
						[_SEMANTIC_ATTRIBUTE_SENTRY_OP!]: "pageload",
						[_SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN!]:
							"auto.pageload.react.compoenents_care",
					},
				});
			}
			if (instrumentNavigation) {
				CLIENTS_WITH_INSTRUMENT_NAVIGATION.push(client);
			}
		},
	};
}

export function sentrySetRoutePath(pathname: string): void {
	const activeRootSpan = getActiveRootSpan();
	_getCurrentScope!().setTransactionName(pathname);

	if (activeRootSpan) {
		activeRootSpan.updateName(pathname);
		activeRootSpan.setAttribute(_SEMANTIC_ATTRIBUTE_SENTRY_SOURCE!, "route");
	}
}

export function sentryHandleNavigation(update: Update): void {
	const client = _getClient!();
	if (!client || !CLIENTS_WITH_INSTRUMENT_NAVIGATION.includes(client)) {
		return;
	}

	if (update.action === Action.Push || update.action === Action.Pop) {
		_startBrowserTracingNavigationSpan!(client, {
			name: update.location.pathname,
			attributes: {
				[_SEMANTIC_ATTRIBUTE_SENTRY_SOURCE!]: "url",
				[_SEMANTIC_ATTRIBUTE_SENTRY_OP!]: "navigation",
				[_SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN!]:
					"auto.navigation.react.compoenents_care",
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

	const op = _spanToJSON!(rootSpan).op;

	// Only use this root span if it is a pageload or navigation span
	return op === "navigation" || op === "pageload" ? rootSpan : undefined;
}
