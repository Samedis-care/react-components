import { jsx as _jsx } from "react/jsx-runtime";
import React, { useCallback, useMemo, useState } from "react";
import DataGrid from "../../standalone/DataGrid/DataGrid";
import { useModelDeleteAdvanced, useModelDeleteMultiple, } from "../../backend-integration/Model/Model";
import { useDialogContext } from "../../framework/DialogContextProvider";
import { useToastContext } from "../../framework/ToastContextProvider";
import { ErrorDialog, showConfirmDialog } from "../../non-standalone/Dialog";
import useCCTranslations from "../../utils/useCCTranslations";
import { dotToObject, getValueByDot } from "../../utils/dotUtils";
import deepAssign from "../../utils/deepAssign";
import deepClone from "../../utils/deepClone";
import isPlainObject from "../../utils/isPlainObject";
import InlineEditCell from "./InlineEditCell";
import ModelCell from "./ModelCell";
import renderModelCell from "./renderModelCell";
import ccI18n from "../../i18n";
export const useBackendDataGridAddNewButtons = (props) => {
    const { t } = useCCTranslations();
    const addNewButtons = useMemo(() => {
        if (!props.additionalNewButtons)
            return props.onAddNew;
        if (!props.onAddNew)
            return props.additionalNewButtons;
        let result;
        if (typeof props.onAddNew === "function") {
            result = [
                {
                    label: t("standalone.data-grid.header.new") ?? "",
                    onClick: props.onAddNew,
                },
            ];
        }
        else if (typeof props.onAddNew === "string") {
            result = [
                {
                    label: t("standalone.data-grid.header.new") ?? "",
                    onClick: undefined,
                    disableHint: props.onAddNew,
                },
            ];
        }
        else if (Array.isArray(props.onAddNew)) {
            result = props.onAddNew;
        }
        else {
            result = [];
        }
        result = result.concat(props.additionalNewButtons);
        return result;
    }, [props.additionalNewButtons, props.onAddNew, t]);
    return addNewButtons;
};
/**
 * useBackendDataGridDeleteHandler, together with whether the handler's delete
 * request runs (DataGridProps.deleting)
 * @param props The delete props of BackendDataGrid
 * @param refreshGrid Called after the delete ran, failed or not, to reload the rows
 */
const useBackendDataGridDelete = (props, refreshGrid) => {
    const { model, enableDelete, enableDeleteAll, customDeleteConfirm, customDeleteErrorHandler, customDeleteSuccessHandler, onDeleteSettled, } = props;
    const { t } = useCCTranslations();
    const [pushDialog] = useDialogContext();
    const [showToast] = useToastContext();
    if (enableDeleteAll && !model.doesSupportAdvancedDeletion()) {
        throw new Error("Delete All functionality requested, but not provided by model backend connector");
    }
    const { mutateAsync: deleteAdvanced, isPending: deletingAdvanced } = useModelDeleteAdvanced(model);
    const { mutateAsync: deleteMultiple, isPending: deletingMultiple } = useModelDeleteMultiple(model);
    const handleDelete = useCallback(async (invert, ids, filter) => {
        try {
            if (customDeleteConfirm) {
                await customDeleteConfirm(invert, ids, filter);
            }
            else {
                await showConfirmDialog(pushDialog, {
                    title: t("backend-components.data-grid.delete.confirm-dialog.title"),
                    message: t("backend-components.data-grid.delete.confirm-dialog." +
                        (invert ? "messageInverted" : "message"), { count: ids.length }),
                    textButtonYes: t("backend-components.data-grid.delete.confirm-dialog.buttons.yes"),
                    textButtonNo: t("backend-components.data-grid.delete.confirm-dialog.buttons.no"),
                });
            }
        }
        catch (e) {
            // user cancelled
            // eslint-disable-next-line no-console
            console.error(e);
            return false;
        }
        let error;
        try {
            if (enableDeleteAll) {
                await deleteAdvanced([invert, ids, filter]);
            }
            else {
                await deleteMultiple(ids);
            }
        }
        catch (e) {
            error = e;
        }
        refreshGrid();
        if (!error) {
            // before onDeleteSettled, which may throw
            if (customDeleteSuccessHandler) {
                customDeleteSuccessHandler(invert, ids, filter);
            }
            else {
                showToast({
                    severity: "success",
                    message: invert
                        ? t("backend-components.data-grid.delete.success-toast.messageInverted")
                        : t("backend-components.data-grid.delete.success-toast.message", {
                            count: ids.length,
                        }),
                });
            }
        }
        onDeleteSettled?.(invert, ids, filter, error);
        if (!error)
            return true;
        if (customDeleteErrorHandler) {
            await customDeleteErrorHandler(error);
        }
        else {
            pushDialog(_jsx(ErrorDialog, { title: t("backend-components.data-grid.delete.error-dialog.title"), message: t("backend-components.data-grid.delete.error-dialog.message", { ERROR: error.message }), buttons: [
                    {
                        text: t("backend-components.data-grid.delete.error-dialog.buttons.okay"),
                    },
                ] }));
        }
        return true;
    }, [
        customDeleteConfirm,
        customDeleteErrorHandler,
        customDeleteSuccessHandler,
        onDeleteSettled,
        pushDialog,
        showToast,
        t,
        enableDeleteAll,
        refreshGrid,
        deleteAdvanced,
        deleteMultiple,
    ]);
    return {
        handleDelete: enableDelete ? handleDelete : undefined,
        deleting: deletingAdvanced || deletingMultiple,
    };
};
/**
 * The delete handler BackendDataGrid passes to DataGrid as onDelete: it asks for
 * confirmation (customDeleteConfirm or the built-in dialog), deletes through the
 * model, calls refreshGrid, announces the delete (customDeleteSuccessHandler or a
 * toast such as "2 entries deleted"), calls onDeleteSettled, and reports a failure
 * (customDeleteErrorHandler or the built-in error dialog). It needs the Framework
 * (its dialogs and toasts).
 * @param props The delete props of BackendDataGrid
 * @param refreshGrid Called after the delete ran, failed or not, to reload the rows
 * @returns The handler, or undefined without enableDelete. The handler resolves false
 *          when the user cancels the confirmation: nothing was deleted, so the grid
 *          keeps the selection. It resolves true once the delete ran, also when it
 *          failed (a failed delete may have deleted some of the records).
 */
