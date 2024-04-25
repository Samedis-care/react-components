import React, { useContext, useEffect, useMemo } from "react";
import { History } from "history";
import { sentryHandleNavigation } from "./SentryRoutingInstrumentation";

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
	const ctx = useMemo((): HistoryRouterContextType => ({ history }), [history]);
	useEffect(() => {
		return history.listen((update) => {
			sentryHandleNavigation(update);
		});
	}, [history]);
	return (
		<HistoryRouterContext.Provider value={ctx}>
			{children}
		</HistoryRouterContext.Provider>
	);
};

export default React.memo(HistoryRouter);
