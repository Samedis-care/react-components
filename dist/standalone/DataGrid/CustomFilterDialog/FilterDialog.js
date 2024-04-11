import React from "react";
import { Box, Button, Divider, Grid, Typography } from "@mui/material";
import { DataGridContentOverlayClosed, DataGridContentOverlayPaper, DataGridCustomFilterContainer, useDataGridProps, } from "../DataGrid";
import useCCTranslations from "../../../utils/useCCTranslations";
const FilterDialog = (props) => {
    const { classes } = useDataGridProps();
    const { t } = useCCTranslations();
    const { customFilters: Filters, customData, setCustomData } = props;
    return (React.createElement(DataGridContentOverlayPaper, { elevation: 0, className: classes?.contentOverlayPaper },
        React.createElement(Typography, { variant: "h6" }, t("standalone.data-grid.custom-filters.title") || ""),
        React.createElement(Divider, null),
        React.createElement(DataGridCustomFilterContainer, { justifyContent: "space-between", spacing: 2, container: true, className: classes?.customFilterContainer },
            React.createElement(Filters, { customData: customData, setCustomData: setCustomData, inDialog: true })),
        React.createElement(DataGridContentOverlayClosed, { className: classes?.contentOverlayClosed },
            React.createElement(Divider, null),
            React.createElement(Grid, { container: true, justifyContent: "flex-end" },
                React.createElement(Grid, { item: true },
                    React.createElement(Box, { m: 2 },
                        React.createElement(Button, { onClick: props.closeFilterDialog, variant: "contained" }, t("standalone.data-grid.settings.close") || "")))))));
};
export default React.memo(FilterDialog);
