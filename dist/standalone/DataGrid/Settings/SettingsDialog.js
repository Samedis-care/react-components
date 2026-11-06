import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useId, useMemo } from "react";
import { Box, Button, Divider, Grid, Table, TableBody, TableCell, TableHead, TableRow, styled, } from "@mui/material";
import { DataGridContentOverlayClosed, DataGridContentOverlayPaper, isDataGridColumnPinned, useDataGridProps, } from "../DataGrid";
import useCCTranslations from "../../../utils/useCCTranslations";
import SettingsCheckbox from "./SettingsCheckbox";
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
// announces that no column matches the column search (a live region must
// exist before its text changes, so it is always rendered)
const StyledStatus = styled("span", {
    name: "CcDataGrid",
    slot: "settingsStatus",
})({
    // visually hidden, as MUI's visuallyHidden
    border: 0,
    clipPath: "inset(50%)",
    height: 1,
    margin: -1,
    overflow: "hidden",
    padding: 0,
    position: "absolute",
    whiteSpace: "nowrap",
    width: 1,
});
const SettingsDialog = (props) => {
    const { classes } = useDataGridProps();
    const { t } = useCCTranslations();
    const id = useId();
    const visibleHeaderId = `${id}-visible`;
    const pinHeaderId = `${id}-pin`;
    const pinHiddenReasonId = `${id}-pin-hidden`;
    const pinForcedReasonId = `${id}-pin-forced`;
    const columns = useMemo(() => [...props.columns].sort((a, b) => a.headerName.localeCompare(b.headerName)), [props.columns]);
    // the column search matches no column
    const noMatch = columns.length === 0;
    return (_jsxs(DataGridContentOverlayPaper, { elevation: 0, className: classes?.contentOverlayPaper, children: [_jsxs(StyledTable, { stickyHeader: true, "aria-label": t("standalone.data-grid.header.settings"), children: [_jsx(StyledTableHead, { className: classes?.settingsTableHead, children: _jsxs(StyledTableRow, { className: classes?.settingsTableRow, children: [_jsx(StyledTableCell, { className: classes?.settingsTableCell, children: t("standalone.data-grid.settings.column") }), _jsx(StyledTableCell, { id: visibleHeaderId, className: classes?.settingsTableCell, children: t("standalone.data-grid.settings.show") }), _jsx(StyledTableCell, { id: pinHeaderId, className: classes?.settingsTableCell, children: t("standalone.data-grid.settings.pin") })] }) }), _jsxs(StyledTableBody, { className: classes?.settingsTableBody, children: [columns.map((column, index) => {
                                const rowHeaderId = `${id}-row-${index}`;
                                const hidden = !!props.columnHidden[column.field];
                                // why the column's pin cannot be changed
                                const pinReasonId = column.forcePin
                                    ? pinForcedReasonId
                                    : hidden
                                        ? pinHiddenReasonId
                                        : undefined;
                                return (_jsxs(StyledTableRow, { className: classes?.settingsTableRow, children: [_jsx(StyledTableCell, { component: "th", scope: "row", id: rowHeaderId, className: classes?.settingsTableCell, children: column.headerName }), _jsx(StyledTableCell, { className: classes?.settingsTableCell, children: _jsx(SettingsCheckbox, { field: column.field, checked: !hidden, onChange: props.toggleColumnVisibility, labelledBy: `${visibleHeaderId} ${rowHeaderId}` }) }), _jsx(StyledTableCell, { className: classes?.settingsTableCell, children: _jsx(SettingsCheckbox, { field: column.field, checked: isDataGridColumnPinned(column, props.columnPinned), disabled: !!pinReasonId, onChange: props.toggleColumnLock, labelledBy: `${pinHeaderId} ${rowHeaderId}`, describedBy: pinReasonId }) })] }, column.field));
                            }), noMatch && (_jsx(StyledTableRow, { className: classes?.settingsTableRow, children: _jsx(StyledTableCell, { colSpan: 3, className: classes?.settingsTableCell, children: t("standalone.data-grid.settings.no-match") }) }))] })] }), _jsx(StyledStatus, { role: "status", className: classes?.settingsStatus, children: noMatch && t("standalone.data-grid.settings.no-match") }), _jsx("span", { hidden: true, id: pinHiddenReasonId, children: t("standalone.data-grid.settings.pin-hidden") }), _jsx("span", { hidden: true, id: pinForcedReasonId, children: t("standalone.data-grid.settings.pin-forced") }), _jsxs(DataGridContentOverlayClosed, { className: classes?.contentOverlayClosed, children: [_jsx(Divider, {}), _jsx(Grid, { container: true, sx: { justifyContent: "flex-end" }, children: _jsx(Grid, { children: _jsx(Box, { sx: { m: 2 }, children: _jsx(Button, { onClick: props.closeGridSettings, variant: "contained", children: t("standalone.data-grid.settings.close") || "" }) }) }) })] })] }));
};
export default React.memo(SettingsDialog);
