import React from "react";
import { Button, Grid } from "@mui/material";
import { AppsIcon } from "../../Icons";
import useCCTranslations from "../../../utils/useCCTranslations";
import { useDataGridStyles } from "../DataGrid";
import combineClassNames from "../../../utils/combineClassNames";
import { useCustomFilterActiveContext } from "./FilterBar";
const CustomFiltersButton = (props) => {
    const classes = useDataGridStyles();
    const customDataChanged = useCustomFilterActiveContext()[0] > 0;
    const { t } = useCCTranslations();
    return (React.createElement(Button, { ...props, variant: "outlined" },
        React.createElement(Grid, { container: true, spacing: 2, wrap: "nowrap", justifyContent: "space-evenly", alignItems: "center" },
            React.createElement(Grid, { item: true }, t("standalone.data-grid.header.custom-filter-button")),
            React.createElement(Grid, { item: true },
                React.createElement(AppsIcon, { className: combineClassNames([
                        classes.customFilterIcon,
                        customDataChanged && classes.customFilterActiveIcon,
                    ]) })))));
};
export default React.memo(CustomFiltersButton);