export const useBackendDataGridDeleteHandler = (props, refreshGrid) => useBackendDataGridDelete(props, refreshGrid).handleDelete;
/**
 * Turns a record from model.index into a grid row: `row.id` is the record's id,
 * `row[field]` the rendered cell of each model field and `row[field + "_raw"]` its
 * value. A cell renders again in components-care's current language when it changes
 * (ModelCell), since the renderers translate while they render ("Yes", enum labels,
 * formatted dates). A field with an editable overview visibility
 * (ModelVisibilityGridEdit) is edited in its cell (InlineEditCell), which needs the
 * Framework: the control shows a change at once and saves it through the model's
 * mutation (useModelMutation, so the model's cache, hooks and "mutate" listeners hear of
 * it). Once saved, the DataGrid the row is in replaces the row with the row of the saved
 * record, without a reload, so the selection and the focused control stay; a refused
 * save is shown in an error dialog, and the control shows the row's value again. The
 * cell's control is named after its field and the row ("Active, example.com"), since a
 * grid cell has no label element to name it.
 * @param model The model the record belongs to
 * @returns A function that builds the row of one record. It throws "Not supported"
 *          for an editable field whose renderer has no grid editor.
 */
export const renderDataGridRecordUsingModel = (model) => {
    const renderRow = (entry) => Object.fromEntries(Object.keys(model.fields)
        .map((key) => {
        // we cannot render the ID, this will cause issues with the selection
        const value = getValueByDot(key, entry);
        if (key === "id") {
            return [
                [key, value],
                [key + "_raw", value],
            ];
        }
        const field = model.fields[key];
        // no need to render disabled fields
        if (field.visibility.overview.disabled) {
            return [
                [key, value],
                [key + "_raw", value],
            ];
        }
        // rendered while loading, for an editable field too, so that a renderer
        // without a grid editor fails the load ("Not supported") instead of the
        // grid's render
        const cell = renderModelCell(model, key, entry);
        return [
            [
                key,
                field.visibility.overview.editable ? (_jsx(InlineEditCell, { model: model, field: key, record: entry, renderRow: renderRow })) : (_jsx(ModelCell, { model: model, field: key, record: entry, language: ccI18n.language, children: cell })),
            ],
            [key + "_raw", value],
        ];
    })
        .flat());
    return renderRow;
};
/**
 * The record a row of renderDataGridRecordUsingModel was rendered from: the
 * values of the model's fields before rendering, put together as the model's
 * deserialization does
 * @param model The model the row was rendered with
 * @param row The row
 */
const dataGridRowToModelRecord = (model, row) => {
    const record = {};
    for (const key of Object.keys(model.fields)) {
        const value = row[key + "_raw"];
        deepAssign(record, dotToObject(key, isPlainObject(value) ? deepClone(value) : value));
    }
    return record;
};
/**
 * DataGridProps.getRowLabel for a grid whose rows renderDataGridRecordUsingModel
 * rendered, from a getRowLabel that takes the model's record
 * (BackendDataGridProps.getRowLabel)
 * @param model The model the rows are rendered with
 * @param getRowLabel The row label from the model's record, or undefined for
 *                    the grid's default
 * @returns The grid's getRowLabel, undefined without getRowLabel
 */
export const useBackendDataGridRowLabel = (model, getRowLabel) => useMemo(() => getRowLabel &&
    ((row) => getRowLabel(dataGridRowToModelRecord(model, row))), [model, getRowLabel]);
const BackendDataGrid = (props, ref) => {
    const { model } = props;
    const [refreshToken, setRefreshToken] = useState("");
    const refreshGrid = useCallback(() => setRefreshToken(new Date().getTime().toString()), []);
    const loadData = useCallback(async (params) => {
        const [result, meta] = await model.index(params);
        return {
            rowsTotal: meta.totalRows,
            rowsFiltered: meta.filteredRows,
            rows: result.map(renderDataGridRecordUsingModel(model)),
        };
    }, [model]);
    const addNewButtons = useBackendDataGridAddNewButtons(props);
    const { handleDelete, deleting } = useBackendDataGridDelete(props, refreshGrid);
    const getRowLabel = useBackendDataGridRowLabel(model, props.getRowLabel);
    return (_jsx(DataGrid, { ...props, ref: ref, getRowLabel: getRowLabel, onAddNew: addNewButtons, onDelete: handleDelete, deleting: deleting, loadData: loadData, columns: useMemo(() => model.toDataGridColumnDefinition(), [model]), forceRefreshToken: `${props.forceRefreshToken || "undefined"}${refreshToken}`, exporters: props.disableExport ? undefined : model.connector.dataGridExporters }));
};
export default React.memo(React.forwardRef(BackendDataGrid));
