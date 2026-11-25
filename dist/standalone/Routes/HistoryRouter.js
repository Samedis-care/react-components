import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useContext, useLayoutEffect, useMemo, useState } from "react";
import { Action } from "history";
import { sentryHandleNavigation } from "./SentryRoutingInstrumentation";
import { LocationContext } from "./useLocation";
import DocumentTitleProvider from "./DocumentTitle";
import NavigationFocus from "./NavigationFocus";
import { NavigationFocusManager } from "./NavigationFocusManager";
/**
 * The history of the nearest HistoryRouter, null outside of one. Read it with
 * {@link useHistoryRouterContext}.
 */
export const HistoryRouterContext = React.createContext(null);
/**
 * The history of the nearest HistoryRouter, e.g. for `history.back()`, which
 * `useNavigate` has no counterpart for.
 * Throws outside a HistoryRouter; Framework renders one.
 * @returns The context of the nearest HistoryRouter
 */
export const useHistoryRouterContext = () => {
    const ctx = useContext(HistoryRouterContext);
    if (!ctx)
        throw new Error("HistoryRouterContext missing, did you forget to add Components-Care Framework or HistoryRouter?");
    return ctx;
};
/**
 * Scrolls the window and the document to the top. Only these: other scroll
 * containers keep their position, so that DataGrid can restore its own.
 */
const resetPageScroll = () => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.documentElement.scrollLeft = 0;
    document.body.scrollTop = 0;
    document.body.scrollLeft = 0;
};
/**
 * Provides the current location and the history to `Routes`, `Route`, `Link`
 * and the routing hooks (`useLocation`, `useNavigate`, `useParams`), and
 * re-renders them on every navigation of the history. Each push and
 * back/forward navigation also starts a Sentry navigation span when
 * `componentsCareBrowserTracingIntegration` is set up.
 *
 * A push or replace navigation (`useNavigate`, `Link`, or `history.push` and
 * `history.replace` called directly) scrolls the window and the document to
 * the top once the location has changed: a navigation that a blocker cancels,
 * e.g. the unsaved-changes guard of a form when the user stays, leaves the
 * page where it is. Back/forward navigations leave the scroll position to the
 * browser. Other scroll containers keep their position.
 *
 * A navigation its children make while it mounts, e.g. a redirect in a mount
 * effect, shows right away, not only after the next navigation; so does the
 * location of a history passed after mount.
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
 * - When the focus stays on an element in view (a navigation menu, a tab),
 *   the new page title (see `usePageTitle`) is announced in a visually hidden
 *   polite live region, which the router renders after its children, if it
 *   differs from the one before.
 * @param props The props
 */
const HistoryRouter = (props) => {
    const { history, children, formatDocumentTitle } = props;
    const [location, setLocation] = useState(history.location);
    const ctx = useMemo(() => ({ history }), [history]);
    const [navigationFocus] = useState(() => new NavigationFocusManager());
    // a layout effect, so the router listens before the passive effects of its
    // children run (a redirect in a mount effect)
    useLayoutEffect(() => {
        const unlisten = history.listen((update) => {
            // only now: a blocked navigation never gets here
            if (update.action !== Action.Pop)
                resetPageScroll();
            setLocation(update.location);
            sentryHandleNavigation(update);
            navigationFocus.navigated(update.action);
        });
        // the layout effects of the children ran before this one and may have
        // navigated already; no re-render if the location is unchanged
        setLocation(history.location);
        return unlisten;
    }, [history, navigationFocus]);
    return (_jsx(HistoryRouterContext.Provider, { value: ctx, children: _jsx(LocationContext.Provider, { value: location, children: _jsxs(DocumentTitleProvider, { formatDocumentTitle: formatDocumentTitle, children: [children, _jsx(NavigationFocus, { manager: navigationFocus, location: location })] }) }) }));
};
export default React.memo(HistoryRouter);
