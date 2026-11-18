import { jsx as _jsx } from "react/jsx-runtime";
import { pushDialogPromise } from "../Dialog/pushDialogPromise";
import LocaleSelectorDialog from "./LocaleSelectorDialog";
/**
 * Shows the {@link LocaleSelectorDialog} and returns the locale the user picks
 * @param pushDialog The dialog context's (useDialogContext()) pushDialog function
 * @param props The dialog's props, without `onChange` and `onClose`, which the promise
 *              replaces; e.g. `{ supportedLocales: ["de", "en"] }`
 * @returns A DialogPromise that resolves to the picked locale (`"<lang>-<COUNTRY>"`,
 *          e.g. `"de-AT"`) once `ComponentsCareI18n` has applied it (the dialog then
 *          closes), also when the current locale is picked again. It resolves to `null`
 *          when the dialog is dismissed: the close button, Escape or a backdrop click
 *          (ignored while a picked language loads). A language that fails to load
 *          resolves nothing: an error dialog shows, and the dialog stays open. Its
 *          `close()` closes the dialog and resolves to `null` at once, also while a
 *          picked language loads, which then still applies. It never rejects.
 * @example
 * const locale = await showLocaleSelectorDialog(pushDialog, {
 * 	supportedLocales: ["de", "en"],
 * });
 * if (locale) await saveUserLanguage(locale);
 */
export const showLocaleSelectorDialog = (pushDialog, props) => pushDialogPromise(pushDialog, (resolve) => (_jsx(LocaleSelectorDialog, { ...props, onChange: resolve, onClose: () => resolve(null) })), (resolve) => resolve(null));
