import React, { useContext, useEffect, useMemo } from "react";
import { sentryHandleNavigation } from "./SentryRoutingInstrumentation";
export const HistoryRouterContext = React.createContext(null);
export const useHistoryRouterContext = () => {
    const ctx = useContext(HistoryRouterContext);
    if (!ctx)
        throw new Error("HistoryRouterContext missing");
    return ctx;
};
const HistoryRouter = (props) => {
    const { history, children } = props;
    const ctx = useMemo(() => ({ history }), [history]);
    useEffect(() => {
        return history.listen((update) => {
            sentryHandleNavigation(update);
        });
    }, [history]);
    return (React.createElement(HistoryRouterContext.Provider, { value: ctx }, children));
};
export default React.memo(HistoryRouter);
