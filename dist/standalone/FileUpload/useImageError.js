import { useCallback, useContext } from "react";
import useCCTranslations from "../../utils/useCCTranslations";
import { isImageLoadError } from "../../utils/ImageLoadError";
import { captureError } from "../../framework/ErrorReporting";
import { DialogContext } from "../../framework/DialogContextProvider";
import { showErrorDialog } from "../../non-standalone/Dialog/Utils";
/**
 * Common error handling for the components which let the user select images
 * @param source Human readable identifier of the call site, for error reports
 * @param onError The owner's error handler. If unset, an error dialog is shown.
 */
const useImageError = (source, onError) => {
    const { t } = useCCTranslations();
    // this is standalone, so this has to be optional. framework might not be present.
    const dialogContext = useContext(DialogContext);
    return useCallback((error) => {
        const err = error instanceof Error
            ? error
            : new Error(`Non-Error value thrown: ${String(error)}`);
        // an image the browser can't decode (HEIC, TIFF, a corrupt file) is the common case here
        // and gets a message the user can act on, everything else stays generic
        const message = t(isImageLoadError(err)
            ? "standalone.file-upload.error.image-load-failed"
            : "standalone.file-upload.error.image-process-failed");
        captureError(err, { source });
        if (onError) {
            onError(err, message);
            return;
        }
        if (dialogContext) {
            const [pushDialog] = dialogContext;
            void showErrorDialog(pushDialog, message);
            return;
        }
        // no way to reach the user, at least don't fail silently
        // eslint-disable-next-line no-console
        console.error(`[Components-Care] [${source}] ${message}`, err);
    }, [t, source, onError, dialogContext]);
};
export default useImageError;
