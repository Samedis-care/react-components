import { jsx as _jsx } from "react/jsx-runtime";
import React, { useContext, useLayoutEffect, useMemo, useState } from "react";
import { sentryHandleNavigation } from "./SentryRoutingInstrumentation";
import { LocationContext } from "./useLocation";
import DocumentTitleProvider from "./DocumentTitle";
export const HistoryRouterContext = React.createContext(null);
export const useHistoryRouterContext = () => {
    const ctx = useContext(HistoryRouterContext);
    if (!ctx)
        throw new Error("HistoryRouterContext missing");
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
const HistoryRouter = (props) => {
    const { history, children, formatDocumentTitle } = props;
    const [location, setLocation] = useState(history.location);
    const ctx = useMemo(() => ({ history }), [history]);
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
    return (_jsx(HistoryRouterContext.Provider, { value: ctx, children: _jsx(LocationContext.Provider, { value: location, children: _jsx(DocumentTitleProvider, { formatDocumentTitle: formatDocumentTitle, children: children }) }) }));
};
export default React.memo(HistoryRouter);
