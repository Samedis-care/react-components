import { useContext, useEffect } from "react";
import { FormDialogDispatchContext } from "./FormDialog";
/**
 * Shows controls in the title row of the enclosing `FullFormDialog` while the calling
 * component is mounted, e.g. the actions of a page (Edit, More) that can open as a page or in
 * a dialog. They are shown after the title, before the dialog's "Open in new tab" and close
 * buttons, in that tab order, and outside the heading: the title alone names the dialog, also
 * when it takes the keyboard focus (see `useSetFormDialogTitle`). Set the title with
 * `useSetFormDialogTitle` and the controls with this hook, rather than putting them into the
 * title. When they don't fit beside the title (on a phone), they move below it.
 * The dialog renders them in its title row, outside the calling component, so they don't see
 * the contexts of the content (e.g. the form's `FormContext`): wrap them in the providers they
 * need, as for a title.
 * When the controls are set again, the new ones replace them; when the caller unmounts or
 * passes enabled false, the dialog shows its `titleAction` prop again (none by default). One
 * component per dialog sets them: when several do, the last one set shows, and the first that
 * unmounts removes them.
 * @param enabled Whether to set the controls; false sets nothing
 * @param action The controls, any content, e.g. `IconButton`s with an `aria-label`; null for
 * none. Every new value is set again, so keep an element stable (useMemo).
 * @returns Whether the controls went to a dialog (enabled and inside a FullFormDialog).
 * Render them yourself only when it is false.
 */
const useSetFormDialogTitleAction = (enabled, action) => {
    const formDialogDispatch = useContext(FormDialogDispatchContext);
    useEffect(() => {
        if (!enabled)
            return;
        if (!formDialogDispatch)
            return;
        formDialogDispatch.setTitleAction(action);
        return () => {
            formDialogDispatch.setTitleAction(null);
        };
    }, [formDialogDispatch, enabled, action]);
    return enabled && !!formDialogDispatch;
};
export default useSetFormDialogTitleAction;
