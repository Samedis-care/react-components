import { useHistoryRouterContext } from "./HistoryRouter";
import { useCallback } from "react";
import toAppPath from "./toAppPath";
/**
 * Navigate using History API
 *
 * The target is a path of the app (or a location object): leading slashes
 * collapse into one, so `${useRouteInfo().url}/7` goes to "/7" also under a
 * route that matches at the root. A target with a scheme ("https://…",
 * "mailto:…", "javascript:…") throws an Error and nothing happens; leave the
 * app with `window.location` instead.
 *
 * Blockers on the history apply (inside Framework: a form with unsaved
 * changes). Once the navigation happens, the HistoryRouter scrolls the page
 * to the top; a navigation that a blocker cancels keeps the scroll position.
 */
const useNavigate = () => {
    const { history } = useHistoryRouterContext();
    return useCallback((to, options) => {
        const target = toAppPath(to);
        if (!target)
            throw new Error(`useNavigate: ${JSON.stringify(to)} is not a path of this app, use window.location to leave the app`);
        options ??= {};
        if (options.replace)
            history.replace(target, options.state);
        else
            history.push(target, options.state);
    }, [history]);
};
export default useNavigate;
