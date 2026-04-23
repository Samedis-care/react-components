import { jsx as _jsx } from "react/jsx-runtime";
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
    return (_jsx(HistoryRouterContext.Provider, { value: ctx, children: _jsx(LocationContext.Provider, { value: location, children: children }) }));
};
export default React.memo(HistoryRouter);
