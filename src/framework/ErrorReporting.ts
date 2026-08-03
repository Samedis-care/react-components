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
	.then(
		(Sentry) =>
			Sentry.captureException as (
				e: Error,
				hint?: { extra?: Record<string, unknown> },
			) => void,
	)
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
	 * @see RequestBatchingError
	 */
	RequestBatchingError: "RequestBatchingError",
	/**
	 * @see ValidationError
	 * @remarks the name is not "ValidationError", to avoid collisions with app error classes
	 */
	ValidationError: "CcValidationError",
} as const;

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
export type ShouldReportErrorCallback = (
	error: Error,
	context: ErrorReportContext,
) => boolean;

/**
 * Forwards the error to an error tracker
 * @param error The error which has happened
 * @param context Information about where the error came from
 * @remarks This cannot be used to handle errors. Also treat these errors as unhandled.
 */
export type ErrorReporterCallback = (
	error: Error,
	context: ErrorReportContext,
) => void;

/**
 * Errors which are never reported by default
 * @remarks A ValidationError is a normal part of the form flow and a NetworkError is usually the
 *          user's connection. Neither is actionable. BackendError and code errors (Error,
 *          TypeError, ...) are reported.
 */
export const DefaultUnreportedErrorNames: string[] = [
	CcErrorNames.ValidationError,
	CcErrorNames.NetworkError,
];

/**
 * The default reporting policy
 * @see DefaultUnreportedErrorNames
 */
export const defaultShouldReportError: ShouldReportErrorCallback = (
	error,
	context,
) =>
	!DefaultUnreportedErrorNames.includes(error.name) &&
	!(context.ignoreNames ?? []).includes(error.name);

/**
 * The default reporter: Sentry, if @sentry/react is installed, otherwise a no-op
 */
export const defaultErrorReporter: ErrorReporterCallback = (error, context) => {
	void sentryCaptureException.then((captureException) =>
		captureException?.(error, {
			extra: { ccSource: context.source, ...context.extra },
		}),
	);
};

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

const ErrorReporting: ErrorReportingConfig = {
	shouldReport: defaultShouldReportError,
	report: defaultErrorReporter,
	logToConsole: false,
};

/**
 * Configures global error reporting. Call this from your application's startup code.
 * @param config The settings to overwrite (unset keys keep their current value)
 */
export const configureErrorReporting = (
	config: Partial<ErrorReportingConfig>,
): void => {
	Object.assign(ErrorReporting, config);
};

/**
 * The currently active error reporting config
 */
export const getErrorReportingConfig = (): Readonly<ErrorReportingConfig> =>
	ErrorReporting;

/**
 * Report an unexpected error to the configured error tracker
 * @param error The error which has happened (non-Error values are wrapped)
 * @param context Information about where the error came from
 * @remarks Never throws and never rethrows. This does NOT handle the error, the caller is still
 *          responsible for displaying it to the user if appropriate.
 * @see configureErrorReporting
 */
export const captureError = (
	error: unknown,
	context: ErrorReportContext,
): void => {
	const err =
		error instanceof Error
			? error
			: new Error(`Non-Error value thrown: ${String(error)}`);
	if (ErrorReporting.logToConsole) {
		// eslint-disable-next-line no-console
		console.error(`[Components-Care] [${context.source}]`, err);
	}
	try {
		if (!ErrorReporting.shouldReport(err, context)) return;
		ErrorReporting.report(err, context);
	} catch (e) {
		// error reporting must never break the app
		// eslint-disable-next-line no-console
		console.error("[Components-Care] [ErrorReporting] reporter threw", e);
	}
};
