import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React, { useCallback, useContext, useId, useMemo, useState, } from "react";
import { createPortal } from "react-dom";
import { CircularProgress, ListItemIcon, ListItemText, MenuItem, styled, } from "@mui/material";
import { Description as ExportIcon, Done as DoneIcon, Error as ErrorIcon, } from "@mui/icons-material";
import { dataGridGetFilterParameters, dataGridPrepareFiltersAndSorts, } from "../CallbackUtil";
import { getActiveDataGridColumns, useDataGridColumnState, useDataGridProps, useDataGridState, } from "../DataGrid";
import { DialogContext } from "../../../framework";
import visuallyHidden from "../../../utils/internal/visuallyHidden";
export var DataGridExportStatus;
(function (DataGridExportStatus) {
    DataGridExportStatus[DataGridExportStatus["Idle"] = 0] = "Idle";
    DataGridExportStatus[DataGridExportStatus["Working"] = 1] = "Working";
    DataGridExportStatus[DataGridExportStatus["Ready"] = 2] = "Ready";
    DataGridExportStatus[DataGridExportStatus["Error"] = 3] = "Error";
})(DataGridExportStatus || (DataGridExportStatus = {}));
// the entry's status region inside the menu (a live region must exist before
// its text changes, so it is always rendered)
const EntryStatus = styled("span")(visuallyHidden);
/**
 * An entry of the export menu: requests the export, shows that it runs (then
 * it is unavailable, aria-disabled, and keeps focus), that it is ready (a
 * click downloads it) or that it failed (a click returns to the start).
 *
 * Ready and failed are announced by a polite status region that holds the
 * ready or error label while the entry shows it. The entry has two of them:
 * while the menu is open, MUI hides the rest of the page from assistive
 * technology, and while it is closed, the menu. One is in the entry, the other
 * one outside the menu, in statusContainer, so one of them is always exposed.
 */
// eslint-disable-next-line react/display-name
const ExportMenuEntry = React.forwardRef((props, ref) => {
    const { exporter, closeMenu, statusContainer } = props;
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
    // the label alone names the entry, without the status in it
    const labelId = useId();
    const labelSlotProps = useMemo(() => ({ primary: { id: labelId } }), [labelId]);
    // one item for every status, so the item keeps keyboard focus while its
    // icon, label and click handler change
    let icon;
    let label;
    // startExport returns a promise; it catches a failed request itself
    let onClick;
    // what the status regions say: the outcome of the export
    let statusText = "";
    switch (status) {
        case DataGridExportStatus.Idle:
            icon = _jsx(IdleIcon, {});
            label = exporter.getLabel();
            onClick = startExport;
            break;
        case DataGridExportStatus.Working:
            // hidden from assistive technology: the label says that it runs
            icon = _jsx(CircularProgress, { size: 24, "aria-hidden": true });
            label = exporter.getWorkingLabel();
            onClick = undefined;
            break;
        case DataGridExportStatus.Ready:
            icon = _jsx(DoneIcon, {});
            label = exporter.getReadyLabel();
            onClick = finishExport;
            statusText = label;
            break;
        case DataGridExportStatus.Error:
            icon = _jsx(ErrorIcon, {});
            label = exporter.getErrorLabel();
            onClick = cancelExport;
            statusText = label;
            break;
    }
    return (_jsxs(_Fragment, { children: [_jsxs(MenuItem, { onClick: onClick, ref: ref, "aria-disabled": status === DataGridExportStatus.Working || undefined, "aria-labelledby": labelId, children: [_jsx(ListItemIcon, { children: icon }), _jsx(ListItemText, { primary: label, slotProps: labelSlotProps }), _jsx(EntryStatus, { role: "status", children: statusText })] }), statusContainer &&
                createPortal(_jsx("span", { role: "status", children: statusText }), statusContainer)] }));
});
export default React.memo(ExportMenuEntry);
