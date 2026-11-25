import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from "react";
import { Button, Divider, Grid } from "@mui/material";
import { DataGridContentOverlayClosed, DataGridContentOverlayPaper, DataGridCustomFilterContainer, DataGridCustomFilterDialogTitle, useDataGridProps, } from "../DataGrid";
import useCCTranslations from "../../../utils/useCCTranslations";
import FilterDialogCount from "./FilterDialogCount";
// the footer: the row count, and the buttons at the end of the line
const FOOTER_SX = { alignItems: "center", justifyContent: "flex-end", m: 2 };
// fills the line, but is not squeezed: the buttons wrap below
const COUNT_SX = { flexGrow: 1 };
const BUTTONS_SX = { justifyContent: "flex-end" };
const FilterDialog = (props) => {
    const { classes } = useDataGridProps();
    const { t } = useCCTranslations();
    const { customFilters: Filters, customData, setCustomData, closeFilterDialog, resetCustomData, } = props;
    return (_jsxs(DataGridContentOverlayPaper, { elevation: 0, className: classes?.contentOverlayPaper, children: [_jsx(DataGridCustomFilterDialogTitle, { variant: "h6", className: classes?.customFilterContainerHeader, children: t("standalone.data-grid.custom-filters.title") || "" }), _jsx(Divider, {}), _jsx(DataGridCustomFilterContainer, { sx: { justifyContent: "space-between" }, spacing: 2, container: true, className: classes?.customFilterContainer, children: _jsx(Filters, { customData: customData, setCustomData: setCustomData, inDialog: true }) }), _jsxs(DataGridContentOverlayClosed, { className: classes?.contentOverlayClosed, children: [_jsx(Divider, {}), _jsxs(Grid, { container: true, spacing: 1, sx: FOOTER_SX, children: [_jsx(Grid, { size: "auto", sx: COUNT_SX, children: _jsx(FilterDialogCount, {}) }), _jsxs(Grid, { container: true, spacing: 1, sx: BUTTONS_SX, children: [resetCustomData && (_jsx(Grid, { children: _jsx(Button, { onClick: resetCustomData, children: t("standalone.data-grid.custom-filters.reset") }) })), _jsx(Grid, { children: _jsx(Button, { onClick: closeFilterDialog, variant: "contained", children: t("standalone.data-grid.custom-filters.show-results") }) })] })] })] })] }));
};
export default React.memo(FilterDialog);
