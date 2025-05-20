import { useHistoryRouterContext } from "./HistoryRouter";
import type { To } from "history";
import { useCallback } from "react";

export interface NavigateOptions {
	replace?: boolean;
	state?: unknown;
}

export interface NavigateFunction {
	(to: To, options?: NavigateOptions): void;
}

/**
 * Navigate using History API
 */
const useNavigate = (): NavigateFunction => {
	const { history } = useHistoryRouterContext();
	return useCallback(
		(to: To, options?: NavigateOptions) => {
			// reset scroll position
			Array.from(document.querySelectorAll("*")).forEach((el) => {
				el.scrollTop = 0;
				el.scrollLeft = 0;
			});
			options ??= {};
			if (options.replace) history.replace(to, options.state);
			else history.push(to, options.state);
		},
		[history],
	);
};

export default useNavigate;
