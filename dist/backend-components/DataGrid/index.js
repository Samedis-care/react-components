import React, { useCallback, useMemo, useState } from "react";
import DataGrid from "../../standalone/DataGrid/DataGrid";
import { useModelDeleteAdvanced, useModelDeleteMultiple, } from "../../backend-integration/Model/Model";
import { useDialogContext } from "../../framework/DialogContextProvider";
import { ErrorDialog, showConfirmDialog } from "../../non-standalone/Dialog";
import useCCTranslations from "../../utils/useCCTranslations";
import { dotToObject, getValueByDot } from "../../utils/dotUtils";
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
export const useBackendDataGridDeleteHandler = (props, refreshGrid) => {
    const { model, enableDelete, enableDeleteAll, customDeleteConfirm, customDeleteErrorHandler, } = props;
    const { t } = useCCTranslations();
    const [pushDialog] = useDialogContext();
    if (enableDeleteAll && !model.doesSupportAdvancedDeletion()) {
        throw new Error("Delete All functionality requested, but not provided by model backend connector");
    }
    const { mutateAsync: deleteAdvanced } = useModelDeleteAdvanced(model);
    const { mutateAsync: deleteMultiple } = useModelDeleteMultiple(model);
    const handleDelete = useCallback(async (invert, ids, filter) => {
        try {
            if (customDeleteConfirm) {
                await customDeleteConfirm(invert, ids, filter);
            }
            else {
                await showConfirmDialog(pushDialog, {
                    title: t("backend-components.data-grid.delete.confirm-dialog.title"),
                    message: t("backend-components.data-grid.delete.confirm-dialog." +
                        (invert ? "messageInverted" : "message"), { NUM: ids.length }),
                    textButtonYes: t("backend-components.data-grid.delete.confirm-dialog.buttons.yes"),
                    textButtonNo: t("backend-components.data-grid.delete.confirm-dialog.buttons.no"),
                });
            }
        }
        catch (e) {
            // user cancelled
            // eslint-disable-next-line no-console
            console.error(e);
            return;
        }
        try {
            if (enableDeleteAll) {
                await deleteAdvanced([invert, ids, filter]);
            }
            else {
                await deleteMultiple(ids);
            }
            refreshGrid();
        }
        catch (e) {
            refreshGrid();
            if (customDeleteErrorHandler) {
                await customDeleteErrorHandler(e);
            }
            else {
                pushDialog(React.createElement(ErrorDialog, { title: t("backend-components.data-grid.delete.error-dialog.title"), message: t("backend-components.data-grid.delete.error-dialog.message", { ERROR: e.message }), buttons: [
                        {
                            text: t("backend-components.data-grid.delete.error-dialog.buttons.okay"),
                        },
                    ] }));
            }
        }
    }, [
        customDeleteConfirm,
        customDeleteErrorHandler,
        pushDialog,
        t,
        enableDeleteAll,
        refreshGrid,
        deleteAdvanced,
        deleteMultiple,
    ]);
    return enableDelete ? handleDelete : undefined;
};
export const renderDataGridRecordUsingModel = (model, refreshGrid) => (entry) => Object.fromEntries(Object.keys(model.fields)
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
    const { id } = entry;
    // no need to render disabled fields
    if (field.visibility.overview.disabled) {
        return [
            [key, value],
            [key + "_raw", value],
        ];
    }
    return [
        [
            key,
            field
                ? field.type.render({
                    field: key,
                    value: value,
                    touched: false,
                    initialValue: value,
                    label: field.getLabel(),
                    visibility: Object.assign({}, field.visibility.overview, {
                        hidden: false,
                    }),
                    /**
                     * The onChange handler for editable input fields
                     */
                    handleChange: (field, value) => {
                        if (!id)
                            throw new Error("ID not set!");
                        void (async () => {
                            await model.connector.update(await model.applySerialization({
                                id,
                                ...dotToObject(field, value),
                            }, "serialize", "overview"));
                            refreshGrid();
                        })();
                    },
                    setFieldValue: () => {
                        throw new Error("Not implemented in Grid");
                    },
                    handleBlur: () => {
                        // this is unhandled in the data grid
                    },
                    errorMsg: null,
                    warningMsg: null,
                    setError: () => {
                        throw new Error("Not implemented in Grid");
                    },
                    setFieldTouched: () => {
                        throw new Error("Not implemented in Grid");
                    },
                    values: entry,
                })
                : null,
        ],
        [key + "_raw", value],
    ];
})
    .flat());
const BackendDataGrid = (props) => {
    const { model } = props;
    const [refreshToken, setRefreshToken] = useState("");
    const refreshGrid = useCallback(() => setRefreshToken(new Date().getTime().toString()), []);
    const loadData = useCallback(async (params) => {
        const [result, meta] = await model.index(params);
        return {
            rowsTotal: meta.totalRows,
            rowsFiltered: meta.filteredRows,
            rows: result.map(renderDataGridRecordUsingModel(model, refreshGrid)),
        };
    }, [model, refreshGrid]);
    const addNewButtons = useBackendDataGridAddNewButtons(props);
    const handleDelete = useBackendDataGridDeleteHandler(props, refreshGrid);
    return (React.createElement(DataGrid, { ...props, onAddNew: addNewButtons, onDelete: handleDelete, loadData: loadData, columns: useMemo(() => model.toDataGridColumnDefinition(), [model]), forceRefreshToken: `${props.forceRefreshToken || "undefined"}${refreshToken}`, exporters: props.disableExport ? undefined : model.connector.dataGridExporters }));
};
export default React.memo(BackendDataGrid);
