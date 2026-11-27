import { useCallback, useContext } from "react";
import { DialogContext } from "../../framework/DialogContextProvider";
import { captureError } from "../../framework/ErrorReporting";
import { showErrorDialog } from "./Utils";

/**
 * Handles what a dialog button's `onClick` threw or rejected with (internal; ErrorDialog,
 * FormDialog): reports it through captureError and shows it to the user in an error dialog
 * (showErrorDialog) over the dialog. Outside a DialogContext, where no dialog can be pushed,
 * it is logged to the console instead.
 * @param source Where it happened, for the error report (ErrorReportContext.source)
 * @returns The handler, which never throws
 */
export const useReportButtonError = (
	source: string,
): ((error: unknown) => void) => {
	const dialogContext = useContext(DialogContext);
	return useCallback(
		(error: unknown) => {
			captureError(error, { source });
			if (dialogContext) {
				const [pushDialog] = dialogContext;
				void showErrorDialog(pushDialog, error);
				return;
			}
			// no way to reach the user, at least don't fail silently
			// eslint-disable-next-line no-console
			console.error(`[Components-Care] [${source}]`, error);
		},
		[source, dialogContext],
	);
};
