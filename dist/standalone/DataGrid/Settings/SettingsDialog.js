import React from "react";
import { Box, Button, Checkbox, Divider, Grid, Paper, Table, TableBody, TableCell, TableHead, TableRow, } from "@mui/material";
import { useDataGridStyles, } from "../DataGrid";
import useCCTranslations from "../../../utils/useCCTranslations";
var SettingsDialog = function (props) {
    var classes = useDataGridStyles();
    var t = useCCTranslations().t;
    return (React.createElement(Paper, { elevation: 0, className: classes.contentOverlayPaper },
        React.createElement(Table, { stickyHeader: true },
            React.createElement(TableHead, null,
                React.createElement(TableRow, null,
                    React.createElement(TableCell, null, t("standalone.data-grid.settings.column")),
                    React.createElement(TableCell, null, t("standalone.data-grid.settings.show")),
                    React.createElement(TableCell, null, t("standalone.data-grid.settings.pin")))),
            React.createElement(TableBody, null, props.columns.map(function (column) { return (React.createElement(TableRow, { key: column.field },
                React.createElement(TableCell, null, column.headerName),
                React.createElement(TableCell, null,
                    React.createElement(Checkbox, { checked: !props.hiddenColumns.includes(column.field), onChange: props.toggleColumnVisibility, value: column.field })),
                React.createElement(TableCell, null,
                    React.createElement(Checkbox, { checked: props.lockedColumns.includes(column.field), disabled: props.hiddenColumns.includes(column.field) ||
                            column.forcePin, onChange: props.toggleColumnLock, value: column.field })))); }))),
        React.createElement("div", { className: classes.contentOverlayClosed },
            React.createElement(Divider, null),
            React.createElement(Grid, { container: true, justifyContent: "flex-end" },
                React.createElement(Grid, { item: true },
                    React.createElement(Box, { m: 2 },
                        React.createElement(Button, { onClick: props.closeGridSettings, variant: "contained" }, t("standalone.data-grid.settings.close") || "")))))));
};
export default React.memo(SettingsDialog);
