import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from "react";
import { Button, Grid } from "@mui/material";
import useCCTranslations from "../../../utils/useCCTranslations";
import { DataGridCustomFilterIcon, useDataGridProps } from "../DataGrid";
import combineClassNames from "../../../utils/combineClassNames";
import { useCustomFilterActiveContext } from "./FilterBar";
const CustomFiltersButton = (props) => {
    const { classes } = useDataGridProps();
    const customDataChanged = useCustomFilterActiveContext()[0] > 0;
    const { t } = useCCTranslations();
    return (_jsx(Button, { ...props, variant: "outlined", children: _jsxs(Grid, { container: true, spacing: 2, wrap: "nowrap", sx: { justifyContent: "space-evenly", alignItems: "center" }, children: [_jsx(Grid, { children: t("standalone.data-grid.header.custom-filter-button") }), _jsx(Grid, { children: _jsx(DataGridCustomFilterIcon, { className: combineClassNames([
                            classes?.customFilterIcon,
                            customDataChanged && "CcDataGrid-customFilterActiveIcon",
                        ]) }) })] }) }));
};
export default React.memo(CustomFiltersButton);
