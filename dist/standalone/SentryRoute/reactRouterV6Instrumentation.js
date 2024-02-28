// Modified from https://github.com/getsentry/sentry-javascript/blob/master/packages/react/src/reactrouterv6.tsx
import { getGlobalObject } from "@sentry/utils";
import hoistNonReactStatics from "hoist-non-react-statics";
import React, { useContext, useEffect, useMemo, useRef, useState, } from "react";
import { matchRoutes, useLocation, createRoutesFromChildren, useNavigationType, NavigationType, } from "react-router-dom";
let activeTransaction;
let _customStartTransaction;
let _startTransactionOnLocationChange;
const global = getGlobalObject();
const SENTRY_TAGS = {
    "routing.instrumentation": "react-router-v6-components-care",
};
function getInitPathName() {
    if (global && global.location) {
        return global.location.pathname;
    }
    return undefined;
}
export function reactRouterV6Instrumentation() {
    return (customStartTransaction, startTransactionOnPageLoad = true, startTransactionOnLocationChange = true) => {
        const initPathName = getInitPathName();
        if (startTransactionOnPageLoad && initPathName) {
            activeTransaction = customStartTransaction({
                name: initPathName,
                op: "pageload",
                tags: SENTRY_TAGS,
            });
        }
        _customStartTransaction = customStartTransaction;
        _startTransactionOnLocationChange = startTransactionOnLocationChange;
    };
}
const getTransactionName = (routes, location) => {
    if (!routes || routes.length === 0) {
        return location.pathname;
    }
    const branches = matchRoutes(routes, location);
    if (branches) {
        // eslint-disable-next-line @typescript-eslint/prefer-for-of
        for (let x = 0; x < branches.length; x++) {
            if (branches[x].route &&
                branches[x].route.path &&
                branches[x].pathname === location.pathname) {
                const ret = branches[x].route.path || location.pathname;
                if (ret.endsWith("/*"))
                    return ret.slice(0, -1);
                return ret;
            }
        }
    }
    return location.pathname;
};
const SentryRouteContext = React.createContext(null);
const SentryRouteTracingContext = React.createContext(null);
const useSentryRouteTracingContext = () => {
    const ctx = useContext(SentryRouteTracingContext);
    if (!ctx)
        throw new Error("missing SentryRouteTracingContext");
    return ctx;
};
export const SentryRoutesTracing = (props) => {
    const [routes, setRoutes] = useState([]);
    const location = useLocation();
    const navigationType = useNavigationType();
    const initialTx = useRef(true);
    const ctx = useMemo(() => ({
        setRoutes,
    }), []);
    const routesSorted = useMemo(() => routes.sort((a, b) => (b.path?.length ?? 0) - (a.path?.length ?? 0)), [routes]);
    const txName = useMemo(() => getTransactionName(routesSorted, location), [location, routesSorted]);
    useEffect(() => {
        // don't finish first transaction
        if (initialTx.current) {
            initialTx.current = false;
            return;
        }
        if (_startTransactionOnLocationChange &&
            (navigationType === NavigationType.Push ||
                navigationType === NavigationType.Pop)) {
            if (activeTransaction) {
                activeTransaction.finish();
            }
            activeTransaction = _customStartTransaction({
                name: txName,
                op: "navigation",
                tags: SENTRY_TAGS,
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location]);
    useEffect(() => {
        if (activeTransaction) {
            activeTransaction.setName(txName);
        }
    }, [txName]);
    return (React.createElement(SentryRouteTracingContext.Provider, { value: ctx }, props.children));
};
export function withSentryReactRouterV6Routing(Routes) {
    const SentryRoutes = (props) => {
        const location = useLocation();
        const routeContext = useContext(SentryRouteContext);
        const traceContext = useSentryRouteTracingContext();
        const [routes, setRoutes] = useState([]);
        useEffect(() => {
            // Performance concern:
            // This is repeated when <Routes /> is rendered.
            let childRoutes = createRoutesFromChildren(props.children);
            if (routeContext) {
                if (!routeContext.route)
                    throw new Error("child rendered, but parent does not have route match");
                let basePath = routeContext.route.path ?? "";
                if (basePath) {
                    if (basePath.startsWith("*"))
                        basePath = basePath.slice(1);
                    if (basePath.endsWith("/*"))
                        basePath = basePath.slice(0, -1);
                    childRoutes = childRoutes.map((route) => {
                        if (route.path == null)
                            return route;
                        const pathFull = (route.path.startsWith("/")
                            ? `${basePath}${route.path}`
                            : `${basePath}/${route.path}`).replace("//", "/");
                        return {
                            ...route,
                            path: pathFull,
                        };
                    });
                }
            }
            setRoutes(childRoutes);
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [props.children, routeContext]);
        // register routes with tracing
        useEffect(() => {
            traceContext.setRoutes((prev) => [...prev, ...routes]);
            return () => {
                traceContext.setRoutes((prev) => prev.filter((entry) => !routes.includes(entry)));
            };
        }, [routes, traceContext]);
        const routeCtx = useMemo(() => {
            const matches = matchRoutes(routes, location);
            const match = matches && matches[0];
            return {
                route: match?.route,
            };
        }, [routes, location]);
        if (routes.length === 0)
            return React.createElement(React.Fragment, null); // no routes, no content
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore Setting more specific React Component typing for `R` generic above
        // will break advanced type inference done by react router params
        const routesElem = React.createElement(Routes, { ...props });
        return (React.createElement(SentryRouteContext.Provider, { value: routeCtx }, routesElem));
    };
    hoistNonReactStatics(SentryRoutes, Routes);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore Setting more specific React Component typing for `R` generic above
    // will break advanced type inference done by react router params
    return SentryRoutes;
}
