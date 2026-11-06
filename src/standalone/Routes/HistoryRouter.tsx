import React, { useContext, useLayoutEffect, useMemo, useState } from "react";
import { History, Location } from "history";
import { sentryHandleNavigation } from "./SentryRoutingInstrumentation";
import { LocationContext } from "./useLocation";

export interface HistoryRouterProps {
	history: History;
	children: React.ReactNode;
}

export interface HistoryRouterContextType {
	history: History;
}

export const HistoryRouterContext =
	React.createContext<HistoryRouterContextType | null>(null);
export const useHistoryRouterContext = () => {
	const ctx = useContext(HistoryRouterContext);
	if (!ctx) throw new Error("HistoryRouterContext missing");
	return ctx;
};

/**
 * Provides the current location and the history to `Routes`, `Route`, `Link`
 * and the routing hooks (`useLocation`, `useNavigate`, `useParams`), and
 * re-renders them on every navigation of the history. Each push and
 * back/forward navigation also starts a Sentry navigation span when
 * `componentsCareBrowserTracingIntegration` is set up.
 *
 * A navigation its children make while it mounts, e.g. a redirect in a mount
 * effect, shows right away, not only after the next navigation; so does the
 * location of a history passed after mount.
 * @param props The props
 */
const HistoryRouter = (props: HistoryRouterProps) => {
	const { history, children } = props;
	const [location, setLocation] = useState<Location>(history.location);
	const ctx = useMemo((): HistoryRouterContextType => ({ history }), [history]);
	// a layout effect, so the router listens before the passive effects of its
	// children run (a redirect in a mount effect)
	useLayoutEffect(() => {
		const unlisten = history.listen((update) => {
			setLocation(update.location);
			sentryHandleNavigation(update);
		});
		// the layout effects of the children ran before this one and may have
		// navigated already; no re-render if the location is unchanged
		setLocation(history.location);
		return unlisten;
	}, [history]);
	return (
		<HistoryRouterContext.Provider value={ctx}>
			<LocationContext.Provider value={location}>
				{children}
			</LocationContext.Provider>
		</HistoryRouterContext.Provider>
	);
};

export default React.memo(HistoryRouter);
