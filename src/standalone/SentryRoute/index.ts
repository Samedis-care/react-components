import { Route } from "react-router-dom";
import * as Sentry from "@sentry/react";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const SentryRoute = Sentry.withSentryRouting(Route);

export default (SentryRoute as unknown) as typeof Route;
