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
    return (React.createElement(DataGridContentOverlayPaper, { elevation: 0, className: classes?.contentOverlayPaper },
        React.createElement(StyledTable, { stickyHeader: true },
            React.createElement(StyledTableHead, { className: classes?.settingsTableHead },
                React.createElement(StyledTableRow, { className: classes?.settingsTableRow },
                    React.createElement(StyledTableCell, { className: classes?.settingsTableCell }, t("standalone.data-grid.settings.column")),
                    React.createElement(StyledTableCell, { className: classes?.settingsTableCell }, t("standalone.data-grid.settings.show")),
                    React.createElement(StyledTableCell, { className: classes?.settingsTableCell }, t("standalone.data-grid.settings.pin")))),
            React.createElement(StyledTableBody, { className: classes?.settingsTableBody }, columns.map((column) => (React.createElement(StyledTableRow, { key: column.field, className: classes?.settingsTableRow },
                React.createElement(StyledTableCell, { className: classes?.settingsTableCell }, column.headerName),
                React.createElement(StyledTableCell, { className: classes?.settingsTableCell },
                    React.createElement(Checkbox, { checked: !props.hiddenColumns.includes(column.field), onChange: props.toggleColumnVisibility, value: column.field })),
                React.createElement(StyledTableCell, { className: classes?.settingsTableCell },
                    React.createElement(Checkbox, { checked: props.lockedColumns.includes(column.field), disabled: props.hiddenColumns.includes(column.field) ||
                            column.forcePin, onChange: props.toggleColumnLock, value: column.field }))))))),
        React.createElement(DataGridContentOverlayClosed, { className: classes?.contentOverlayClosed },
            React.createElement(Divider, null),
            React.createElement(Grid, { container: true, justifyContent: "flex-end" },
                React.createElement(Grid, null,
                    React.createElement(Box, { m: 2 },
                        React.createElement(Button, { onClick: props.closeGridSettings, variant: "contained" }, t("standalone.data-grid.settings.close") || "")))))));
};
export default React.memo(SettingsDialog);
