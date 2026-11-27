import { jsx as _jsx } from "react/jsx-runtime";
import React, { useCallback, useContext, useMemo, useRef, useState, } from "react";
import { useModelMutation, } from "../../backend-integration/Model/Model";
import { useDialogContext } from "../../framework/DialogContextProvider";
import { ErrorDialog } from "../../non-standalone/Dialog";
import useCCTranslations from "../../utils/useCCTranslations";
import { dotSet, dotToObject, getValueByDot } from "../../utils/dotUtils";
import deepAssign from "../../utils/deepAssign";
import deepClone from "../../utils/deepClone";
import isPlainObject from "../../utils/isPlainObject";
import { useRowLabel } from "../../standalone/DataGrid/Content/RowLabel";
import { DataGridUpdateRowContext, } from "../../standalone/DataGrid/DataGrid";
import renderModelCell from "./renderModelCell";
/**
 * The record of a row once a change in it was saved: each field of the model as the
 * save returned it, or as the row had it where the saved record has no value for it (a
 * field the connector's response leaves out, or one the model drops when it deserializes
 * the response for "edit", while the row was deserialized for "overview")
 * @param model The model
 * @param row The record the row was built from
 * @param saved The record the save returned
 * @returns A new record; neither row nor saved is changed
 */
const mergeSavedRecord = (model, row, saved) => {
    const merged = {};
    for (const key of Object.keys(model.fields)) {
        const savedValue = getValueByDot(key, saved);
        const value = savedValue === undefined ? getValueByDot(key, row) : savedValue;
        if (value === undefined)
            continue;
        // deepAssign merges into the objects it assigned, so they have to be copies
        deepAssign(merged, dotToObject(key, isPlainObject(value) ? deepClone(value) : value));
    }
    return merged;
};
/**
 * The cell of a field with an editable overview visibility (ModelVisibilityGridEdit):
 * renders the field's control and saves every change at once, as
 * `{ id, [field]: value }` serialized for "overview", through the model's mutation
 * (useModelMutation), like any other update: the model's cache of the record then holds
 * the saved record, and hooks.onCreateOrUpdate and the "mutate" listeners hear of it.
 *
 * The control shows a change at once, while it is saved. Once saved, the cell's row is
 * replaced with the row of the saved record (the DataGrid's updateRow), without a reload:
 * the selection, the scroll position and the focused control stay, and the row stays
 * where it is until the grid reloads, also if it no longer matches the grid's filter or
 * sort. Each field takes the saved record's value, or keeps the row's where the saved
 * record has none (see mergeSavedRecord). One save runs at a time: a change made while
 * one runs is shown at once and saved once it is done, the last of several such changes
 * only, and none if it is the value just saved.
 *
 * A refused save is shown in an error dialog naming the field and the error, and the
 * control shows the row's value again; a change made during that save is dropped with
 * it. The control is named after its field and the row ("Active, Carol Jones"), with the
 * row label its checkbox uses (RowLabel), since a grid cell has no label element to name
 * it. Needs the Framework (dialogs, translations, the model's query client).
 * @remarks Outside a DataGrid there is no row to replace: the control shows the record
 *          it is given again once the save is done.
 */
const InlineEditCell = (props) => {
    const { model, field, record, renderRow } = props;
    const updateRow = useContext(DataGridUpdateRowContext);
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
    // the value of the last change, shown while it is saved
    const [pending, setPending] = useState(null);
    // whether a save runs, and the change made meanwhile, which is saved after it
    const saving = useRef(false);
    const queued = useRef(null);
    // a save reads these when it is done, from the latest render
    const current = { model, field, record, renderRow, updateRow, pushDialog, t };
    const latest = useRef(current);
    latest.current = current;
    const save = useCallback(async (id, changed, first) => {
        saving.current = true;
        try {
            let value = first;
            for (;;) {
                let saved;
                try {
                    [saved] = await updateRecord({
                        id,
                        ...dotToObject(changed, value),
                    });
                }
                catch (error) {
                    // a change made meanwhile goes with it: the row's value shows again
                    queued.current = null;
                    setPending(null);
                    const failed = latest.current;
                    failed.pushDialog(_jsx(ErrorDialog, { title: failed.t("common.dialogs.error-title"), message: failed.t("backend-components.data-grid.inline-edit.error-dialog.message", {
                            LABEL: failed.model.fields[failed.field].getLabel(),
                            ERROR: error instanceof Error ? error.message : String(error),
                        }), buttons: [
                            { text: failed.t("common.buttons.ok"), autoFocus: true },
                        ] }));
                    return;
                }
                const done = latest.current;
                const row = mergeSavedRecord(done.model, done.record, saved);
                done.updateRow?.(id, done.renderRow(row));
                const next = queued.current;
                queued.current = null;
                if (!next || next.value === getValueByDot(changed, row)) {
                    setPending(null);
                    return;
                }
                value = next.value;
            }
        }
        finally {
            saving.current = false;
        }
    }, [updateRecord]);
    const handleChange = useCallback((changed, value) => {
        const { id } = record;
        if (!id)
            throw new Error("ID not set!");
        setPending({ value });
        if (saving.current) {
            queued.current = { value };
            return;
        }
        void save(id, changed, value);
    }, [record, save]);
    const shown = useMemo(() => (pending ? dotSet(field, record, pending.value) : record), [pending, field, record]);
    return renderModelCell(model, field, shown, handleChange, gridCellLabel);
};
export default React.memo(InlineEditCell);
