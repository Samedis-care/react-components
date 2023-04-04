import { History } from "history";
import { Location, Action } from "@sentry/react/types/types";
/**
 * The History used by the react-router instance provided by the framework
 * Can be used to navigate programmatically
 */
export declare let FrameworkHistory: import("history").BrowserHistory;
/**
 * The history can be overwritten for compatibility with other libraries
 * @param history The history to use
 */
export declare const setFrameworkHistory: (history: History) => void;
export declare class SentryHistory {
    get location(): import("history").Location;
    listen(cb: (location: Location, action: Action) => void): void;
}
