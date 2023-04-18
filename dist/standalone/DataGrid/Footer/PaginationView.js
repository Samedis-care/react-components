import React from "react";
import { Box, Typography, useMediaQuery, useTheme } from "@mui/material";
import { useDataGridStyles } from "../DataGrid";
import useCCTranslations from "../../../utils/useCCTranslations";
var PaginationView = function (props) {
    var _a;
    var classes = useDataGridStyles();
    var theme = useTheme();
    var isMobile = useMediaQuery(theme.breakpoints.only("xs"));
    var t = useCCTranslations().t;
    var total = props.rowsTotal;
    var filtered = (_a = props.rowsFiltered) !== null && _a !== void 0 ? _a : 0;
    var showFiltered = props.rowsFiltered !== null && props.rowsFiltered !== props.rowsTotal;
    var text = isMobile
        ? showFiltered
            ? "#".concat(filtered, "/").concat(total)
            : "#".concat(total)
        : "".concat(showFiltered
            ? "".concat(t("standalone.data-grid.footer.filtered"), " ").concat(filtered, " ")
            : "").concat(t("standalone.data-grid.footer.total"), " ").concat(total);
    return (React.createElement(Box, { mx: 2 },
        React.createElement(Typography, { className: classes.paginationText }, text)));
};
export default React.memo(PaginationView);
