import React, { useMemo } from "react";
import { Box, Button, Checkbox, Divider, Grid, Table, TableBody, TableCell, TableHead, TableRow, styled, } from "@mui/material";
import { DataGridContentOverlayClosed, DataGridContentOverlayPaper, useDataGridProps, } from "../DataGrid";
import useCCTranslations from "../../../utils/useCCTranslations";
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
        React.createElement(Table, { stickyHeader: true },
            React.createElement(TableHead, null,
                React.createElement(TableRow, null,
                    React.createElement(StyledTableCell, null, t("standalone.data-grid.settings.column")),
                    React.createElement(StyledTableCell, null, t("standalone.data-grid.settings.show")),
                    React.createElement(StyledTableCell, null, t("standalone.data-grid.settings.pin")))),
            React.createElement(TableBody, null, columns.map((column) => (React.createElement(TableRow, { key: column.field },
                React.createElement(StyledTableCell, null, column.headerName),
                React.createElement(StyledTableCell, null,
                    React.createElement(Checkbox, { checked: !props.hiddenColumns.includes(column.field), onChange: props.toggleColumnVisibility, value: column.field })),
                React.createElement(StyledTableCell, null,
                    React.createElement(Checkbox, { checked: props.lockedColumns.includes(column.field), disabled: props.hiddenColumns.includes(column.field) ||
                            column.forcePin, onChange: props.toggleColumnLock, value: column.field }))))))),
        React.createElement(DataGridContentOverlayClosed, { className: classes?.contentOverlayClosed },
            React.createElement(Divider, null),
            React.createElement(Grid, { container: true, justifyContent: "flex-end" },
                React.createElement(Grid, { item: true },
                    React.createElement(Box, { m: 2 },
                        React.createElement(Button, { onClick: props.closeGridSettings, variant: "contained" }, t("standalone.data-grid.settings.close") || "")))))));
};
export default React.memo(SettingsDialog);
