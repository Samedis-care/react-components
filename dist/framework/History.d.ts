import { Location, Action } from "@sentry/react/types/types";
import { History } from "@remix-run/router/history";
/**
 * The History used by the react-router instance provided by the framework
 * Can be used to navigate programmatically
 */
export declare let FrameworkHistory: import("@remix-run/router/history").BrowserHistory;
/**
 * The history can be overwritten for compatibility with other libraries
 * @param history The history to use
 */
export declare const setFrameworkHistory: (history: History) => void;
export declare class SentryHistory {
    get location(): import("@remix-run/router/history").Location<any>;
    listen(cb: (location: Location, action: Action) => void): void;
}
