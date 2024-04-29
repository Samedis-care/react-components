import React, { useContext, useEffect, useMemo, useState } from "react";
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

const HistoryRouter = (props: HistoryRouterProps) => {
	const { history, children } = props;
	const [location, setLocation] = useState<Location>(history.location);
	const ctx = useMemo((): HistoryRouterContextType => ({ history }), [history]);
	useEffect(() => {
		return history.listen((update) => {
			setLocation(update.location);
			sentryHandleNavigation(update);
		});
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
