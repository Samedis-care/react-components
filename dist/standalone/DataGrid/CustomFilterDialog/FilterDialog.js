import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from "react";
import { Box, Button, Divider, Grid } from "@mui/material";
import { DataGridContentOverlayClosed, DataGridContentOverlayPaper, DataGridCustomFilterContainer, DataGridCustomFilterDialogTitle, useDataGridProps, } from "../DataGrid";
import useCCTranslations from "../../../utils/useCCTranslations";
const FilterDialog = (props) => {
    const { classes } = useDataGridProps();
    const { t } = useCCTranslations();
    const { customFilters: Filters, customData, setCustomData } = props;
    return (_jsxs(DataGridContentOverlayPaper, { elevation: 0, className: classes?.contentOverlayPaper, children: [_jsx(DataGridCustomFilterDialogTitle, { variant: "h6", className: classes?.customFilterContainerHeader, children: t("standalone.data-grid.custom-filters.title") || "" }), _jsx(Divider, {}), _jsx(DataGridCustomFilterContainer, { sx: { justifyContent: "space-between" }, spacing: 2, container: true, className: classes?.customFilterContainer, children: _jsx(Filters, { customData: customData, setCustomData: setCustomData, inDialog: true }) }), _jsxs(DataGridContentOverlayClosed, { className: classes?.contentOverlayClosed, children: [_jsx(Divider, {}), _jsx(Grid, { container: true, sx: { justifyContent: "flex-end" }, children: _jsx(Grid, { children: _jsx(Box, { sx: { m: 2 }, children: _jsx(Button, { onClick: props.closeFilterDialog, variant: "contained", children: t("standalone.data-grid.settings.close") || "" }) }) }) })] })] }));
};
export default React.memo(FilterDialog);
