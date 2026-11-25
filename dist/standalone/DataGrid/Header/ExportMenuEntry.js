import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useCallback, useContext, useState } from "react";
import { CircularProgress, ListItemIcon, ListItemText, MenuItem, } from "@mui/material";
import { Description as ExportIcon, Done as DoneIcon, Error as ErrorIcon, } from "@mui/icons-material";
import { dataGridGetFilterParameters, dataGridPrepareFiltersAndSorts, } from "../CallbackUtil";
import { getActiveDataGridColumns, useDataGridColumnState, useDataGridProps, useDataGridState, } from "../DataGrid";
import { DialogContext } from "../../../framework";
export var DataGridExportStatus;
(function (DataGridExportStatus) {
    DataGridExportStatus[DataGridExportStatus["Idle"] = 0] = "Idle";
    DataGridExportStatus[DataGridExportStatus["Working"] = 1] = "Working";
    DataGridExportStatus[DataGridExportStatus["Ready"] = 2] = "Ready";
    DataGridExportStatus[DataGridExportStatus["Error"] = 3] = "Error";
})(DataGridExportStatus || (DataGridExportStatus = {}));
// eslint-disable-next-line react/display-name
const ExportMenuEntry = React.forwardRef((props, ref) => {
    const { exporter, closeMenu } = props;
    const { getAdditionalFilters, columns, onError, keepExportMenuOpenAfterDownload, } = useDataGridProps();
    const [columnsState] = useDataGridColumnState();
    const [state] = useDataGridState();
    const [pushDialog] = useContext(DialogContext) ?? [];
    const [status, setStatus] = useState(DataGridExportStatus.Idle);
    const [exportData, setExportData] = useState(undefined);
    const IdleIcon = props.exporter.icon || ExportIcon;
    const { onRequest, onDownload, autoDownload } = props.exporter;
    const { search, customData, columnPinned, columnHidden } = state;
    // gets the data passed: right after the request, the state still holds
    // the previous export's data
    const download = useCallback((data) => {
        onDownload(data, pushDialog);
        setStatus(DataGridExportStatus.Idle);
        if (!keepExportMenuOpenAfterDownload)
            closeMenu({}, "backdropClick");
    }, [onDownload, pushDialog, closeMenu, keepExportMenuOpenAfterDownload]);
    const finishExport = useCallback(() => download(exportData), [download, exportData]);
    const startExport = useCallback(async () => {
        setStatus(DataGridExportStatus.Working);
        try {
            const [sorts] = dataGridPrepareFiltersAndSorts(columnsState);
            const { quickFilter, additionalFilters, fieldFilter } = dataGridGetFilterParameters({ search, customData }, columnsState, getAdditionalFilters);
            const data = await onRequest(quickFilter, additionalFilters, fieldFilter, sorts, getActiveDataGridColumns(columns, columnHidden, columnPinned));
            setExportData(data);
            setStatus(DataGridExportStatus.Ready);
            if (autoDownload)
                download(data);
        }
        catch (e) {
            // eslint-disable-next-line no-console
            console.error("[Components-Care] DataGrid Export failed", e);
            if (onError)
                onError(e);
            setExportData(e);
            setStatus(DataGridExportStatus.Error);
        }
    }, [
        columnsState,
        onRequest,
        search,
        getAdditionalFilters,
        customData,
        columns,
        columnHidden,
        columnPinned,
        onError,
        autoDownload,
        download,
    ]);
    const cancelExport = useCallback(() => {
        setStatus(DataGridExportStatus.Idle);
    }, [setStatus]);
    // one item for every status, so the item keeps keyboard focus while its
    // icon, label and click handler change
    let icon;
    let label;
    // startExport returns a promise; it catches a failed request itself
    let onClick;
    switch (status) {
        case DataGridExportStatus.Idle:
            icon = _jsx(IdleIcon, {});
            label = exporter.getLabel();
            onClick = startExport;
            break;
        case DataGridExportStatus.Working:
            icon = _jsx(CircularProgress, { size: 24 });
            label = exporter.getWorkingLabel();
            onClick = undefined;
            break;
        case DataGridExportStatus.Ready:
            icon = _jsx(DoneIcon, {});
            label = exporter.getReadyLabel();
            onClick = finishExport;
            break;
        case DataGridExportStatus.Error:
            icon = _jsx(ErrorIcon, {});
            label = exporter.getErrorLabel();
            onClick = cancelExport;
            break;
    }
    return (_jsxs(MenuItem, { onClick: onClick, ref: ref, children: [_jsx(ListItemIcon, { children: icon }), _jsx(ListItemText, { primary: label })] }));
});
export default React.memo(ExportMenuEntry);
