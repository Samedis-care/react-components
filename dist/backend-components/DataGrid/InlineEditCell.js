import { jsx as _jsx } from "react/jsx-runtime";
import React, { useCallback, useMemo } from "react";
import { useModelMutation, } from "../../backend-integration/Model/Model";
import { useDialogContext } from "../../framework/DialogContextProvider";
import { ErrorDialog } from "../../non-standalone/Dialog";
import useCCTranslations from "../../utils/useCCTranslations";
import { dotToObject } from "../../utils/dotUtils";
import { useRowLabel } from "../../standalone/DataGrid/Content/RowLabel";
import renderModelCell from "./renderModelCell";
/**
 * The cell of a field with an editable overview visibility (ModelVisibilityGridEdit):
 * renders the field's control and saves every change at once, as
 * `{ id, [field]: value }` serialized for "overview", through the model's mutation
 * (useModelMutation), like any other update: the model's cache of the record then holds
 * the saved record, and hooks.onCreateOrUpdate and the "mutate" listeners hear of it.
 * Saved or refused, refreshGrid is called. A refused save is shown in an error dialog
 * naming the field and the error, and the reload shows the stored value again. The
 * control is named after its field and the row ("Active, Carol Jones"), with the row
 * label its checkbox uses (RowLabel), since a grid cell has no label element to name it.
 * Needs the Framework (dialogs, translations, the model's query client).
 */
const InlineEditCell = (props) => {
    const { model, field, record, refreshGrid } = props;
    const [pushDialog] = useDialogContext();
    const { t } = useCCTranslations();
    const { mutateAsync: updateRecord } = useModelMutation(model, "overview");
    // the row's label as its checkbox uses it, composed here so that the name follows
    // a language switch and a getRowLabel replaced after mount
    const rowLabel = useRowLabel();
    const gridCellLabel = useMemo(() => rowLabel
        ? t("backend-components.data-grid.inline-edit.cell-control-label", {
            FIELD: model.fields[field].getLabel(),
            ROW: rowLabel,
        })
        : undefined, [model, field, rowLabel, t]);
    const handleChange = useCallback((changed, value) => {
        const { id } = record;
        if (!id)
            throw new Error("ID not set!");
        void (async () => {
            try {
                await updateRecord({ id, ...dotToObject(changed, value) });
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
    }, [model, field, record, refreshGrid, pushDialog, t, updateRecord]);
    return renderModelCell(model, field, record, handleChange, gridCellLabel);
};
export default React.memo(InlineEditCell);
