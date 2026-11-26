import React, { useContext, useLayoutEffect, useMemo, useState } from "react";
import { History, Location } from "history";
import { sentryHandleNavigation } from "./SentryRoutingInstrumentation";
import { LocationContext } from "./useLocation";
import DocumentTitleProvider, { DocumentTitleFormatter } from "./DocumentTitle";
import NavigationFocus from "./NavigationFocus";
import NavigationScroll from "./NavigationScroll";
import { NavigationFocusManager } from "./NavigationFocusManager";
import { RouteContext } from "./Route";
import RoutesEntryContext from "./RoutesEntryContext";
import NestedHistoryRouterContext from "./NestedHistoryRouterContext";
import { NavigationScrollManager } from "./NavigationScrollManager";
import { NavigationScrollContext } from "./useResetScrollOnNavigation";

/**
 * Props of {@link HistoryRouter}
 */
export interface HistoryRouterProps {
	/**
	 * The history to route with, a `History` of the history package (v5):
	 * `createBrowserHistory()` in an app, `createMemoryHistory()` in tests and
	 * stories. Framework renders a HistoryRouter with `FrameworkHistory`, so an
	 * app inside Framework doesn't add one.
	 */
	history: History;
	/**
	 * The routed content: `Routes`, `Route`, `Link` and everything that uses
	 * the routing hooks. Their routes resolve from "/", also when this
	 * HistoryRouter is rendered inside a `Route` of another one.
	 */
	children: React.ReactNode;
	/**
	 * Builds the document title from the page titles that `PageTitle` headings
	 * and `usePageTitle` set, whenever one of them changes, see
	 * {@link DocumentTitleFormatter}.
	 * Default: the most specific page title and the app title (the document's
	 * title when the router mounted), joined by " – ", e.g.
	 * "Device 4711 – Samedis.care"; the app title alone when no page title is
	 * set.
	 * The router changes the document title only once a page title is set, and
	 * sets the app title again when it unmounts. A HistoryRouter inside another
	 * one hands its page titles to the outer one and ignores this prop: inside a
	 * `Route` of the outer one, its page titles count as titles set in that
	 * `Route`, those of its own routes as titles of routes nested in it.
	 */
	formatDocumentTitle?: DocumentTitleFormatter;
}

/**
 * The value of {@link HistoryRouterContext}
 */
export interface HistoryRouterContextType {
	/**
	 * The history of the nearest HistoryRouter
	 */
	history: History;
}

/**
 * The history of the nearest HistoryRouter, null outside of one. Read it with
 * {@link useHistoryRouterContext}.
 */
export const HistoryRouterContext =
	React.createContext<HistoryRouterContextType | null>(null);
/**
 * The history of the nearest HistoryRouter, e.g. for `history.back()`, which
 * `useNavigate` has no counterpart for.
 * Throws outside a HistoryRouter; Framework renders one.
 * @returns The context of the nearest HistoryRouter
 */
export const useHistoryRouterContext = (): HistoryRouterContextType => {
	const ctx = useContext(HistoryRouterContext);
	if (!ctx)
		throw new Error(
			"HistoryRouterContext missing, did you forget to add Components-Care Framework or HistoryRouter?",
		);
	return ctx;
};

