import React from "react";
import { Box, Button, Divider, Grid, Paper, Typography, } from "@material-ui/core";
import { useDataGridStyles } from "../DataGrid";
import useCCTranslations from "../../../utils/useCCTranslations";
var FilterDialog = function (props) {
    var classes = useDataGridStyles();
    var t = useCCTranslations().t;
    var Filters = props.customFilters, customData = props.customData, setCustomData = props.setCustomData;
    return (React.createElement(Paper, { elevation: 0, className: classes.contentOverlayPaper },
        React.createElement(Typography, { variant: "h6" }, t("standalone.data-grid.custom-filters.title") || ""),
        React.createElement(Divider, null),
        React.createElement(Grid, { justify: "space-between", spacing: 2, container: true, className: classes.customFilterContainer },
            React.createElement(Filters, { customData: customData, setCustomData: setCustomData, inDialog: true })),
        React.createElement("div", { className: classes.contentOverlayClosed },
            React.createElement(Divider, null),
            React.createElement(Grid, { container: true, justify: "flex-end" },
                React.createElement(Grid, { item: true },
                    React.createElement(Box, { m: 2 },
                        React.createElement(Button, { onClick: props.closeFilterDialog, variant: "contained" }, t("standalone.data-grid.settings.close") || "")))))));
};
export default React.memo(FilterDialog);
