import { useHistoryRouterContext } from "./HistoryRouter";
import type { To } from "history";
import { useCallback } from "react";
import toAppPath from "./toAppPath";

/**
 * Options of a {@link NavigateFunction} call
 */
export interface NavigateOptions {
	/**
	 * Replace the current history entry instead of pushing a new one.
	 * Default: false (push)
	 */
	replace?: boolean;
	/**
	 * State stored with the new history entry, read with
	 * `useLocation().state`. Default: none (the state is null)
	 */
	state?: unknown;
}

/**
 * Navigates to `to`, a path of the app or a location object, as
 * {@link useNavigate} describes
 */
export interface NavigateFunction {
	(to: To, options?: NavigateOptions): void;
}

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
const useNavigate = (): NavigateFunction => {
	const { history } = useHistoryRouterContext();
	return useCallback(
		(to: To, options?: NavigateOptions) => {
			const target = toAppPath(to);
			if (!target)
				throw new Error(
					`useNavigate: ${JSON.stringify(to)} is not a path of this app, use window.location to leave the app`,
				);
			options ??= {};
			if (options.replace) history.replace(target, options.state);
			else history.push(target, options.state);
		},
		[history],
	);
};

export default useNavigate;
