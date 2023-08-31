import React from "react";
import { Box, Typography, useMediaQuery, useTheme } from "@mui/material";
import { useDataGridStyles } from "../DataGrid";
import useCCTranslations from "../../../utils/useCCTranslations";
const PaginationView = (props) => {
    const classes = useDataGridStyles();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.only("xs"));
    const { t } = useCCTranslations();
    const total = props.rowsTotal;
    const filtered = props.rowsFiltered ?? 0;
    const showFiltered = props.rowsFiltered !== null && props.rowsFiltered !== props.rowsTotal;
    const text = isMobile
        ? showFiltered
            ? `#${filtered}/${total}`
            : `#${total}`
        : `${showFiltered
            ? `${t("standalone.data-grid.footer.filtered")} ${filtered} `
            : ""}${t("standalone.data-grid.footer.total")} ${total}`;
    return (React.createElement(Box, { mx: 2 },
        React.createElement(Typography, { className: classes.paginationText }, text)));
};
export default React.memo(PaginationView);
