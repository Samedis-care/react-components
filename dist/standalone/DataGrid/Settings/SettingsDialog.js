import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useMemo } from "react";
import { Box, Button, Checkbox, Divider, Grid, Table, TableBody, TableCell, TableHead, TableRow, styled, } from "@mui/material";
import { DataGridContentOverlayClosed, DataGridContentOverlayPaper, useDataGridProps, } from "../DataGrid";
import useCCTranslations from "../../../utils/useCCTranslations";
const StyledTable = styled(Table, {
    name: "CcDataGrid",
    slot: "settingsTable",
})({});
const StyledTableRow = styled(TableRow, {
    name: "CcDataGrid",
    slot: "settingsTableRow",
})({});
const StyledTableHead = styled(TableHead, {
    name: "CcDataGrid",
    slot: "settingsTableHead",
})({});
const StyledTableBody = styled(TableBody, {
    name: "CcDataGrid",
    slot: "settingsTableBody",
})({});
const StyledTableCell = styled(TableCell, {
    name: "CcDataGrid",
    slot: "settingsTableCell",
})({
    padding: 4,
});
const SettingsDialog = (props) => {
    const { classes } = useDataGridProps();
    const { t } = useCCTranslations();
    const columns = useMemo(() => [...props.columns].sort((a, b) => a.headerName.localeCompare(b.headerName)), [props.columns]);
    return (_jsxs(DataGridContentOverlayPaper, { elevation: 0, className: classes?.contentOverlayPaper, children: [_jsxs(StyledTable, { stickyHeader: true, children: [_jsx(StyledTableHead, { className: classes?.settingsTableHead, children: _jsxs(StyledTableRow, { className: classes?.settingsTableRow, children: [_jsx(StyledTableCell, { className: classes?.settingsTableCell, children: t("standalone.data-grid.settings.column") }), _jsx(StyledTableCell, { className: classes?.settingsTableCell, children: t("standalone.data-grid.settings.show") }), _jsx(StyledTableCell, { className: classes?.settingsTableCell, children: t("standalone.data-grid.settings.pin") })] }) }), _jsx(StyledTableBody, { className: classes?.settingsTableBody, children: columns.map((column) => (_jsxs(StyledTableRow, { className: classes?.settingsTableRow, children: [_jsx(StyledTableCell, { className: classes?.settingsTableCell, children: column.headerName }), _jsx(StyledTableCell, { className: classes?.settingsTableCell, children: _jsx(Checkbox, { checked: !props.hiddenColumns.includes(column.field), onChange: props.toggleColumnVisibility, value: column.field }) }), _jsx(StyledTableCell, { className: classes?.settingsTableCell, children: _jsx(Checkbox, { checked: props.lockedColumns.includes(column.field), disabled: props.hiddenColumns.includes(column.field) ||
                                            column.forcePin, onChange: props.toggleColumnLock, value: column.field }) })] }, column.field))) })] }), _jsxs(DataGridContentOverlayClosed, { className: classes?.contentOverlayClosed, children: [_jsx(Divider, {}), _jsx(Grid, { container: true, sx: { justifyContent: "flex-end" }, children: _jsx(Grid, { children: _jsx(Box, { sx: { m: 2 }, children: _jsx(Button, { onClick: props.closeGridSettings, variant: "contained", children: t("standalone.data-grid.settings.close") || "" }) }) }) })] })] }));
};
export default React.memo(SettingsDialog);
