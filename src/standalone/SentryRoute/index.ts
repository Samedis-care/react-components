import React from "react";
import { Routes, Route } from "react-router-dom";
import * as Sentry from "@sentry/react";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const SentryRoute = Route;

export const SentryRoutes = Sentry
	? // Sentry.withSentryReactRouterV6Routing will do nothing if Sentry has not been initialized yet, so we need to defer it using React.lazy
	  React.lazy(() =>
			Promise.resolve({
				default: Sentry.withSentryReactRouterV6Routing(Routes),
			})
	  )
	: Routes;

export default (SentryRoute as unknown) as typeof Route;
