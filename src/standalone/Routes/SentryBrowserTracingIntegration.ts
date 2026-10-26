import {
	browserTracingIntegration,
	getActiveSpan,
	getClient,
	getCurrentScope,
	getRootSpan,
	spanToJSON,
	startBrowserTracingNavigationSpan,
	startBrowserTracingPageLoadSpan,
	WINDOW,
} from "@sentry/react";
import {
	hasSpanStreamingEnabled,
	NAVIGATION_SPAN_NAME_FALLBACK,
	PAGELOAD_SPAN_NAME_FALLBACK,
} from "@sentry/core";
import type { Client, Integration, Span } from "@sentry/core";
import {
	SENTRY_OP,
	SENTRY_ORIGIN,
	SENTRY_SEGMENT_NAME_SOURCE,
	URL_TEMPLATE,
} from "@sentry/conventions/attributes";
import { Action, Update } from "history";
import { setRoutingInstrumentation } from "./SentryRoutingInstrumentation";

const CLIENTS_WITH_INSTRUMENT_NAVIGATION: Client[] = [];

/**
 * Sentry's browserTracingIntegration, with pageload and navigation spans that follow the
 * HistoryRouter and are named after the matched Route.
 * Not exported by the components-care index, import it from components-care/dist/sentry: it
 * imports Sentry, which is an optional peer dependency.
 * @param options The options of browserTracingIntegration
 */
export function componentsCareBrowserTracingIntegration(
	options?: Parameters<typeof browserTracingIntegration>[0],
): Integration {
	// Sentry 10 lacks it, a bundler that tolerates missing exports leaves it undefined
	if (!SENTRY_SEGMENT_NAME_SOURCE)
		throw new Error(
			"componentsCareBrowserTracingIntegration requires @sentry/react 11",
		);
	const integration = browserTracingIntegration({
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
			setRoutingInstrumentation({ handleNavigation, setRoutePath });

			const initPathName = WINDOW.location && WINDOW.location.pathname;
			if (instrumentPageLoad && initPathName) {
				startBrowserTracingPageLoadSpan(client, {
					// The route is only known once a Route renders (setRoutePath). With span streaming,
					// span names have to be low cardinality, so the URL can't be the name.
					name: hasSpanStreamingEnabled(client)
						? PAGELOAD_SPAN_NAME_FALLBACK
						: initPathName,
					attributes: {
						[SENTRY_SEGMENT_NAME_SOURCE]: "url",
						[SENTRY_OP]: "pageload",
						[SENTRY_ORIGIN]: "auto.pageload.react.components_care",
					},
				});
			}
			if (instrumentNavigation) {
				CLIENTS_WITH_INSTRUMENT_NAVIGATION.push(client);
			}
		},
	};
}

function setRoutePath(routePath: string): void {
	const activeRootSpan = getActiveRootSpan();
	getCurrentScope().setTransactionName(routePath);

	if (activeRootSpan) {
		activeRootSpan.updateName(routePath);
		activeRootSpan.setAttributes({
			[SENTRY_SEGMENT_NAME_SOURCE]: "route",
			[URL_TEMPLATE]: routePath,
		});
	}
}

function handleNavigation(update: Update): void {
	const client = getClient();
	if (!client || !CLIENTS_WITH_INSTRUMENT_NAVIGATION.includes(client)) {
		return;
	}

	if (update.action === Action.Push || update.action === Action.Pop) {
		startBrowserTracingNavigationSpan(client, {
			// see the pageload span
			name: hasSpanStreamingEnabled(client)
				? NAVIGATION_SPAN_NAME_FALLBACK
				: update.location.pathname,
			attributes: {
				[SENTRY_SEGMENT_NAME_SOURCE]: "url",
				[SENTRY_OP]: "navigation",
				[SENTRY_ORIGIN]: "auto.navigation.react.components_care",
			},
		});
	}
}

function getActiveRootSpan(): Span | undefined {
	const span = getActiveSpan();
	const rootSpan = span ? getRootSpan(span) : undefined;

	if (!rootSpan) {
		return undefined;
	}

	const op = spanToJSON(rootSpan).attributes[SENTRY_OP];

	// Only use this root span if it is a pageload or navigation span
	return op === "navigation" || op === "pageload" ? rootSpan : undefined;
}
