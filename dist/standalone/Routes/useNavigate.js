import { useHistoryRouterContext } from "./HistoryRouter";
import { useCallback, useContext } from "react";
import toAppPath from "./toAppPath";
import { NavigationScrollContext } from "./useResetScrollOnNavigation";
/**
 * Navigate using History API
 *
 * The target is a path of the app (or a location object): leading slashes
 * collapse into one, so `${useRouteInfo().url}/7` goes to "/7" also under a
 * route that matches at the root. A target without a pathname ("?page=2",
 * "#notes", `{ search: "?page=2" }` or the empty "") keeps the current one
 * and, as `history.push` does, drops the search and hash it leaves out: at
 * "/devices?page=1", "" goes to "/devices". A target with a scheme
 * ("https://…", "mailto:…", "javascript:…") throws an Error and nothing
 * happens; leave the app with `window.location` instead.
 *
 * Blockers on the history apply (inside Framework: a form with unsaved
 * changes). Once the navigation happens, the HistoryRouter scrolls the page
 * to the top: the window, the document and the scroll containers registered
 * with `useResetScrollOnNavigation` (PortalLayout's main pane), unless the
 * call passes `preventScrollReset`. A HistoryRouter inside another one (a
 * wizard on a memory history) scrolls only the scroll containers registered
 * with it. A navigation that a blocker cancels keeps the scroll position.
 *
 * A target with a hash ("#details", "/devices/5#notes") then scrolls the
 * element with that id into view and moves the keyboard focus to it, as a
 * link to a fragment does in a browser; when the hash is all it changes,
 * nothing scrolls to the top first. See `HistoryRouter`.
 */
const useNavigate = () => {
    const { history } = useHistoryRouterContext();
    const navigationScroll = useContext(NavigationScrollContext);
    return useCallback((to, options) => {
        const target = toAppPath(to);
        if (target === null)
            throw new Error(`useNavigate: ${JSON.stringify(to)} is not a path of this app, use window.location to leave the app`);
        options ??= {};
        navigationScroll?.navigating(history, target, !!options.preventScrollReset);
        if (options.replace)
            history.replace(target, options.state);
        else
            history.push(target, options.state);
    }, [history, navigationScroll]);
};
export default useNavigate;
