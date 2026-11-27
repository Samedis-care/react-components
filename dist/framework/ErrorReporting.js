/**
 * Global error reporting configuration
 *
 * Components-Care reports unexpected errors to an error tracker (Sentry by default, if
 * `@sentry/react` is installed). Which errors are reported and where they go can be configured
 * from your application's startup code:
 *
 * ```ts
 * import { configureErrorReporting, CcErrorNames } from "components-care";
 *
 * configureErrorReporting({
 * 	report: (error, context) => myTracker.capture(error, context.source),
 * 	shouldReport: (error) => error.name !== CcErrorNames.NetworkError,
 * });
 * ```
 *
 * @remarks This module intentionally has no imports from other tiers, so it can be used from
 *          anywhere (including non-React code). Errors are discriminated by their name, not by
 *          instanceof, matching the rest of the library.
 */
// optional import
// the promise is kept around instead of storing the function in a variable, otherwise errors
// which happen before the import resolves would be silently dropped
const sentryCaptureException = import("@sentry/react")
    .then((Sentry) => Sentry.captureException)
    .catch(() => null); // ignore, @sentry/react is optional
/**
 * The Error.name of every error class raised by components-care
 * @remarks Components-Care errors are discriminated by name (and not by instanceof), because the
 *          error classes live in different tiers and may cross bundle boundaries.
 */
export const CcErrorNames = {
    /**
     * @see BackendError
     */
    BackendError: "BackendError",
    /**
     * @see NetworkError
     */
    NetworkError: "NetworkError",
    /**
     * @see ImageLoadError
     * @remarks the name is prefixed, to avoid collisions with app error classes
     */
    ImageLoadError: "CcImageLoadError",
    /**
     * @see PartialApplyError
     * @remarks the name is prefixed, to avoid collisions with app error classes
     */
    PartialApplyError: "CcPartialApplyError",
    /**
     * @see PartialDeleteError
     * @remarks the name is prefixed, to avoid collisions with app error classes
     */
    PartialDeleteError: "CcPartialDeleteError",
    /**
     * @see RequestBatchingError
     */
    RequestBatchingError: "RequestBatchingError",
    /**
     * @see ValidationError
     * @remarks the name is not "ValidationError", to avoid collisions with app error classes
     */
    ValidationError: "CcValidationError",
};
/**
 * Errors which are never reported by default
 * @remarks A ValidationError is a normal part of the form flow and a NetworkError is usually the
 *          user's connection. Neither is actionable. BackendError and code errors (Error,
 *          TypeError, ...) are reported.
 */
export const DefaultUnreportedErrorNames = [
    CcErrorNames.ValidationError,
    CcErrorNames.NetworkError,
];
/**
 * The errors an error wraps, read by its name, so one from another copy of the library, or
 * an AggregateError from another realm, counts too: a PartialApplyError's
 * `failures[].error`, a PartialDeleteError's `cause`, an AggregateError's `errors`
 * @param error The error to read
 * @returns The errors, one per failure (a PartialDeleteError's one cause, also an absent
 *          one); null if it is none of them, or a PartialApplyError that lists no failures,
 *          or an AggregateError that holds no errors
 */
const wrappedErrorsOf = (error) => {
    if (error.name === CcErrorNames.PartialDeleteError)
        return [error.cause];
    if (error.name === "AggregateError") {
        const errors = error.errors;
        return Array.isArray(errors) && errors.length > 0 ? errors : null;
    }
    if (error.name !== CcErrorNames.PartialApplyError)
        return null;
    const failures = error
        .failures;
    if (!Array.isArray(failures) || failures.length === 0)
        return null;
    return failures.map((failure) => failure?.error);
};
/**
 * The default reporting policy: every error except those named in
 * DefaultUnreportedErrorNames or in the call site's `ignoreNames`
 * @remarks A PartialApplyError (CcErrorNames.PartialApplyError) is judged by the errors of
 *          its failed writes: it is reported if at least one of them would be reported on
 *          its own, and not if none would, e.g. when all are NetworkErrors because the
 *          connection dropped while a Form's save sent a lazy control's queue. A failure
 *          whose error is no Error counts as reported. A PartialDeleteError
 *          (CcErrorNames.PartialDeleteError) is judged the same way by its `cause`, the
 *          error its deletes failed with; one without a cause, or whose cause is no
 *          Error, is reported. An AggregateError is judged the same way by its `errors`,
 *          e.g. the one LazyConnector's workQueue rejects with when several queued writes
 *          failed and no queue error factory is set; one without errors is reported.
 * @see DefaultUnreportedErrorNames
 */
export const defaultShouldReportError = (error, context) => {
    if (DefaultUnreportedErrorNames.includes(error.name) ||
        (context.ignoreNames ?? []).includes(error.name))
        return false;
    const wrappedErrors = wrappedErrorsOf(error);
    if (!wrappedErrors)
        return true;
    return wrappedErrors.some((wrappedError) => !(wrappedError instanceof Error) ||
        defaultShouldReportError(wrappedError, context));
};
/**
 * The default reporter: Sentry, if @sentry/react is installed, otherwise a no-op
 */
export const defaultErrorReporter = (error, context) => {
    void sentryCaptureException.then((captureException) => captureException?.(error, {
        extra: { ccSource: context.source, ...context.extra },
    }));
};
const ErrorReporting = {
    shouldReport: defaultShouldReportError,
    report: defaultErrorReporter,
    logToConsole: false,
};
/**
 * Configures global error reporting. Call this from your application's startup code.
 * @param config The settings to overwrite (unset keys keep their current value)
 */
export const configureErrorReporting = (config) => {
    Object.assign(ErrorReporting, config);
};
/**
 * The currently active error reporting config
 */
export const getErrorReportingConfig = () => ErrorReporting;
/**
 * Report an unexpected error to the configured error tracker
 * @param error The error which has happened (non-Error values are wrapped)
 * @param context Information about where the error came from
 * @remarks Never throws and never rethrows. This does NOT handle the error, the caller is still
 *          responsible for displaying it to the user if appropriate.
 * @see configureErrorReporting
 */
export const captureError = (error, context) => {
    const err = error instanceof Error
        ? error
        : new Error(`Non-Error value thrown: ${String(error)}`);
    if (ErrorReporting.logToConsole) {
        // eslint-disable-next-line no-console
        console.error(`[Components-Care] [${context.source}]`, err);
    }
    try {
        if (!ErrorReporting.shouldReport(err, context))
            return;
        ErrorReporting.report(err, context);
    }
    catch (e) {
        // error reporting must never break the app
        // eslint-disable-next-line no-console
        console.error("[Components-Care] [ErrorReporting] reporter threw", e);
    }
};
