import { useHistoryRouterContext } from "./HistoryRouter";
import type { To } from "history";
import { useCallback } from "react";
import toAppPath from "./toAppPath";

export interface NavigateOptions {
	replace?: boolean;
	state?: unknown;
}

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
			// reset scroll position - resetting all elements would break DataGrid scroll state restore
			window.scrollTo(0, 0);
			document.documentElement.scrollTop = 0;
			document.documentElement.scrollLeft = 0;
			document.body.scrollTop = 0;
			document.body.scrollLeft = 0;
			options ??= {};
			if (options.replace) history.replace(target, options.state);
			else history.push(target, options.state);
		},
		[history],
	);
};

export default useNavigate;
