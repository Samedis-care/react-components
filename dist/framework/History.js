import { createBrowserHistory } from "@remix-run/router/history";
/**
 * The History used by the react-router instance provided by the framework
 * Can be used to navigate programmatically
 */
export let FrameworkHistory = createBrowserHistory();
/**
 * The history can be overwritten for compatibility with other libraries
 * @param history The history to use
 */
export const setFrameworkHistory = (history) => {
    FrameworkHistory = history;
};
// Helper for Sentry instrumentation
export class SentryHistory {
    get location() {
        return FrameworkHistory.location;
    }
    listen(cb) {
        FrameworkHistory.listen((update) => {
            cb(update.location, update.action);
        });
    }
}
