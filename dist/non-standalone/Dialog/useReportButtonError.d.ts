/**
 * Handles what a dialog button's `onClick` threw or rejected with (internal; ErrorDialog,
 * FormDialog): reports it through captureError and shows it to the user in an error dialog
 * (showErrorDialog) over the dialog. Outside a DialogContext, where no dialog can be pushed,
 * it is logged to the console instead.
 * @param source Where it happened, for the error report (ErrorReportContext.source)
 * @returns The handler, which never throws
 */
export declare const useReportButtonError: (source: string) => ((error: unknown) => void);
