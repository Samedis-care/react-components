import { Route } from "react-router-dom";
// import * as Sentry from "@sentry/react";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const SentryRoute = Route; // TODO: Sentry.withSentryRouting(Route); does not work with React Router v6

export default (SentryRoute as unknown) as typeof Route;
