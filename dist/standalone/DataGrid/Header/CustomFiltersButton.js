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
    return (React.createElement(Button, { ...props, variant: "outlined" },
        React.createElement(Grid, { container: true, spacing: 2, wrap: "nowrap", justifyContent: "space-evenly", alignItems: "center" },
            React.createElement(Grid, { item: true }, t("standalone.data-grid.header.custom-filter-button")),
            React.createElement(Grid, { item: true },
                React.createElement(DataGridCustomFilterIcon, { className: combineClassNames([
                        classes?.customFilterIcon,
                        customDataChanged && "CcDataGrid-customFilterActiveIcon",
                    ]) })))));
};
export default React.memo(CustomFiltersButton);
