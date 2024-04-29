import React, { useContext, useEffect, useMemo, useState } from "react";
import { sentryHandleNavigation } from "./SentryRoutingInstrumentation";
import { LocationContext } from "./useLocation";
export const HistoryRouterContext = React.createContext(null);
export const useHistoryRouterContext = () => {
    const ctx = useContext(HistoryRouterContext);
    if (!ctx)
        throw new Error("HistoryRouterContext missing");
    return ctx;
};
const HistoryRouter = (props) => {
    const { history, children } = props;
    const [location, setLocation] = useState(history.location);
    const ctx = useMemo(() => ({ history }), [history]);
    useEffect(() => {
        return history.listen((update) => {
            setLocation(update.location);
            sentryHandleNavigation(update);
        });
    }, [history]);
    return (React.createElement(HistoryRouterContext.Provider, { value: ctx },
        React.createElement(LocationContext.Provider, { value: location }, children)));
};
export default React.memo(HistoryRouter);
