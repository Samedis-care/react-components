import { createBrowserHistory } from "history";
/**
 * The History used by the react-router instance provided by the framework
 * Can be used to navigate programmatically
 */
export var FrameworkHistory = createBrowserHistory();
/**
 * The history can be overwritten for compatibility with other libraries
 * @param history The history to use
 */
export var setFrameworkHistory = function (history) {
    FrameworkHistory = history;
};
// Helper for Sentry instrumentation
var SentryHistory = /** @class */ (function () {
    function SentryHistory() {
    }
    Object.defineProperty(SentryHistory.prototype, "location", {
        get: function () {
            return FrameworkHistory.location;
        },
        enumerable: false,
        configurable: true
    });
    SentryHistory.prototype.listen = function (cb) {
        FrameworkHistory.listen(function (update) {
            cb(update.location, update.action);
        });
    };
    return SentryHistory;
}());
export { SentryHistory };
