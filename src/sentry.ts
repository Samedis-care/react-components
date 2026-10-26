// Entry point for the Sentry integration (components-care/dist/sentry). It isn't part of the index
// because it imports Sentry, which is an optional peer dependency.
export { componentsCareBrowserTracingIntegration } from "./standalone/Routes/SentryBrowserTracingIntegration";
