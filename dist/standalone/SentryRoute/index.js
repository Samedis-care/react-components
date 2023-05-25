import React from "react";
import { Routes, Route } from "react-router-dom";
import * as Sentry from "@sentry/react";
import { withSentryReactRouterV6Routing } from "./reactRouterV6Instrumentation";
export * from "./reactRouterV6Instrumentation";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
var SentryRoute = Route;
export var SentryRoutes = Sentry
    ? // Sentry.withSentryReactRouterV6Routing will do nothing if Sentry has not been initialized yet, so we need to defer it using React.lazy
        React.lazy(function () {
            return Promise.resolve({
                default: withSentryReactRouterV6Routing(Routes),
            });
        })
    : Routes;
export default SentryRoute;