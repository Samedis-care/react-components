import { jsx as _jsx } from "react/jsx-runtime";
import React, { useCallback } from "react";
import { useDialogContext } from "../../framework/DialogContextProvider";
import { ErrorDialog } from "../../non-standalone/Dialog";
import useCCTranslations from "../../utils/useCCTranslations";
import { dotToObject } from "../../utils/dotUtils";
import renderModelCell from "./renderModelCell";
/**
 * The cell of a field with an editable overview visibility (ModelVisibilityGridEdit):
 * renders the field's control and saves every change at once, as
 * `{ id, [field]: value }` serialized for "overview", through model.connector.update.
 * Saved or refused, refreshGrid is called. A refused save is shown in an error dialog
 * naming the field and the error, and the reload shows the stored value again.
 * Needs the Framework (dialogs, translations).
 */
const InlineEditCell = (props) => {
    const { model, field, record, refreshGrid } = props;
    const [pushDialog] = useDialogContext();
    const { t } = useCCTranslations();
    const handleChange = useCallback((changed, value) => {
        const { id } = record;
        if (!id)
            throw new Error("ID not set!");
        void (async () => {
            try {
                await model.connector.update(await model.applySerialization({ id, ...dotToObject(changed, value) }, "serialize", "overview"));
            }
            catch (error) {
                refreshGrid();
                pushDialog(_jsx(ErrorDialog, { title: t("common.dialogs.error-title"), message: t("backend-components.data-grid.inline-edit.error-dialog.message", {
                        LABEL: model.fields[field].getLabel(),
                        ERROR: error instanceof Error ? error.message : String(error),
                    }), buttons: [{ text: t("common.buttons.ok"), autoFocus: true }] }));
                return;
            }
            refreshGrid();
        })();
    }, [model, field, record, refreshGrid, pushDialog, t]);
    return renderModelCell(model, field, record, handleChange);
};
export default React.memo(InlineEditCell);
