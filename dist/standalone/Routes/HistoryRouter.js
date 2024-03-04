import React, { useContext, useMemo } from "react";
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
    return (React.createElement(HistoryRouterContext.Provider, { value: ctx }, children));
};
export default React.memo(HistoryRouter);
