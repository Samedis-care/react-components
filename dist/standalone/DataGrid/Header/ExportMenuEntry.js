import React, { useCallback, useContext, useState } from "react";
import { CircularProgress, ListItemIcon, ListItemText, MenuItem, } from "@mui/material";
import { Description as ExportIcon, Done as DoneIcon, Error as ErrorIcon, } from "@mui/icons-material";
import { dataGridPrepareFiltersAndSorts } from "../CallbackUtil";
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
    const { search, customData, lockedColumns, hiddenColumns } = state;
    const finishExport = useCallback(() => {
        onDownload(exportData, pushDialog);
        setStatus(DataGridExportStatus.Idle);
        if (!keepExportMenuOpenAfterDownload)
            closeMenu({}, "backdropClick");
    }, [
        onDownload,
        exportData,
        pushDialog,
        closeMenu,
        keepExportMenuOpenAfterDownload,
    ]);
    const startExport = useCallback(async () => {
        setStatus(DataGridExportStatus.Working);
        try {
            const [sorts, fieldFilter] = dataGridPrepareFiltersAndSorts(columnsState);
            const data = await onRequest(search, getAdditionalFilters ? getAdditionalFilters(customData) : {}, fieldFilter, sorts, getActiveDataGridColumns(columns, hiddenColumns, lockedColumns));
            setExportData(data);
            setStatus(DataGridExportStatus.Ready);
            if (autoDownload)
                finishExport();
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
        hiddenColumns,
        lockedColumns,
        onError,
        autoDownload,
        finishExport,
    ]);
    const cancelExport = useCallback(() => {
        setStatus(DataGridExportStatus.Idle);
    }, [setStatus]);
    return (React.createElement(React.Fragment, null,
        status === DataGridExportStatus.Idle && (React.createElement(MenuItem, { onClick: startExport, ref: ref },
            React.createElement(ListItemIcon, null,
                React.createElement(IdleIcon, null)),
            React.createElement(ListItemText, { primary: exporter.getLabel() }))),
        status === DataGridExportStatus.Working && (React.createElement(MenuItem, { ref: ref },
            React.createElement(ListItemIcon, null,
                React.createElement(CircularProgress, { size: 24 })),
            React.createElement(ListItemText, { primary: exporter.getWorkingLabel() }))),
        status === DataGridExportStatus.Ready && (React.createElement(MenuItem, { onClick: finishExport, ref: ref },
            React.createElement(ListItemIcon, null,
                React.createElement(DoneIcon, null)),
            React.createElement(ListItemText, { primary: exporter.getReadyLabel() }))),
        status === DataGridExportStatus.Error && (React.createElement(MenuItem, { onClick: cancelExport, ref: ref },
            React.createElement(ListItemIcon, null,
                React.createElement(ErrorIcon, null)),
            React.createElement(ListItemText, { primary: exporter.getErrorLabel() })))));
});
export default React.memo(ExportMenuEntry);
