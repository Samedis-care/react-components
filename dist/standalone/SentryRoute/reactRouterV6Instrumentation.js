// Modified from https://github.com/getsentry/sentry-javascript/blob/master/packages/react/src/reactrouterv6.tsx
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import { getGlobalObject } from "@sentry/utils";
import hoistNonReactStatics from "hoist-non-react-statics";
import React, { useContext, useEffect, useMemo, useRef, useState, } from "react";
import { matchRoutes, useLocation, createRoutesFromChildren, useNavigationType, } from "react-router-dom";
var activeTransaction;
var _customStartTransaction;
var _startTransactionOnLocationChange;
var global = getGlobalObject();
var SENTRY_TAGS = {
    "routing.instrumentation": "react-router-v6-components-care",
};
function getInitPathName() {
    if (global && global.location) {
        return global.location.pathname;
    }
    return undefined;
}
export function reactRouterV6Instrumentation() {
    return function (customStartTransaction, startTransactionOnPageLoad, startTransactionOnLocationChange) {
        if (startTransactionOnPageLoad === void 0) { startTransactionOnPageLoad = true; }
        if (startTransactionOnLocationChange === void 0) { startTransactionOnLocationChange = true; }
        var initPathName = getInitPathName();
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
var getTransactionName = function (routes, location) {
    if (!routes || routes.length === 0) {
        return location.pathname;
    }
    var branches = matchRoutes(routes, location);
    if (branches) {
        // eslint-disable-next-line @typescript-eslint/prefer-for-of
        for (var x = 0; x < branches.length; x++) {
            if (branches[x].route &&
                branches[x].route.path &&
                branches[x].pathname === location.pathname) {
                var ret = branches[x].route.path || location.pathname;
                if (ret.endsWith("/*"))
                    return ret.slice(0, -1);
                return ret;
            }
        }
    }
    return location.pathname;
};
var SentryRouteContext = React.createContext(null);
var SentryRouteTracingContext = React.createContext(null);
var useSentryRouteTracingContext = function () {
    var ctx = useContext(SentryRouteTracingContext);
    if (!ctx)
        throw new Error("missing SentryRouteTracingContext");
    return ctx;
};
export var SentryRoutesTracing = function (props) {
    var _a = useState([]), routes = _a[0], setRoutes = _a[1];
    var location = useLocation();
    var navigationType = useNavigationType();
    var initialTx = useRef(true);
    var ctx = useMemo(function () { return ({
        setRoutes: setRoutes,
    }); }, []);
    var routesSorted = useMemo(function () { return routes.sort(function (a, b) { var _a, _b, _c, _d; return ((_b = (_a = b.path) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 0) - ((_d = (_c = a.path) === null || _c === void 0 ? void 0 : _c.length) !== null && _d !== void 0 ? _d : 0); }); }, [routes]);
    var txName = useMemo(function () { return getTransactionName(routesSorted, location); }, [
        location,
        routesSorted,
    ]);
    useEffect(function () {
        // don't finish first transaction
        if (initialTx.current) {
            initialTx.current = false;
            return;
        }
        if (_startTransactionOnLocationChange &&
            (navigationType === "PUSH" || navigationType === "POP")) {
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
    useEffect(function () {
        if (activeTransaction) {
            activeTransaction.setName(txName);
        }
    }, [txName]);
    return (React.createElement(SentryRouteTracingContext.Provider, { value: ctx }, props.children));
};
export function withSentryReactRouterV6Routing(Routes) {
    var SentryRoutes = function (props) {
        var location = useLocation();
        var routeContext = useContext(SentryRouteContext);
        var traceContext = useSentryRouteTracingContext();
        var _a = useState([]), routes = _a[0], setRoutes = _a[1];
        useEffect(function () {
            var _a;
            // Performance concern:
            // This is repeated when <Routes /> is rendered.
            var childRoutes = createRoutesFromChildren(props.children);
            if (routeContext) {
                if (!routeContext.route)
                    throw new Error("child rendered, but parent does not have route match");
                var basePath_1 = (_a = routeContext.route.path) !== null && _a !== void 0 ? _a : "";
                if (basePath_1) {
                    if (basePath_1.startsWith("*"))
                        basePath_1 = basePath_1.slice(1);
                    if (basePath_1.endsWith("/*"))
                        basePath_1 = basePath_1.slice(0, -1);
                    childRoutes = childRoutes.map(function (route) {
                        if (route.path == null)
                            return route;
                        var pathFull = (route.path.startsWith("/")
                            ? "".concat(basePath_1).concat(route.path)
                            : "".concat(basePath_1, "/").concat(route.path)).replace("//", "/");
                        return __assign(__assign({}, route), { path: pathFull });
                    });
                }
            }
            setRoutes(childRoutes);
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [props.children, routeContext]);
        // register routes with tracing
        useEffect(function () {
            traceContext.setRoutes(function (prev) { return __spreadArray(__spreadArray([], prev, true), routes, true); });
            return function () {
                traceContext.setRoutes(function (prev) {
                    return prev.filter(function (entry) { return !routes.includes(entry); });
                });
            };
        }, [routes, traceContext]);
        var routeCtx = useMemo(function () {
            var matches = matchRoutes(routes, location);
            var match = matches && matches[0];
            return {
                route: match === null || match === void 0 ? void 0 : match.route,
            };
        }, [routes, location]);
        if (routes.length === 0)
            return React.createElement(React.Fragment, null); // no routes, no content
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore Setting more specific React Component typing for `R` generic above
        // will break advanced type inference done by react router params
        var routesElem = React.createElement(Routes, __assign({}, props));
        return (React.createElement(SentryRouteContext.Provider, { value: routeCtx }, routesElem));
    };
    hoistNonReactStatics(SentryRoutes, Routes);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore Setting more specific React Component typing for `R` generic above
    // will break advanced type inference done by react router params
    return SentryRoutes;
}