/**
 * Provides the current location and the history to `Routes`, `Route`, `Link`
 * and the routing hooks (`useLocation`, `useNavigate`, `useParams`), and
 * re-renders them on every navigation of the history. Each push and
 * back/forward navigation also starts a Sentry navigation span when
 * `componentsCareBrowserTracingIntegration` is set up. A HistoryRouter inside
 * another one starts none, and its routes leave the Sentry transaction name
 * to those of the outer one: errors and spans on a page with, e.g., a wizard
 * on a memory history are named after the page's route, not the wizard's.
 *
 * A push or replace navigation (`useNavigate`, `Link`, or `history.push` and
 * `history.replace` called directly) scrolls the window, the document and the
 * scroll containers registered with `useResetScrollOnNavigation` (the main
 * pane of PortalLayout) to the top once the location has changed:
 * - A navigation that a blocker cancels, e.g. the unsaved-changes guard of a
 *   form when the user stays, leaves the page where it is.
 * - A navigation started with `preventScrollReset` (see `useNavigate` and
 *   `Link`) keeps the scroll positions, also when a blocker holds it back and
 *   lets it go ahead later. RoutedTabs' tab switches and CRUD's move from the
 *   create form to the record it has saved use it, so the user stays where
 *   they are on the page.
 * - Back/forward navigations leave the scroll position to the browser.
 * - Other scroll containers keep their position, so that DataGrid can
 *   restore its own.
 * - A HistoryRouter inside another one, e.g. a wizard on a memory history,
 *   scrolls only the scroll containers registered with it (inside it) to the
 *   top: its navigations leave the window, the document and the scroll
 *   containers of the outer one where they are.
 *
 * A push or replace to a location with a hash ("#details"), e.g. a skip link
 * or the entry of a table of contents, then scrolls the element with that id
 * into view (the window and the scroll containers around it) and moves the
 * keyboard focus to it, as a link to a fragment does in a browser, so the
 * next Tab goes on after it. An element that is not focusable gets
 * `tabindex="-1"`, which makes it focusable without adding it to the tab
 * order. This happens once the location has rendered, so the element may be
 * part of the new page, but not one that renders later (a lazy route, a
 * record that is still loading). When the hash is all the navigation
 * changes (the same pathname and search), nothing scrolls to the top first,
 * and a hash that names no element leaves the page where it is, except
 * "#top", which scrolls to the top. A navigation started with
 * `preventScrollReset` scrolls to no element and leaves the focus alone.
 *
 * A navigation its children make while it mounts, e.g. a redirect in a mount
 * effect, shows right away, not only after the next navigation; so does the
 * location of a history passed after mount.
 *
 * It starts a fresh routing scope: its `Routes` and `Route`s match their paths
 * from "/" against its own location, also when it is rendered inside a `Route`
 * of another HistoryRouter, e.g. a wizard on a `createMemoryHistory()` inside
 * a page under "/devices/*" routes its steps as "/step1", "/step2". Inside it,
 * outside of its own routes, `useRouteInfo` throws and `useParams` returns no
 * params, as outside of every Route.
 *
 * After a push or back/forward navigation (not after a replace), it keeps the
 * keyboard focus and screen readers with the new page:
 * - When the focus is on no element (the focused link was part of the content
 *   the navigation replaced) or on one out of view (the navigation scrolled
 *   the window to the top), it moves to the heading of the new page: the
 *   `PageTitle` of the deepest route, else the first `<h1>` of the main
 *   landmark (`<main>`). The heading gets `tabindex="-1"`, which makes it
 *   focusable without adding it to the tab order. A `PageTitle` that renders
 *   later (a lazy route, a record that is still loading) gets the focus then,
 *   unless the user clicked, typed or scrolled meanwhile.
 *   A HistoryRouter inside another one moves the focus only to a `PageTitle`
 *   rendered inside it, e.g. one on the last step of a wizard, never to the
 *   page's heading outside of it; without one, the focus stays where it is.
 * - When the focus stays on an element in view (a navigation menu, a tab, or
 *   the element of a hash, which got it as described above), the new page
 *   title (see `usePageTitle`) is announced in a visually hidden polite live
 *   region, which the router renders after its children, if it differs from
 *   the one before. For a HistoryRouter inside another one, that is the
 *   title set inside it.
 * @param props The props
 */
const HistoryRouter = (props: HistoryRouterProps) => {
	const { history, children, formatDocumentTitle } = props;
	// inside another HistoryRouter, e.g. a wizard on a page: only the outermost
	// one reports to Sentry; this one leaves the window where it is and moves
	// the focus only to a heading inside it
	const nested = useContext(HistoryRouterContext) !== null;
	const [location, setLocation] = useState<Location>(history.location);
	const ctx = useMemo((): HistoryRouterContextType => ({ history }), [history]);
	const [navigationFocus] = useState(() => new NavigationFocusManager());
	const [navigationScroll] = useState(() => new NavigationScrollManager());
	// a layout effect, so the router listens before the passive effects of its
	// children run (a redirect in a mount effect)
	useLayoutEffect(() => {
		const unlisten = history.listen((update) => {
			// only now: a blocked navigation never gets here
			navigationScroll.navigated(update, nested);
			setLocation(update.location);
			if (!nested) sentryHandleNavigation(update);
			navigationFocus.navigated(update.action);
		});
		// the layout effects of the children ran before this one and may have
		// navigated already; no re-render if the location is unchanged
		setLocation(history.location);
		return unlisten;
	}, [history, navigationFocus, navigationScroll, nested]);
	return (
		<HistoryRouterContext.Provider value={ctx}>
			<LocationContext.Provider value={location}>
				{/* outside of the fresh routing scope: it ranks the page titles
				    from the Route this router is rendered in */}
				<DocumentTitleProvider formatDocumentTitle={formatDocumentTitle}>
					<RouteContext.Provider value={null}>
						<RoutesEntryContext.Provider value={null}>
							<NavigationScrollContext.Provider value={navigationScroll}>
								<NestedHistoryRouterContext.Provider value={nested}>
									{children}
								</NestedHistoryRouterContext.Provider>
							</NavigationScrollContext.Provider>
						</RoutesEntryContext.Provider>
					</RouteContext.Provider>
					{/* before NavigationFocus: the focus check finds the focus on the
					    element a hash names */}
					<NavigationScroll
						manager={navigationScroll}
						location={location}
						nested={nested}
					/>
					<NavigationFocus
						manager={navigationFocus}
						location={location}
						nested={nested}
					/>
				</DocumentTitleProvider>
			</LocationContext.Provider>
		</HistoryRouterContext.Provider>
	);
};

export default React.memo(HistoryRouter);
