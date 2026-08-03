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
/**
 * The Error.name of every error class raised by components-care
 * @remarks Components-Care errors are discriminated by name (and not by instanceof), because the
 *          error classes live in different tiers and may cross bundle boundaries.
 */
export declare const CcErrorNames: {
    /**
     * @see BackendError
     */
    readonly BackendError: "BackendError";
    /**
     * @see NetworkError
     */
    readonly NetworkError: "NetworkError";
    /**
     * @see RequestBatchingError
     */
    readonly RequestBatchingError: "RequestBatchingError";
    /**
     * @see ValidationError
     * @remarks the name is not "ValidationError", to avoid collisions with app error classes
     */
    readonly ValidationError: "CcValidationError";
};
export type CcErrorName = (typeof CcErrorNames)[keyof typeof CcErrorNames];
/**
 * Information about where a reported error came from
 */
export interface ErrorReportContext {
    /**
     * Human readable identifier of the call site, e.g. "FormEngine.submit"
     */
    source: string;
    /**
     * Error names which this specific call site considers expected
     * @remarks Honored by defaultShouldReportError. A custom shouldReport callback may ignore it.
     */
    ignoreNames?: string[];
    /**
     * Additional structured data to attach to the report
     */
    extra?: Record<string, unknown>;
}
/**
 * Decides if the given error should be reported to the error tracker
 * @param error The error which has happened
 * @param context Information about where the error came from
 * @returns true to report the error
 */
export type ShouldReportErrorCallback = (error: Error, context: ErrorReportContext) => boolean;
/**
 * Forwards the error to an error tracker
 * @param error The error which has happened
 * @param context Information about where the error came from
 * @remarks This cannot be used to handle errors. Also treat these errors as unhandled.
 */
export type ErrorReporterCallback = (error: Error, context: ErrorReportContext) => void;
/**
 * Errors which are never reported by default
 * @remarks A ValidationError is a normal part of the form flow and a NetworkError is usually the
 *          user's connection. Neither is actionable. BackendError and code errors (Error,
 *          TypeError, ...) are reported.
 */
export declare const DefaultUnreportedErrorNames: string[];
/**
 * The default reporting policy
 * @see DefaultUnreportedErrorNames
 */
export declare const defaultShouldReportError: ShouldReportErrorCallback;
/**
 * The default reporter: Sentry, if @sentry/react is installed, otherwise a no-op
 */
export declare const defaultErrorReporter: ErrorReporterCallback;
export interface ErrorReportingConfig {
    /**
     * Which errors get reported
     */
    shouldReport: ShouldReportErrorCallback;
    /**
     * Where reported errors go
     */
    report: ErrorReporterCallback;
    /**
     * Also console.error every error passed to captureError, regardless of shouldReport
     * @remarks Disabled by default, the call sites which want console output already do it themselves
     */
    logToConsole: boolean;
}
/**
 * Configures global error reporting. Call this from your application's startup code.
 * @param config The settings to overwrite (unset keys keep their current value)
 */
export declare const configureErrorReporting: (config: Partial<ErrorReportingConfig>) => void;
/**
 * The currently active error reporting config
 */
export declare const getErrorReportingConfig: () => Readonly<ErrorReportingConfig>;
/**
 * Report an unexpected error to the configured error tracker
 * @param error The error which has happened (non-Error values are wrapped)
 * @param context Information about where the error came from
 * @remarks Never throws and never rethrows. This does NOT handle the error, the caller is still
 *          responsible for displaying it to the user if appropriate.
 * @see configureErrorReporting
 */
export declare const captureError: (error: unknown, context: ErrorReportContext) => void;
